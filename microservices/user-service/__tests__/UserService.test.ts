import { UserService } from '../src/services/UserService';
import { User } from '../src/models/User';
import { redisClient } from '../src/services/redisClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../src/services/redisClient');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/models/User');

describe('UserService', () => {
  let userService: UserService;
  let mockRedisClient: jest.Mocked<typeof redisClient>;
  let mockBcrypt: jest.Mocked<typeof bcrypt>;
  let mockJwt: jest.Mocked<typeof jwt>;

  beforeEach(() => {
    userService = new UserService();
    mockRedisClient = redisClient as jest.Mocked<typeof redisClient>;
    mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
    mockJwt = jwt as jest.Mocked<typeof jwt>;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
      };

      const expectedToken = 'jwt-token-123';

      // Mock implementations
      mockRedisClient.get.mockResolvedValue(null); // User doesn't exist
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
      (User as jest.MockedClass<typeof User>).mockImplementation(() => mockUser as any);
      mockRedisClient.set.mockResolvedValue('OK' as never);
      mockRedisClient.publish.mockResolvedValue(1 as never);
      mockJwt.sign.mockReturnValue(expectedToken as never);

      const result = await userService.createUser(userData);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          createdAt: mockUser.createdAt,
        },
        token: expectedToken,
      });

      // Verify Redis operations
      expect(mockRedisClient.get).toHaveBeenCalledWith('user:email:test@example.com');
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        `user:${mockUser.id}`,
        JSON.stringify({
          id: mockUser.id,
          email: mockUser.email,
          passwordHash: mockUser.passwordHash,
          createdAt: mockUser.createdAt,
        })
      );
      expect(mockRedisClient.set).toHaveBeenCalledWith('user:email:test@example.com', mockUser.id);

      // Verify password hashing
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);

      // Verify JWT token generation
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          email: mockUser.email,
        },
        'test-secret-key',
        { expiresIn: '7d' }
      );

      // Verify publish message
      expect(mockRedisClient.publish).toHaveBeenCalledWith(
        'user:created',
        expect.stringContaining('"action":"user_created"')
      );
    });

    it('should throw error when user with email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      mockRedisClient.get.mockResolvedValue('existing-user-id');

      await expect(userService.createUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );

      expect(mockRedisClient.get).toHaveBeenCalledWith('user:email:existing@example.com');
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockRedisClient.set).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockRedisClient.get.mockRejectedValue(new Error('Redis connection failed'));

      await expect(userService.createUser(userData)).rejects.toThrow('Redis connection failed');
    });
  });

  describe('loginUser', () => {
    it('should login user successfully with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const storedUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
      };

      const expectedToken = 'jwt-token-123';

      mockRedisClient.get
        .mockResolvedValueOnce('user-123') // email lookup
        .mockResolvedValueOnce(JSON.stringify(storedUser)); // user data lookup
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValue(expectedToken as never);
      mockRedisClient.publish.mockResolvedValue(1 as never);

      const result = await userService.loginUser(email, password);

      expect(result).toEqual({
        user: {
          id: storedUser.id,
          email: storedUser.email,
          createdAt: storedUser.createdAt,
        },
        token: expectedToken,
      });

      expect(mockRedisClient.get).toHaveBeenCalledWith('user:email:test@example.com');
      expect(mockRedisClient.get).toHaveBeenCalledWith('user:user-123');
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId: storedUser.id,
          email: storedUser.email,
        },
        'test-secret-key',
        { expiresIn: '7d' }
      );
    });

    it('should throw error when user is not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockRedisClient.get.mockResolvedValue(null);

      await expect(userService.loginUser(email, password)).rejects.toThrow('Invalid email or password');

      expect(mockRedisClient.get).toHaveBeenCalledWith('user:email:nonexistent@example.com');
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error when password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      const storedUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
      };

      mockRedisClient.get
        .mockResolvedValueOnce('user-123')
        .mockResolvedValueOnce(JSON.stringify(storedUser));
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(userService.loginUser(email, password)).rejects.toThrow('Invalid email or password');

      expect(mockBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed-password');
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user by id successfully', async () => {
      const userId = 'user-123';
      const storedUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(storedUser));

      const result = await userService.getUserById(userId);

      expect(result).toEqual({
        id: storedUser.id,
        email: storedUser.email,
        createdAt: storedUser.createdAt,
      });

      expect(mockRedisClient.get).toHaveBeenCalledWith('user:user-123');
    });

    it('should return null when user is not found', async () => {
      const userId = 'nonexistent-user';

      mockRedisClient.get.mockResolvedValue(null);

      const result = await userService.getUserById(userId);

      expect(result).toBeNull();
      expect(mockRedisClient.get).toHaveBeenCalledWith('user:nonexistent-user');
    });

    it('should handle Redis errors gracefully', async () => {
      const userId = 'user-123';

      mockRedisClient.get.mockRejectedValue(new Error('Redis connection failed'));

      await expect(userService.getUserById(userId)).rejects.toThrow('Redis connection failed');
    });
  });


});
