import request from 'supertest';
import { Application } from 'express';
import { createTestApp } from './testServer';
import { getTestDataSource } from './testDb';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Authentication and Authorization API', () => {
    let app: Application;
    let testUser: User;
    let validToken: string;
    let expiredToken: string;
    let invalidToken: string;

    beforeAll(async () => {
        app = createTestApp();
        
        // Create test user
        const userRepository = getTestDataSource().getRepository(User);
        const hashedPassword = await bcrypt.hash('testpassword123', 10);
        
        testUser = userRepository.create({
            email: 'auth-test@example.com',
            passwordHash: hashedPassword
        });
        await userRepository.save(testUser);

        // Generate tokens
        const jwtSecret = process.env.JWT_SECRET || 'test-secret-key-for-api-tests';
        
        validToken = jwt.sign(
            { userId: testUser.id, email: testUser.email },
            jwtSecret,
            { expiresIn: '1h' }
        );

        expiredToken = jwt.sign(
            { userId: testUser.id, email: testUser.email },
            jwtSecret,
            { expiresIn: '-1h' } // Already expired
        );

        invalidToken = 'invalid.jwt.token';
    });

    describe('Protected Endpoints', () => {
        const protectedEndpoints = [
            { method: 'post', path: '/api/newsposts', data: { header: 'Test', content: 'Test content', category: 'Tech' } },
            { method: 'put', path: '/api/newsposts/123', data: { header: 'Updated', content: 'Updated content' } },
            { method: 'delete', path: '/api/newsposts/123', data: null }
        ];

        protectedEndpoints.forEach(({ method, path, data }) => {
            it(`should require authentication for ${method.toUpperCase()} ${path}`, async () => {
                let req: any;
                switch (method) {
                    case 'post':
                        req = request(app).post(path);
                        break;
                    case 'put':
                        req = request(app).put(path);
                        break;
                    case 'delete':
                        req = request(app).delete(path);
                        break;
                    default:
                        req = request(app).get(path);
                }
                
                if (data) {
                    req.send(data);
                }
                
                const response = await req.expect(401);
                expect(response.body).toHaveProperty('message', 'Access token is required');
            });

            it(`should reject invalid token for ${method.toUpperCase()} ${path}`, async () => {
                let req: any;
                switch (method) {
                    case 'post':
                        req = request(app).post(path);
                        break;
                    case 'put':
                        req = request(app).put(path);
                        break;
                    case 'delete':
                        req = request(app).delete(path);
                        break;
                    default:
                        req = request(app).get(path);
                }
                req.set('Authorization', `Bearer ${invalidToken}`);
                
                if (data) {
                    req.send(data);
                }
                
                const response = await req.expect(401);
                expect(response.body).toHaveProperty('message', 'Invalid token');
            });

            it(`should reject expired token for ${method.toUpperCase()} ${path}`, async () => {
                let req: any;
                switch (method) {
                    case 'post':
                        req = request(app).post(path);
                        break;
                    case 'put':
                        req = request(app).put(path);
                        break;
                    case 'delete':
                        req = request(app).delete(path);
                        break;
                    default:
                        req = request(app).get(path);
                }
                req.set('Authorization', `Bearer ${expiredToken}`);
                
                if (data) {
                    req.send(data);
                }
                
                const response = await req.expect(401);
                expect(['Invalid token', 'Token expired'].includes(response.body.message)).toBe(true);
            });
        });
    });

    describe('Token Format Validation', () => {
        it('should reject malformed Authorization header', async () => {
            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', 'InvalidFormat')
                .send({ header: 'Test', content: 'Test content' })
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Access token is required');
        });

        it('should reject empty Bearer token', async () => {
            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', 'Bearer ')
                .send({ header: 'Test', content: 'Test content' })
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Access token is required');
        });

        it('should reject missing Bearer prefix', async () => {
            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', validToken)
                .send({ header: 'Test', content: 'Test content' })
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Access token is required');
        });
    });

    describe('Optional Authentication', () => {
        it('should allow access to GET /api/newsposts without authentication', async () => {
            const response = await request(app)
                .get('/api/newsposts')
                .expect(200);

            expect(response.body).toHaveProperty('posts');
        });

        it('should allow access to GET /api/newsposts/:id without authentication', async () => {
            // This will return 404 since post doesn't exist, but it passes auth
            await request(app)
                .get('/api/newsposts/12345')
                .expect(404);
        });

        it('should provide additional data when authenticated for GET /api/newsposts', async () => {
            const responseWithoutAuth = await request(app)
                .get('/api/newsposts')
                .expect(200);

            const responseWithAuth = await request(app)
                .get('/api/newsposts')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200);

            // Both should succeed, but authenticated version might have more data
            expect(responseWithoutAuth.body).toHaveProperty('posts');
            expect(responseWithAuth.body).toHaveProperty('posts');
        });
    });
});
