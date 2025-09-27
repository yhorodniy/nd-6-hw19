import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Category } from '../entities/Category';

// Test database configuration
export const testDataSource = new DataSource({
    type: 'postgres',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    username: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    database: process.env.TEST_DB_NAME || 'nd_hw19_test',
    synchronize: true,
    logging: false,
    entities: [User, Post, Category],
    dropSchema: true,
});

let isInitialized = false;

export const getTestDataSource = (): DataSource => {
    return testDataSource;
};

export const initializeTestDb = async (): Promise<void> => {
    if (!isInitialized) {
        await testDataSource.initialize();
        isInitialized = true;
    }
};

export const cleanupTestDb = async (): Promise<void> => {
    if (isInitialized && testDataSource.isInitialized) {
        await testDataSource.destroy();
        isInitialized = false;
    }
};

export const clearTestDb = async (): Promise<void> => {
    if (isInitialized && testDataSource.isInitialized) {
        await testDataSource.getRepository(Post).delete({});
        await testDataSource.getRepository(User).delete({});
        await testDataSource.getRepository(Category).delete({});
    }
};
