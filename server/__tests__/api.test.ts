import request from 'supertest';
import { Application } from 'express';
import { createTestApp } from './testServer';
import { getTestDataSource } from './testDb';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Category } from '../entities/Category';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('News Posts API', () => {
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
            email: 'test@example.com',
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
            name: 'Technology',
            description: 'Tech news and updates'
        });
        await categoryRepository.save(testCategory);
    });

    describe('GET /api/newsposts', () => {
        beforeEach(async () => {
            // Create test posts
            const postRepository = getTestDataSource().getRepository(Post);
            
            const posts = [
                {
                    header: 'First Tech News',
                    content: 'Content of first tech news',
                    author: testUser,
                    category: testCategory.name,
                    isPublished: true
                },
                {
                    header: 'Second Tech News',
                    content: 'Content of second tech news',
                    author: testUser,
                    category: testCategory.name,
                    isPublished: true
                },
                {
                    header: 'Private News',
                    content: 'Private content',
                    author: testUser,
                    category: testCategory.name,
                    isPublished: false
                }
            ];

            for (const postData of posts) {
                const post = postRepository.create(postData);
                await postRepository.save(post);
            }
        });

        it('should get all public posts without authentication', async () => {
            const response = await request(app)
                .get('/api/newsposts')
                .expect(200);

            expect(response.body).toHaveProperty('posts');
            expect(response.body).toHaveProperty('totalCount');
            expect(response.body.posts).toHaveLength(2); // Only public posts
            expect(response.body.posts[0]).toHaveProperty('header');
            expect(response.body.posts[0]).toHaveProperty('content');
            expect(response.body.posts[0]).toHaveProperty('category');
        });

        it('should get all posts including private ones with authentication', async () => {
            const response = await request(app)
                .get('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('posts');
            expect(response.body.posts).toHaveLength(3); // All posts including private
        });

        it('should support pagination', async () => {
            const response = await request(app)
                .get('/api/newsposts?page=0&size=1')
                .expect(200);

            expect(response.body.posts).toHaveLength(1);
            expect(response.body).toHaveProperty('currentPage', 0);
            expect(response.body).toHaveProperty('totalPages');
        });

        it('should filter by category', async () => {
            const response = await request(app)
                .get(`/api/newsposts?category=${testCategory.name}`)
                .expect(200);

            expect(response.body.posts).toHaveLength(2);
            response.body.posts.forEach((post: any) => {
                expect(post.category).toBe(testCategory.name);
            });
        });
    });

    describe('GET /api/newsposts/:id', () => {
        let testPost: Post;

        beforeEach(async () => {
            const postRepository = getTestDataSource().getRepository(Post);
            testPost = postRepository.create({
                header: 'Single Post Test',
                content: 'Content for single post test',
                author: testUser,
                category: testCategory.name,
                isPublished: true
            });
            await postRepository.save(testPost);
        });

        it('should get a single post by ID', async () => {
            const response = await request(app)
                .get(`/api/newsposts/${testPost.id}`)
                .expect(200);

            expect(response.body).toHaveProperty('id', testPost.id);
            expect(response.body).toHaveProperty('header', 'Single Post Test');
            expect(response.body).toHaveProperty('content');
            expect(response.body).toHaveProperty('author');
            expect(response.body).toHaveProperty('category');
        });

        it('should return 404 for non-existent post', async () => {
            const response = await request(app)
                .get('/api/newsposts/99999')
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Post not found');
        });
    });

    describe('POST /api/newsposts', () => {
        const newPostData = {
            header: 'New Test Post',
            content: 'This is a new test post content',
            category: null as any,
            isPublished: true
        };

        beforeEach(() => {
            newPostData.category = testCategory.name;
        });

        it('should create a new post with authentication', async () => {
            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newPostData)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('header', newPostData.header);
            expect(response.body).toHaveProperty('content', newPostData.content);
            expect(response.body).toHaveProperty('author');
            expect(response.body.author.id).toBe(testUser.id);

            // Verify post was saved in database
            const postRepository = getTestDataSource().getRepository(Post);
            const savedPost = await postRepository.findOne({
                where: { id: response.body.id },
                relations: ['author']
            });
            
            expect(savedPost).toBeTruthy();
            expect(savedPost?.header).toBe(newPostData.header);
        });

        it('should require authentication to create post', async () => {
            const response = await request(app)
                .post('/api/newsposts')
                .send(newPostData)
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Access token is required');
        });

        it('should validate required fields', async () => {
            const invalidPostData = {
                header: '', // Empty header
                content: 'Valid content',
                category: testCategory.name,
                isPublished: true
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidPostData)
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        it('should handle invalid category', async () => {
            const invalidPostData = {
                ...newPostData,
                category: 'NonExistentCategory'
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidPostData)
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('PUT /api/newsposts/:id', () => {
        let testPost: Post;

        beforeEach(async () => {
            const postRepository = getTestDataSource().getRepository(Post);
            testPost = postRepository.create({
                header: 'Original Title',
                content: 'Original content',
                author: testUser,
                category: testCategory.name,
                isPublished: true
            });
            await postRepository.save(testPost);
        });

        it('should update an existing post', async () => {
            const updatedData = {
                header: 'Updated Title',
                content: 'Updated content',
                category: testCategory.name,
                isPublished: false
            };

            const response = await request(app)
                .put(`/api/newsposts/${testPost.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updatedData)
                .expect(200);

            expect(response.body).toHaveProperty('header', updatedData.header);
            expect(response.body).toHaveProperty('content', updatedData.content);
            expect(response.body).toHaveProperty('isPublished', updatedData.isPublished);

            // Verify update in database
            const postRepository = getTestDataSource().getRepository(Post);
            const updatedPost = await postRepository.findOne({
                where: { id: testPost.id }
            });
            
            expect(updatedPost?.header).toBe(updatedData.header);
            expect(updatedPost?.content).toBe(updatedData.content);
        });

        it('should require authentication to update post', async () => {
            const updatedData = {
                header: 'Updated Title',
                content: 'Updated content',
                category: testCategory.name,
                isPublished: false
            };

            await request(app)
                .put(`/api/newsposts/${testPost.id}`)
                .send(updatedData)
                .expect(401);
        });

        it('should return 404 for non-existent post update', async () => {
            const updatedData = {
                header: 'Updated Title',
                content: 'Updated content',
                category: testCategory.name,
                isPublished: false
            };

            const response = await request(app)
                .put('/api/newsposts/99999')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updatedData)
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Post not found');
        });
    });

    describe('DELETE /api/newsposts/:id', () => {
        let testPost: Post;

        beforeEach(async () => {
            const postRepository = getTestDataSource().getRepository(Post);
            testPost = postRepository.create({
                header: 'Post to Delete',
                content: 'Content to be deleted',
                author: testUser,
                category: testCategory.name,
                isPublished: true
            });
            await postRepository.save(testPost);
        });

        it('should delete an existing post', async () => {
            const response = await request(app)
                .delete(`/api/newsposts/${testPost.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Post deleted successfully');

            // Verify deletion in database
            const postRepository = getTestDataSource().getRepository(Post);
            const deletedPost = await postRepository.findOne({
                where: { id: testPost.id }
            });
            
            expect(deletedPost).toBeNull();
        });

        it('should require authentication to delete post', async () => {
            await request(app)
                .delete(`/api/newsposts/${testPost.id}`)
                .expect(401);

            // Verify post still exists
            const postRepository = getTestDataSource().getRepository(Post);
            const existingPost = await postRepository.findOne({
                where: { id: testPost.id }
            });
            
            expect(existingPost).toBeTruthy();
        });

        it('should return 404 for non-existent post deletion', async () => {
            const response = await request(app)
                .delete('/api/newsposts/99999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Post not found');
        });
    });

    describe('GET /api/newsposts/categories', () => {
        beforeEach(async () => {
            // Create additional test categories
            const categoryRepository = getTestDataSource().getRepository(Category);
            const categories = [
                { name: 'Sports', description: 'Sports news' },
                { name: 'Entertainment', description: 'Entertainment news' }
            ];

            for (const categoryData of categories) {
                const category = categoryRepository.create(categoryData);
                await categoryRepository.save(category);
            }
        });

        it('should get all categories', async () => {
            const response = await request(app)
                .get('/api/newsposts/categories')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(3); // testCategory + 2 new ones
            
            response.body.forEach((category: any) => {
                expect(category).toHaveProperty('id');
                expect(category).toHaveProperty('name');
                expect(category).toHaveProperty('description');
            });
        });
    });
});
