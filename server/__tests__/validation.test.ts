import request from 'supertest';
import { Application } from 'express';
import { createTestApp } from './testServer';
import { getTestDataSource } from './testDb';
import { User } from '../entities/User';
import { Category } from '../entities/Category';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Data Validation API Tests', () => {
    let app: Application;
    let authToken: string;
    let testUser: User;
    let testCategory: Category;

    beforeAll(async () => {
        app = createTestApp();
        
        // Create test user
        const userRepository = getTestDataSource().getRepository(User);
        const hashedPassword = await bcrypt.hash('testpassword123', 10);
        
        testUser = userRepository.create({
            email: 'validation-test@example.com',
            passwordHash: hashedPassword
        });
        await userRepository.save(testUser);

        // Generate auth token
        authToken = jwt.sign(
            { userId: testUser.id, email: testUser.email },
            process.env.JWT_SECRET || 'test-secret-key-for-api-tests',
            { expiresIn: '1h' }
        );

        // Create test category
        const categoryRepository = getTestDataSource().getRepository(Category);
        testCategory = categoryRepository.create({
            name: 'ValidationTest',
            description: 'Category for validation tests'
        });
        await categoryRepository.save(testCategory);
    });

    describe('POST /api/newsposts validation', () => {
        it('should reject empty header', async () => {
            const invalidData = {
                header: '',
                content: 'Valid content',
                category: testCategory.name,
                isPublished: true
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty('message');
        });

        it('should reject missing header', async () => {
            const invalidData = {
                content: 'Valid content',
                category: testCategory.name,
                isPublished: true
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty('message');
        });

        it('should reject empty content', async () => {
            const invalidData = {
                header: 'Valid Header',
                content: '',
                category: testCategory.name,
                isPublished: true
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty('message');
        });

        it('should reject missing content', async () => {
            const invalidData = {
                header: 'Valid Header',
                category: testCategory.name,
                isPublished: true
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty('message');
        });

        it('should handle very long header', async () => {
            const longHeader = 'a'.repeat(1000); // Very long header
            const postData = {
                header: longHeader,
                content: 'Valid content',
                category: testCategory.name,
                isPublished: true
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData);

            // Should either succeed or return validation error
            expect([200, 201, 400].includes(response.status)).toBe(true);
        });

        it('should handle very long content', async () => {
            const longContent = 'a'.repeat(10000); // Very long content
            const postData = {
                header: 'Valid Header',
                content: longContent,
                category: testCategory.name,
                isPublished: true
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData);

            // Should either succeed or return validation error
            expect([200, 201, 400].includes(response.status)).toBe(true);
        });

        it('should handle special characters in header and content', async () => {
            const postData = {
                header: 'Header with "quotes" & <tags> and émojis 🚀',
                content: 'Content with special chars: @#$%^&*()[]{}|\\:";\'<>?,./~`',
                category: testCategory.name,
                isPublished: true
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData);

            expect([200, 201].includes(response.status)).toBe(true);
            if (response.status === 201) {
                expect(response.body.header).toBe(postData.header);
                expect(response.body.content).toBe(postData.content);
            }
        });
    });

    describe('PUT /api/newsposts/:id validation', () => {
        let testPostId: string;

        beforeEach(async () => {
            // Create a test post
            const postData = {
                header: 'Original Header',
                content: 'Original content',
                category: testCategory.name,
                isPublished: true
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData);

            testPostId = response.body.id;
        });

        it('should reject empty header in update', async () => {
            const updateData = {
                header: '',
                content: 'Updated content',
                category: testCategory.name
            };

            const response = await request(app)
                .put(`/api/newsposts/${testPostId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty('message');
        });

        it('should reject empty content in update', async () => {
            const updateData = {
                header: 'Updated Header',
                content: '',
                category: testCategory.name
            };

            const response = await request(app)
                .put(`/api/newsposts/${testPostId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('Query parameter validation', () => {
        it('should handle invalid page parameter', async () => {
            const response = await request(app)
                .get('/api/newsposts?page=invalid')
                .expect(200);

            // Should default to page 0 or handle gracefully
            expect(response.body).toHaveProperty('posts');
        });

        it('should handle negative page parameter', async () => {
            const response = await request(app)
                .get('/api/newsposts?page=-1')
                .expect(200);

            expect(response.body).toHaveProperty('posts');
        });

        it('should handle invalid size parameter', async () => {
            const response = await request(app)
                .get('/api/newsposts?size=invalid')
                .expect(200);

            expect(response.body).toHaveProperty('posts');
        });

        it('should handle very large size parameter', async () => {
            const response = await request(app)
                .get('/api/newsposts?size=10000')
                .expect(200);

            expect(response.body).toHaveProperty('posts');
            // Should either limit to reasonable size or handle gracefully
        });

        it('should handle special characters in category filter', async () => {
            const response = await request(app)
                .get('/api/newsposts?category=<script>alert("xss")</script>')
                .expect(200);

            expect(response.body).toHaveProperty('posts');
        });
    });

    describe('Path parameter validation', () => {
        it('should handle invalid post ID format', async () => {
            const response = await request(app)
                .get('/api/newsposts/invalid-id-format')
                .expect(404);

            expect(response.body).toHaveProperty('message');
        });

        it('should handle SQL injection attempt in ID', async () => {
            const maliciousId = "1' OR '1'='1";
            const response = await request(app)
                .get(`/api/newsposts/${maliciousId}`);

            // Should return 404 or 400, not 500
            expect([400, 404].includes(response.status)).toBe(true);
        });

        it('should handle very long ID', async () => {
            const longId = 'a'.repeat(1000);
            const response = await request(app)
                .get(`/api/newsposts/${longId}`);

            expect([400, 404].includes(response.status)).toBe(true);
        });
    });

    describe('JSON payload validation', () => {
        it('should handle malformed JSON', async () => {
            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .set('Content-Type', 'application/json')
                .send('{"header": "test", "content": "test"') // Malformed JSON
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        it('should handle empty JSON object', async () => {
            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty('message');
        });

        it('should handle null values', async () => {
            const postData = {
                header: null,
                content: null,
                category: null,
                isPublished: null
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty('message');
        });
    });
});
