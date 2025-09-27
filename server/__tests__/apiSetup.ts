import 'reflect-metadata';
import { getTestDataSource, initializeTestDb, cleanupTestDb, clearTestDb } from './testDb';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-api-tests';
process.env.TEST_DB_HOST = 'localhost';
process.env.TEST_DB_PORT = '5432';
process.env.TEST_DB_USER = 'postgres';
process.env.TEST_DB_PASSWORD = 'postgres';
process.env.TEST_DB_NAME = 'nd_hw19_test';

// Mock the main database connection to use test database
jest.mock('../config/database', () => ({
    AppDataSource: getTestDataSource(),
    initializeDatabase: initializeTestDb
}));

// Global test setup
beforeAll(async () => {
    await initializeTestDb();
}, 30000);

// Global test cleanup
afterAll(async () => {
    await cleanupTestDb();
}, 10000);

// Clear database after each test
afterEach(async () => {
    await clearTestDb();
});
