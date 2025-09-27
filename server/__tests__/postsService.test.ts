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
      remove: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findBy: jest.fn(),
      findAndCount: jest.fn(),
    } as any;

    mockUserRepository = {
      findOne: jest.fn(),
      findBy: jest.fn(),
    } as any;

    mockCategoryRepository = {
      findOne: jest.fn(),
      findBy: jest.fn(),
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
      getMany: jest.fn(),
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
      const mockPosts: Partial<Post>[] = [
        {
          id: '1',
          header: 'Test Post 1',
          content: 'Test content 1',
          isPublished: true,
          authorId: '1',
          author: { id: '1', email: 'test@test.com' } as User,
          createdAt: new Date(),
          readingTime: 1,
        },
        {
          id: '2',
          header: 'Test Post 2',
          content: 'Test content 2',
          isPublished: true,
          authorId: '2',
          author: { id: '2', email: 'test2@test.com' } as User,
          createdAt: new Date(),
          readingTime: 1,
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPosts as Post[], 2]);

      const result = await postsService.getAllPosts(0, 10);

      expect(result).toEqual({
        data: mockPosts,
        total: 2,
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

    it('should handle user-specific posts when userId is provided', async () => {
      const mockPosts: Post[] = [];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPosts, 0]);

      await postsService.getAllPosts(0, 10, undefined, 'user123');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(post.isPublished = :published OR (post.isPublished = :unpublished AND post.authorId = :userId))',
        { published: true, unpublished: false, userId: 'user123' }
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
        text: 'Test content',
        slug: 'test-post',
        isPublished: true,
        author: { id: '1', email: 'test@test.com' },
        createdAt: new Date(),
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockPost);

      const result = await postsService.getPostById('1');

      expect(result).toEqual(mockPost);
      expect(mockPostRepository.createQueryBuilder).toHaveBeenCalledWith('post');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('post.id = :id AND post.deleted = :deleted', {
        id: '1',
        deleted: false,
      });
    });

    it('should return null when post is not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await postsService.getPostById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockQueryBuilder.getOne.mockRejectedValue(new Error('Database error'));

      await expect(postsService.getPostById('1')).rejects.toThrow('Database error');
    });
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const mockUser = { id: '1', email: 'test@test.com' };
      const mockCategory = { id: '1', name: 'Tech' };
      const mockPostData = {
        header: 'New Post',
        text: 'New post content for testing reading time calculation',
        category: 'Tech',
        isPublished: true,
      };

      const expectedPost = {
        id: '1',
        header: 'New Post',
        text: 'New post content for testing reading time calculation',
        slug: 'new-post',
        category: 'Tech',
        isPublished: true,
        readingTime: 1,
        author: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser as User);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory as Category);
      mockPostRepository.create.mockReturnValue(expectedPost as Post);
      mockPostRepository.save.mockResolvedValue(expectedPost as Post);

      const result = await postsService.createPost(mockPostData, '1');

      expect(result).toEqual(expectedPost);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockPostRepository.save).toHaveBeenCalled();
    });

    it('should throw error when user is not found', async () => {
      const mockPostData = {
        header: 'New Post',
        text: 'New post content',
        category: 'Tech',
        isPublished: true,
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(postsService.createPost(mockPostData, 'nonexistent')).rejects.toThrow(
        'User not found'
      );
    });

    it('should create post with default category when category not found', async () => {
      const mockUser = { id: '1', email: 'test@test.com' };
      const mockPostData = {
        header: 'New Post',
        text: 'New post content',
        category: 'NonExistentCategory',
        isPublished: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser as User);
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockPostRepository.create.mockReturnValue({} as Post);
      mockPostRepository.save.mockResolvedValue({} as Post);

      await postsService.createPost(mockPostData, '1');

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'NonExistentCategory' },
      });
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      const mockPost = {
        id: '1',
        header: 'Old Header',
        text: 'Old content',
        category: 'Old Category',
        isPublished: false,
        authorId: '1',
      };

      const updateData = {
        header: 'Updated Header',
        text: 'Updated content',
        category: 'Updated Category',
        isPublished: true,
      };

      const updatedPost = {
        ...mockPost,
        ...updateData,
        slug: 'updated-header',
        readingTime: 1,
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost as Post);
      mockPostRepository.save.mockResolvedValue(updatedPost as Post);

      const result = await postsService.updatePost('1', updateData, '1');

      expect(result).toEqual(updatedPost);
      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', deleted: false },
      });
      expect(mockPostRepository.save).toHaveBeenCalled();
    });

    it('should throw error when post is not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      const updateData = { header: 'Updated Header' };

      await expect(postsService.updatePost('nonexistent', updateData, '1')).rejects.toThrow(
        'Post not found'
      );
    });

    it('should throw error when user is not authorized', async () => {
      const mockPost = {
        id: '1',
        authorId: '1',
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost as Post);

      const updateData = { header: 'Updated Header' };

      await expect(postsService.updatePost('1', updateData, '2')).rejects.toThrow(
        'Not authorized to update this post'
      );
    });
  });

  describe('deletePost', () => {
    it('should soft delete a post successfully', async () => {
      const mockPost = {
        id: '1',
        authorId: '1',
        deleted: false,
      };

      const deletedPost = {
        ...mockPost,
        deleted: true,
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost as Post);
      mockPostRepository.save.mockResolvedValue(deletedPost as Post);

      const result = await postsService.deletePost('1', '1');

      expect(result).toBe(true);
      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', deleted: false },
      });
      expect(mockPostRepository.save).toHaveBeenCalledWith({
        ...mockPost,
        deleted: true,
      });
    });

    it('should throw error when post is not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(postsService.deletePost('nonexistent', '1')).rejects.toThrow('Post not found');
    });

    it('should throw error when user is not authorized', async () => {
      const mockPost = {
        id: '1',
        authorId: '1',
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost as Post);

      await expect(postsService.deletePost('1', '2')).rejects.toThrow(
        'Not authorized to delete this post'
      );
    });
  });

  describe('Private methods', () => {
    it('should create slug correctly', () => {
      // Test the private createSlug method indirectly through createPost
      const mockUser = { id: '1', email: 'test@test.com' };
      const mockPostData = {
        header: 'Test Post With Special Characters!@#$%',
        text: 'Test content',
        category: 'Tech',
        isPublished: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser as User);
      mockCategoryRepository.findOne.mockResolvedValue(null);
      
      const mockCreatedPost = {
        header: mockPostData.header,
        slug: 'test-post-with-special-characters',
      };
      
      mockPostRepository.create.mockReturnValue(mockCreatedPost as Post);
      mockPostRepository.save.mockResolvedValue(mockCreatedPost as Post);

      expect(postsService.createPost(mockPostData, '1')).resolves.toMatchObject({
        slug: 'test-post-with-special-characters',
      });
    });

    it('should calculate reading time correctly', async () => {
      const mockUser = { id: '1', email: 'test@test.com' };
      // Create content with exactly 200 words (should be 1 minute reading time)
      const words = Array(200).fill('word').join(' ');
      const mockPostData = {
        header: 'Reading Time Test',
        text: words,
        category: 'Tech',
        isPublished: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser as User);
      mockCategoryRepository.findOne.mockResolvedValue(null);
      
      const mockCreatedPost = {
        header: mockPostData.header,
        text: mockPostData.text,
        readingTime: 1,
      };
      
      mockPostRepository.create.mockReturnValue(mockCreatedPost as Post);
      mockPostRepository.save.mockResolvedValue(mockCreatedPost as Post);

      const result = await postsService.createPost(mockPostData, '1');
      
      expect(result.readingTime).toBe(1);
    });
  });
});
