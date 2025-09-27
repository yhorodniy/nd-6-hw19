import request from 'supertest';
import express from 'express';
import cors from 'cors';
import newsPosts from '../routes/newsPosts';
import healthRoute from '../routes/health';
import { errorHandler } from '../helpers/errorHandler';

// Mock the database and services
jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
        isInitialized: true
    },
    initializeDatabase: jest.fn()
}));

jest.mock('../services/postsService', () => {
    return {
        PostsService: jest.fn().mockImplementation(() => ({
            getAllPosts: jest.fn().mockResolvedValue({
                posts: [
                    {
                        id: '1',
                        header: 'Test Post 1',
                        content: 'Test content 1',
                        category: 'Technology',
                        isPublished: true,
                        author: { id: '1', email: 'test@example.com' }
                    },
                    {
                        id: '2', 
                        header: 'Test Post 2',
                        content: 'Test content 2',
                        category: 'Technology',
                        isPublished: true,
                        author: { id: '1', email: 'test@example.com' }
                    }
                ],
                totalCount: 2,
                currentPage: 0,
                totalPages: 1
            }),
            getPostById: jest.fn().mockImplementation((id) => {
                if (id === '1') {
                    return Promise.resolve({
                        id: '1',
                        header: 'Test Post 1',
                        content: 'Test content 1',
                        category: 'Technology',
                        isPublished: true,
                        author: { id: '1', email: 'test@example.com' }
                    });
                }
                throw new Error('Post not found');
            }),
            createPost: jest.fn().mockResolvedValue({
                id: '3',
                header: 'New Test Post',
                content: 'New test content',
                category: 'Technology',
                isPublished: true,
                author: { id: '1', email: 'test@example.com' }
            }),
            updatePost: jest.fn().mockImplementation((id, updateData, userId) => {
                if (id === '1') {
                    return Promise.resolve({
                        id: '1',
                        ...updateData,
                        author: { id: '1', email: 'test@example.com' }
                    });
                }
                throw new Error('Post not found');
            }),
            deletePost: jest.fn().mockImplementation((id, userId) => {
                if (id === '1') {
                    return Promise.resolve();
                }
                throw new Error('Post not found');
            }),
            getCategories: jest.fn().mockResolvedValue([
                { id: 1, name: 'Technology', description: 'Tech news' },
                { id: 2, name: 'Sports', description: 'Sports news' }
            ])
        }))
    };
});

// Mock JWT authentication
jest.mock('../helpers/auth', () => ({
    authenticateToken: (req: any, res: any, next: any) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access token is required' });
        }
        
        const token = authHeader.substring(7);
        if (token === 'valid-token') {
            req.user = { userId: '1', email: 'test@example.com' };
            next();
        } else if (token === 'invalid-token' || token === 'expired-token') {
            return res.status(401).json({ message: 'Invalid token' });
        } else {
            return res.status(401).json({ message: 'Access token is required' });
        }
    },
    optionalAuth: (req: any, res: any, next: any) => {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (token === 'valid-token') {
                req.user = { userId: '1', email: 'test@example.com' };
            }
        }
        next();
    }
}));

// Create test app
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use('/api/newsposts', newsPosts);
    app.use('/api', healthRoute);
    app.use(errorHandler);
    return app;
};

describe('News Posts API Integration Tests (Mocked)', () => {
    let app: express.Application;

    beforeAll(() => {
        app = createTestApp();
    });

    describe('GET /api/newsposts', () => {
        it('should get all posts successfully', async () => {
            const response = await request(app)
                .get('/api/newsposts')
                .expect(200);

            expect(response.body).toHaveProperty('posts');
            expect(response.body.posts).toHaveLength(2);
            expect(response.body).toHaveProperty('totalCount', 2);
            expect(response.body.posts[0]).toHaveProperty('header', 'Test Post 1');
        });

        it('should support pagination parameters', async () => {
            const response = await request(app)
                .get('/api/newsposts?page=0&size=1')
                .expect(200);

            expect(response.body).toHaveProperty('posts');
            expect(response.body).toHaveProperty('currentPage', 0);
        });

        it('should work with authentication', async () => {
            const response = await request(app)
                .get('/api/newsposts')
                .set('Authorization', 'Bearer valid-token')
                .expect(200);

            expect(response.body).toHaveProperty('posts');
        });
    });

    describe('GET /api/newsposts/:id', () => {
        it('should get a single post by ID', async () => {
            const response = await request(app)
                .get('/api/newsposts/1')
                .expect(200);

            expect(response.body).toHaveProperty('id', '1');
            expect(response.body).toHaveProperty('header', 'Test Post 1');
            expect(response.body).toHaveProperty('content');
        });

        it('should return 404 for non-existent post', async () => {
            const response = await request(app)
                .get('/api/newsposts/999')
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Post not found');
        });
    });

    describe('POST /api/newsposts', () => {
        it('should create a new post with authentication', async () => {
            const newPost = {
                header: 'New Test Post',
                content: 'New test content',
                category: 'Technology',
                isPublished: true
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', 'Bearer valid-token')
                .send(newPost)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('header', newPost.header);
            expect(response.body).toHaveProperty('content', newPost.content);
        });

        it('should require authentication', async () => {
            const newPost = {
                header: 'New Test Post',
                content: 'New test content',
                category: 'Technology'
            };

            const response = await request(app)
                .post('/api/newsposts')
                .send(newPost)
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Access token is required');
        });

        it('should reject invalid token', async () => {
            const newPost = {
                header: 'New Test Post',
                content: 'New test content',
                category: 'Technology'
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', 'Bearer invalid-token')
                .send(newPost)
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Invalid token');
        });
    });

    describe('PUT /api/newsposts/:id', () => {
        it('should update an existing post', async () => {
            const updateData = {
                header: 'Updated Header',
                content: 'Updated content',
                category: 'Technology'
            };

            const response = await request(app)
                .put('/api/newsposts/1')
                .set('Authorization', 'Bearer valid-token')
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('header', updateData.header);
            expect(response.body).toHaveProperty('content', updateData.content);
        });

        it('should require authentication', async () => {
            const updateData = {
                header: 'Updated Header',
                content: 'Updated content'
            };

            await request(app)
                .put('/api/newsposts/1')
                .send(updateData)
                .expect(401);
        });

        it('should return 404 for non-existent post', async () => {
            const updateData = {
                header: 'Updated Header',
                content: 'Updated content'
            };

            const response = await request(app)
                .put('/api/newsposts/999')
                .set('Authorization', 'Bearer valid-token')
                .send(updateData)
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Post not found');
        });
    });

    describe('DELETE /api/newsposts/:id', () => {
        it('should delete an existing post', async () => {
            const response = await request(app)
                .delete('/api/newsposts/1')
                .set('Authorization', 'Bearer valid-token')
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Post deleted successfully');
        });

        it('should require authentication', async () => {
            await request(app)
                .delete('/api/newsposts/1')
                .expect(401);
        });

        it('should return 404 for non-existent post', async () => {
            const response = await request(app)
                .delete('/api/newsposts/999')
                .set('Authorization', 'Bearer valid-token')
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Post not found');
        });
    });

    describe('GET /api/newsposts/categories', () => {
        it('should get all categories', async () => {
            const response = await request(app)
                .get('/api/newsposts/categories')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty('name', 'Technology');
        });
    });

    describe('Authentication Edge Cases', () => {
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
    });

    describe('Health Check', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toHaveProperty('status');
        });
    });
});
