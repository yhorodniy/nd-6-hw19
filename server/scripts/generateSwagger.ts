import swaggerAutogen from 'swagger-autogen';
import path from 'path';

const doc = {
    info: {
        title: 'News Posts API',
        description: 'API для управління новинними постами',
        version: '1.0.0',
    },
    host: 'localhost:8000',
    schemes: ['http'],
    basePath: '/api',
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Bearer token for authentication. Format: Bearer <token>'
        }
    },
    definitions: {
        Post: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                header: { type: 'string', example: 'Breaking News: Important Update' },
                content: { type: 'string', example: 'This is the full content of the news post...' },
                excerpt: { type: 'string', example: 'Short summary of the news post' },
                image: { type: 'string', example: 'https://example.com/image.jpg' },
                category: { type: 'string', example: 'Technology' },
                tags: { 
                    type: 'array', 
                    items: { type: 'string' },
                    example: ['tech', 'news', 'update']
                },
                author_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
                author_email: { type: 'string', example: 'author@example.com' },
                is_published: { type: 'boolean', example: true },
                is_featured: { type: 'boolean', example: false },
                views_count: { type: 'number', example: 150 },
                likes_count: { type: 'number', example: 25 },
                slug: { type: 'string', example: 'breaking-news-important-update' },
                meta_title: { type: 'string', example: 'Breaking News | News Site' },
                meta_description: { type: 'string', example: 'Read about the latest breaking news and important updates' },
                reading_time: { type: 'number', example: 5 },
                created_at: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00Z' },
                updated_at: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00Z' },
                published_at: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00Z' },
                deleted: { type: 'boolean', example: false }
            }
        },
        PostCreateRequest: {
            type: 'object',
            required: ['header', 'content'],
            properties: {
                header: { type: 'string', example: 'New Post Title' },
                content: { type: 'string', example: 'Content of the new post...' },
                excerpt: { type: 'string', example: 'Short summary' },
                image: { type: 'string', example: 'https://example.com/image.jpg' },
                category: { type: 'string', example: 'Technology' },
                tags: { 
                    type: 'array', 
                    items: { type: 'string' },
                    example: ['tech', 'news']
                },
                is_published: { type: 'boolean', example: true },
                is_featured: { type: 'boolean', example: false },
                meta_title: { type: 'string', example: 'New Post | News Site' },
                meta_description: { type: 'string', example: 'Description for SEO' }
            }
        },
        PostUpdateRequest: {
            type: 'object',
            properties: {
                header: { type: 'string', example: 'Updated Post Title' },
                content: { type: 'string', example: 'Updated content...' },
                excerpt: { type: 'string', example: 'Updated summary' },
                image: { type: 'string', example: 'https://example.com/new-image.jpg' },
                category: { type: 'string', example: 'Business' },
                tags: { 
                    type: 'array', 
                    items: { type: 'string' },
                    example: ['business', 'update']
                },
                is_published: { type: 'boolean', example: true },
                is_featured: { type: 'boolean', example: false },
                meta_title: { type: 'string', example: 'Updated Post | News Site' },
                meta_description: { type: 'string', example: 'Updated description for SEO' }
            }
        },
        PaginatedResponse: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { '$ref': '#/definitions/Post' }
                },
                pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'number', example: 0 },
                        size: { type: 'number', example: 10 },
                        total: { type: 'number', example: 100 },
                        totalPages: { type: 'number', example: 10 }
                    }
                }
            }
        },
        Category: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174002' },
                name: { type: 'string', example: 'Technology' },
                description: { type: 'string', example: 'Technology related news' }
            }
        },
        ErrorResponse: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Error message' },
                message: { type: 'string', example: 'Detailed error description' },
                status: { type: 'number', example: 400 }
            }
        },
        User: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
                email: { type: 'string', example: 'user@example.com' },
                created_at: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00Z' },
                updated_at: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00Z' }
            }
        },
        LoginRequest: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' },
                password: { type: 'string', minLength: 6, example: 'password123' }
            }
        },
        LoginResponse: {
            type: 'object',
            properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
                        email: { type: 'string', example: 'user@example.com' }
                    }
                }
            }
        }
    }
};

const outputFile = path.join(__dirname, '../swagger-output.json');
const endpointsFiles = [
    path.join(__dirname, './swaggerPaths.ts')
];

const generateSwagger = async () => {
    try {
        await swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
        console.log('Swagger documentation generated successfully!');
    } catch (error) {
        console.error('Error generating Swagger documentation:', error);
    }
};

generateSwagger();
