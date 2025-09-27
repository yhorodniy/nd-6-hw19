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
    // Create comprehensive mock query builder
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getCount: jest.fn(),
      getMany: jest.fn(),
      getOne: jest.fn(),
    } as any;

    // Create mock repositories
    mockPostRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockUserRepository = {
      findOne: jest.fn(),
    } as any;

    mockCategoryRepository = {
      find: jest.fn(),
    } as any;

    // Mock AppDataSource.getRepository to return our mock repositories
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Post) return mockPostRepository;
      if (entity === User) return mockUserRepository;
      if (entity === Category) return mockCategoryRepository;
      return null;
    });

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
          author: { email: 'test@test.com' },
          createdAt: new Date('2023-01-01'),
          viewsCount: 10,
          likesCount: 5,
          isFeatured: false,
          deleted: false,
          updatedAt: new Date('2023-01-01'),
          readingTime: 2,
        },
      ] as unknown as Post[];

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue(mockPosts);

      const result = await postsService.getAllPosts(0, 10);

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            header: 'Test Post 1',
            content: 'Test content 1',
            author_id: '1',
            author_email: 'test@test.com',
            is_published: true,
          }),
        ]),
        pagination: {
          page: 0,
          size: 10,
          total: 1,
          totalPages: 1,
        },
      });

      expect(mockPostRepository.createQueryBuilder).toHaveBeenCalledWith('post');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('post.deleted = :deleted', { deleted: false });
    });

    it('should handle category filtering', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await postsService.getAllPosts(0, 10, 'Technology');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('post.category = :category', { category: 'Technology' });
    });
  });

  describe('getPostById', () => {
    it('should return post by id successfully', async () => {
      const mockPost = {
        id: '1',
        header: 'Test Post',
        content: 'Test content',
        isPublished: true,
        authorId: '1',
        author: { email: 'test@test.com' },
        viewsCount: 10,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
        publishedAt: new Date('2023-01-01T00:00:00.000Z'),
      } as unknown as Post;

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.update.mockResolvedValue({} as any);

      const result = await postsService.getPostById('1');

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          header: 'Test Post',
          content: 'Test content',
          author_id: '1',
          author_email: 'test@test.com',
          is_published: true,
        })
      );

      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', deleted: false },
        relations: ['author'],
      });
    });

    it('should throw error when post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(postsService.getPostById('nonexistent')).rejects.toThrow('Failed to fetch post: Post not found');
    });
  });

  describe('createPost', () => {
    it('should create post successfully', async () => {
      const mockUser = { id: '1', email: 'test@test.com' } as User;
      const mockPostData: PostCreateRequest = {
        header: 'New Post',
        content: 'New content',
        is_published: true,
      };

      const savedPost = {
        id: '1',
        header: 'New Post',
        content: 'New content',
        authorId: '1',
        isPublished: true,
        slug: 'new-post',
        readingTime: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewsCount: 0,
        likesCount: 0,
        isFeatured: false,
      } as unknown as Post;

      const postWithAuthor = {
        ...savedPost,
        author: mockUser,
      } as unknown as Post;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPostRepository.create.mockReturnValue(savedPost);
      mockPostRepository.save.mockResolvedValue(savedPost);
      mockPostRepository.findOne.mockResolvedValue(postWithAuthor);

      const result = await postsService.createPost(mockPostData, '1');

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          header: 'New Post',
          content: 'New content',
          author_id: '1',
          author_email: 'test@test.com',
          is_published: true,
        })
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw error when user not found', async () => {
      const mockPostData: PostCreateRequest = {
        header: 'New Post',
        content: 'New content',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(postsService.createPost(mockPostData, 'nonexistent')).rejects.toThrow('Failed to create post: Author not found');
    });
  });

  describe('updatePost', () => {
    it('should update post successfully', async () => {
      const existingPost = {
        id: '1',
        authorId: '1',
        header: 'Old Header',
      } as unknown as Post;

      const updatedPost = {
        id: '1',
        header: 'Updated Header',
        authorId: '1',
        author: { email: 'test@test.com' },
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
        publishedAt: new Date('2023-01-01T00:00:00.000Z'),
      } as unknown as Post;

      const updateData: PostUpdateRequest = {
        header: 'Updated Header',
      };

      mockPostRepository.findOne
        .mockResolvedValueOnce(existingPost) // First call for authorization check
        .mockResolvedValueOnce(updatedPost); // Second call for returning updated post
      mockPostRepository.update.mockResolvedValue({} as any);

      const result = await postsService.updatePost('1', updateData, '1');

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          header: 'Updated Header',
          author_id: '1',
          author_email: 'test@test.com',
        })
      );
    });

    it('should throw error when post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(postsService.updatePost('1', {}, '1')).rejects.toThrow('Failed to update post: Post not found');
    });

    it('should throw error when user not authorized', async () => {
      const existingPost = {
        id: '1',
        authorId: '1',
      } as unknown as Post;

      mockPostRepository.findOne.mockResolvedValue(existingPost);

      await expect(postsService.updatePost('1', {}, '2')).rejects.toThrow('Failed to update post: Unauthorized: You can only update your own posts');
    });
  });

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      const existingPost = {
        id: '1',
        authorId: '1',
      } as unknown as Post;

      mockPostRepository.findOne.mockResolvedValue(existingPost);
      mockPostRepository.delete.mockResolvedValue({} as any);

      await postsService.deletePost('1', '1');

      expect(mockPostRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error when post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(postsService.deletePost('1', '1')).rejects.toThrow('Failed to delete post: Post not found');
    });
  });

  describe('getCategories', () => {
    it('should return categories successfully', async () => {
      const mockCategories = [
        { id: '1', name: 'Technology', slug: 'tech', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Health', slug: 'health', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockCategoryRepository.find.mockResolvedValue(mockCategories as unknown as Category[]);

      const result = await postsService.getCategories();

      expect(result).toEqual(mockCategories);
      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
    });
  });
});
