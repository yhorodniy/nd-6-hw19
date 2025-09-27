import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Category } from '../entities/Category';
import newsPosts from '../routes/newsPosts';
import healthRoute from '../routes/health';
import { errorHandler } from '../helpers/errorHandler';

// Ensure environment variables are set for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-api-tests';

// Create test database connection
export const TestDataSource = new DataSource({
    type: 'postgres',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    username: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    database: process.env.TEST_DB_NAME || 'nd_hw19_test',
    synchronize: true, // Auto-create tables for tests
    logging: false,
    entities: [User, Post, Category],
    dropSchema: true, // Drop schema before each test run
});

// Create test app
export const createTestApp = (): Application => {
    const app: Application = express();
    
    app.use(express.json());
    app.use(cors());
    
    // Routes
    app.use('/api/newsposts', newsPosts);
    app.use('/api', healthRoute);
    
    // Error handling
    app.use(errorHandler);
    
    return app;
};

// Database helpers
export const setupTestDatabase = async () => {
    try {
        if (!TestDataSource.isInitialized) {
            await TestDataSource.initialize();
        }
        console.log('✅ Test database connected');
    } catch (error) {
        console.error('❌ Test database connection failed:', error);
        throw error;
    }
};

export const cleanupTestDatabase = async () => {
    if (TestDataSource.isInitialized) {
        await TestDataSource.destroy();
    }
};

export const clearTestDatabase = async () => {
    if (TestDataSource.isInitialized) {
        // Clear all tables in reverse order to avoid foreign key constraints
        await TestDataSource.getRepository(Post).delete({});
        await TestDataSource.getRepository(User).delete({});
        await TestDataSource.getRepository(Category).delete({});
    }
};
