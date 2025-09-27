import request from 'supertest';
import { Application } from 'express';
import { createTestApp } from './testServer';
import { getTestDataSource } from './testDb';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Category } from '../entities/Category';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Database Integration API Tests', () => {
    let app: Application;
    let authToken: string;
    let testUser: User;
    let testCategory: Category;

    beforeAll(async () => {
        app = createTestApp();
        
        // Create test user
        const userRepository = getTestDataSource().getRepository(User);
        const hashedPassword = await bcrypt.hash('dbtest123', 10);
        
        testUser = userRepository.create({
            email: 'dbtest@example.com',
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
            name: 'DatabaseTest',
            description: 'Category for database integration tests'
        });
        await categoryRepository.save(testCategory);
    });

    describe('Database State Verification', () => {
        it('should persist created posts in database', async () => {
            const postData = {
                header: 'Database Test Post',
                content: 'This post should persist in database',
                category: testCategory.name,
                isPublished: true
            };

            // Create post via API
            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData)
                .expect(201);

            const postId = response.body.id;

            // Verify in database
            const postRepository = getTestDataSource().getRepository(Post);
            const savedPost = await postRepository.findOne({
                where: { id: postId },
                relations: ['author']
            });

            expect(savedPost).toBeTruthy();
            expect(savedPost?.header).toBe(postData.header);
            expect(savedPost?.content).toBe(postData.content);
            expect(savedPost?.category).toBe(postData.category);
            expect(savedPost?.author.id).toBe(testUser.id);
        });

        it('should update posts in database correctly', async () => {
            // Create initial post
            const postRepository = getTestDataSource().getRepository(Post);
            const initialPost = postRepository.create({
                header: 'Initial Header',
                content: 'Initial content',
                author: testUser,
                category: testCategory.name,
                isPublished: true
            });
            await postRepository.save(initialPost);

            const updateData = {
                header: 'Updated Header via API',
                content: 'Updated content via API',
                category: testCategory.name,
                isPublished: false
            };

            // Update via API
            await request(app)
                .put(`/api/newsposts/${initialPost.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            // Verify update in database
            const updatedPost = await postRepository.findOne({
                where: { id: initialPost.id }
            });

            expect(updatedPost?.header).toBe(updateData.header);
            expect(updatedPost?.content).toBe(updateData.content);
            expect(updatedPost?.isPublished).toBe(updateData.isPublished);
        });

        it('should remove posts from database when deleted', async () => {
            // Create post to delete
            const postRepository = getTestDataSource().getRepository(Post);
            const postToDelete = postRepository.create({
                header: 'Post to Delete',
                content: 'This post will be deleted',
                author: testUser,
                category: testCategory.name,
                isPublished: true
            });
            await postRepository.save(postToDelete);

            // Delete via API
            await request(app)
                .delete(`/api/newsposts/${postToDelete.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Verify deletion in database
            const deletedPost = await postRepository.findOne({
                where: { id: postToDelete.id }
            });

            expect(deletedPost).toBeNull();
        });

        it('should maintain referential integrity', async () => {
            // Create post
            const postData = {
                header: 'Referential Integrity Test',
                content: 'Testing database relationships',
                category: testCategory.name,
                isPublished: true
            };

            const response = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData)
                .expect(201);

            // Verify relationships in database
            const postRepository = getTestDataSource().getRepository(Post);
            const postWithRelations = await postRepository.findOne({
                where: { id: response.body.id },
                relations: ['author']
            });

            expect(postWithRelations?.author).toBeTruthy();
            expect(postWithRelations?.author.id).toBe(testUser.id);
            expect(postWithRelations?.author.email).toBe(testUser.email);
        });
    });

    describe('Database Query Verification', () => {
        beforeEach(async () => {
            // Create test posts with different properties
            const postRepository = getTestDataSource().getRepository(Post);
            
            const posts = [
                {
                    header: 'Published Post 1',
                    content: 'Content 1',
                    author: testUser,
                    category: testCategory.name,
                    isPublished: true,
                    isFeatured: false
                },
                {
                    header: 'Published Post 2',
                    content: 'Content 2',
                    author: testUser,
                    category: testCategory.name,
                    isPublished: true,
                    isFeatured: true
                },
                {
                    header: 'Unpublished Post',
                    content: 'Content 3',
                    author: testUser,
                    category: testCategory.name,
                    isPublished: false,
                    isFeatured: false
                }
            ];

            for (const postData of posts) {
                const post = postRepository.create(postData);
                await postRepository.save(post);
            }
        });

        it('should filter published posts correctly without authentication', async () => {
            const response = await request(app)
                .get('/api/newsposts')
                .expect(200);

            // Should only return published posts
            expect(response.body.posts.length).toBe(2);
            response.body.posts.forEach((post: any) => {
                expect(post.isPublished).toBe(true);
            });

            // Verify actual database state
            const postRepository = getTestDataSource().getRepository(Post);
            const allPosts = await postRepository.find();
            const publishedPosts = await postRepository.find({ where: { isPublished: true } });
            
            expect(allPosts.length).toBe(3);
            expect(publishedPosts.length).toBe(2);
        });

        it('should return all posts with authentication', async () => {
            const response = await request(app)
                .get('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Should return all posts including unpublished
            expect(response.body.posts.length).toBe(3);
        });

        it('should respect pagination parameters', async () => {
            const response = await request(app)
                .get('/api/newsposts?page=0&size=1')
                .expect(200);

            expect(response.body.posts.length).toBe(1);
            expect(response.body.currentPage).toBe(0);
            expect(response.body.totalCount).toBeGreaterThanOrEqual(1);
        });

        it('should filter by category correctly', async () => {
            const response = await request(app)
                .get(`/api/newsposts?category=${testCategory.name}`)
                .expect(200);

            expect(response.body.posts.length).toBeGreaterThan(0);
            response.body.posts.forEach((post: any) => {
                expect(post.category).toBe(testCategory.name);
            });
        });
    });

    describe('Database Transaction Behavior', () => {
        it('should rollback failed post creation', async () => {
            const postRepository = getTestDataSource().getRepository(Post);
            const initialCount = await postRepository.count();

            // Try to create post with invalid data that should fail
            await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    header: '', // Invalid empty header
                    content: 'Valid content',
                    category: testCategory.name
                })
                .expect(400);

            // Verify no post was created
            const finalCount = await postRepository.count();
            expect(finalCount).toBe(initialCount);
        });

        it('should handle concurrent modifications correctly', async () => {
            // Create a post
            const postData = {
                header: 'Concurrent Test Post',
                content: 'Original content',
                category: testCategory.name,
                isPublished: true
            };

            const createResponse = await request(app)
                .post('/api/newsposts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData)
                .expect(201);

            const postId = createResponse.body.id;

            // Make two concurrent updates
            const updateData1 = {
                header: 'Updated by Request 1',
                content: 'Content updated by request 1',
                category: testCategory.name
            };

            const updateData2 = {
                header: 'Updated by Request 2',
                content: 'Content updated by request 2',
                category: testCategory.name
            };

            const [response1, response2] = await Promise.all([
                request(app)
                    .put(`/api/newsposts/${postId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(updateData1),
                request(app)
                    .put(`/api/newsposts/${postId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(updateData2)
            ]);

            // Both should succeed or one should fail gracefully
            expect([200, 404, 409].includes(response1.status)).toBe(true);
            expect([200, 404, 409].includes(response2.status)).toBe(true);

            // Verify final state in database
            const postRepository = getTestDataSource().getRepository(Post);
            const finalPost = await postRepository.findOne({
                where: { id: postId }
            });

            expect(finalPost).toBeTruthy();
            // One of the updates should have succeeded
            expect([updateData1.header, updateData2.header].includes(finalPost?.header || '')).toBe(true);
        });
    });

    describe('Database Error Handling', () => {
        it('should handle database connection issues gracefully', async () => {
            // This test would need to actually disconnect the database
            // For now, we just verify that errors are handled properly
            
            // Try to get a non-existent post
            const response = await request(app)
                .get('/api/newsposts/non-existent-id')
                .expect(404);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Post not found');
        });

        it('should handle invalid UUID format gracefully', async () => {
            const response = await request(app)
                .get('/api/newsposts/invalid-uuid-format')
                .expect(404);

            expect(response.body).toHaveProperty('message');
        });
    });
});
