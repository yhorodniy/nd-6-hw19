// Jest setup file for global test configuration
import 'reflect-metadata';

// Mock database connection
jest.mock('../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_db';
