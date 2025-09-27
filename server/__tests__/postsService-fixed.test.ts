import { PostsService } from '../services/postsService';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { Category } from '../entities/Category';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '../config/database';
import { PostCreateRequest, PostUpdateRequest } from '../types/types';

// Mock dependencies
jest.mock('../config/database');

describe('PostsService', () => {
  let postsService: PostsService;
  let mockPostRepository: jest.Mocked<Repository<Post>>;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockCategoryRepository: jest.Mocked<Repository<Category>>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Post>>;

  beforeEach(() => {
    // Create mock repositories
    mockPostRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as any;

    mockUserRepository = {
      findOne: jest.fn(),
    } as any;

    mockCategoryRepository = {
      findOne: jest.fn(),
    } as any;

    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getOne: jest.fn(),
    } as any;

    // Mock AppDataSource.getRepository to return our mock repositories
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Post) return mockPostRepository;
      if (entity === User) return mockUserRepository;
      if (entity === Category) return mockCategoryRepository;
      return null;
    });

    mockPostRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    postsService = new PostsService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPosts', () => {
    it('should return paginated posts successfully', async () => {
      const mockPosts = [
        {
          id: '1',
          header: 'Test Post 1',
          content: 'Test content 1',
          isPublished: true,
          authorId: '1',
          author: { id: '1', email: 'test@test.com' },
          createdAt: new Date(),
          readingTime: 1,
          viewsCount: 0,
          likesCount: 0,
          isFeatured: false,
          deleted: false,
          updatedAt: new Date(),
        },
      ] as unknown as Post[];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPosts, 1]);

      const result = await postsService.getAllPosts(0, 10);

      expect(result).toEqual({
        data: mockPosts,
        total: 1,
        page: 0,
        size: 10,
        totalPages: 1,
      });

      expect(mockPostRepository.createQueryBuilder).toHaveBeenCalledWith('post');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('post.deleted = :deleted', { deleted: false });
    });

    it('should filter posts by category when provided', async () => {
      const mockPosts: Post[] = [];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPosts, 0]);

      await postsService.getAllPosts(0, 10, 'tech');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(post.category) = LOWER(:category)',
        { category: 'tech' }
      );
    });

    it('should handle errors gracefully', async () => {
      mockQueryBuilder.getManyAndCount.mockRejectedValue(new Error('Database error'));

      await expect(postsService.getAllPosts()).rejects.toThrow('Database error');
    });
  });

  describe('getPostById', () => {
    it('should return a post by id successfully', async () => {
      const mockPost = {
        id: '1',
        header: 'Test Post',
        content: 'Test content',
        slug: 'test-post',
        isPublished: true,
        authorId: '1',
        author: { id: '1', email: 'test@test.com' },
        createdAt: new Date(),
        readingTime: 1,
        viewsCount: 0,
        likesCount: 0,
        isFeatured: false,
        deleted: false,
        updatedAt: new Date(),
      } as unknown as Post;

      mockQueryBuilder.getOne.mockResolvedValue(mockPost);

      const result = await postsService.getPostById('1');

      expect(result).toEqual(mockPost);
      expect(mockPostRepository.createQueryBuilder).toHaveBeenCalledWith('post');
    });

    it('should return null when post is not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await postsService.getPostById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const mockUser = { id: '1', email: 'test@test.com' } as User;
      const mockPostData: PostCreateRequest = {
        header: 'New Post',
        content: 'New post content for testing',
        category: 'Tech',
        is_published: true,
      };

      const expectedPost = {
        id: '1',
        header: 'New Post',
        content: 'New post content for testing',
        slug: 'new-post',
        category: 'Tech',
        isPublished: true,
        readingTime: 1,
        authorId: '1',
        author: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewsCount: 0,
        likesCount: 0,
        isFeatured: false,
        deleted: false,
      } as unknown as Post;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockPostRepository.create.mockReturnValue(expectedPost);
      mockPostRepository.save.mockResolvedValue(expectedPost);

      const result = await postsService.createPost(mockPostData, '1');

      expect(result).toEqual(expectedPost);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockPostRepository.save).toHaveBeenCalled();
    });

    it('should throw error when user is not found', async () => {
      const mockPostData: PostCreateRequest = {
        header: 'New Post',
        content: 'New post content',
        category: 'Tech',
        is_published: true,
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(postsService.createPost(mockPostData, 'nonexistent')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      const mockPost = {
        id: '1',
        header: 'Old Header',
        content: 'Old content',
        category: 'Old Category',
        isPublished: false,
        authorId: '1',
        readingTime: 1,
        viewsCount: 0,
        likesCount: 0,
        isFeatured: false,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Post;

      const updateData: PostUpdateRequest = {
        header: 'Updated Header',
        content: 'Updated content',
        category: 'Updated Category',
        is_published: true,
      };

      const updatedPost = {
        ...mockPost,
        header: updateData.header,
        content: updateData.content,
        category: updateData.category,
        isPublished: updateData.is_published,
        slug: 'updated-header',
        readingTime: 1,
      } as unknown as Post;

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.save.mockResolvedValue(updatedPost);

      const result = await postsService.updatePost('1', updateData, '1');

      expect(result).toEqual(updatedPost);
      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', deleted: false },
      });
      expect(mockPostRepository.save).toHaveBeenCalled();
    });

    it('should throw error when post is not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      const updateData: PostUpdateRequest = { header: 'Updated Header' };

      await expect(postsService.updatePost('nonexistent', updateData, '1')).rejects.toThrow(
        'Post not found'
      );
    });
  });

  describe('deletePost', () => {
    it('should soft delete a post successfully', async () => {
      const mockPost = {
        id: '1',
        authorId: '1',
        deleted: false,
      } as unknown as Post;

      const deletedPost = {
        ...mockPost,
        deleted: true,
      } as unknown as Post;

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.save.mockResolvedValue(deletedPost);

      const result = await postsService.deletePost('1', '1');

      expect(result).toBe(true);
      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', deleted: false },
      });
    });

    it('should throw error when post is not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(postsService.deletePost('nonexistent', '1')).rejects.toThrow('Post not found');
    });
  });
});
