/**
 * This file defines the Swagger paths for the News Posts API.
 * It contains the correct paths with prefixes taken into account
 */

import express from 'express';

const router = express.Router();

// News Posts endpoints
router.get('/newsposts/categories', (req, res) => {
    /*  #swagger.tags = ['Categories']
        #swagger.description = 'Get a list of all categories'
        #swagger.responses[200] = {
            description: 'List of categories successfully retrieved',
            schema: {
                type: 'array',
                items: { $ref: '#/definitions/Category' }
            }
        }
        #swagger.responses[500] = {
            description: 'Internal server error',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
    */
    res.json([]);
});

router.get('/newsposts', (req, res) => {
    /*  #swagger.tags = ['News Posts']
        #swagger.description = 'Get a list of news posts with pagination and filtering'
        #swagger.parameters['page'] = {
            in: 'query',
            description: 'Page number (starting from 0)',
            required: false,
            type: 'integer',
            example: 0
        }
        #swagger.parameters['size'] = {
            in: 'query',
            description: 'Number of posts per page',
            required: false,
            type: 'integer',
            example: 10
        }
        #swagger.parameters['category'] = {
            in: 'query',
            description: 'Category for filtering posts',
            required: false,
            type: 'string',
            example: 'Technology'
        }
        #swagger.responses[200] = {
            description: 'List of posts successfully retrieved',
            schema: { $ref: '#/definitions/PaginatedResponse' }
        }
        #swagger.responses[500] = {
            description: 'Internal server error',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.security = [{ "bearerAuth": [] }]
    */
    res.json({});
});

router.get('/newsposts/{id}', (req, res) => {
    /*  #swagger.tags = ['News Posts']
        #swagger.description = 'Get a specific news post by ID'
        #swagger.parameters['id'] = {
            in: 'path',
            description: 'Post ID',
            required: true,
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
        }
        #swagger.responses[200] = {
            description: 'Post successfully retrieved',
            schema: { $ref: '#/definitions/Post' }
        }
        #swagger.responses[400] = {
            description: 'Invalid post ID',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.responses[404] = {
            description: 'Post not found',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.security = [{ "bearerAuth": [] }]
    */
    res.json({});
});

router.post('/newsposts', (req, res) => {
    /*  #swagger.tags = ['News Posts']
        #swagger.description = 'Create a new news post'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Data for creating a post',
            required: true,
            schema: { $ref: '#/definitions/PostCreateRequest' }
        }
        #swagger.responses[201] = {
            description: 'Post successfully created',
            schema: { $ref: '#/definitions/Post' }
        }
        #swagger.responses[400] = {
            description: 'Invalid data for creating a post',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.responses[401] = {
            description: 'User not authenticated',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.security = [{ "bearerAuth": [] }]
    */
    res.json({});
});

router.put('/newsposts/{id}', (req, res) => {
    /*  #swagger.tags = ['News Posts']
        #swagger.description = 'Update an existing news post'
        #swagger.parameters['id'] = {
            in: 'path',
            description: 'Post ID to update',
            required: true,
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
        }
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Data for updating a post',
            required: true,
            schema: { $ref: '#/definitions/PostUpdateRequest' }
        }
        #swagger.responses[200] = {
            description: 'Post successfully updated',
            schema: { $ref: '#/definitions/Post' }
        }
        #swagger.responses[400] = {
            description: 'Invalid data or post ID',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.responses[401] = {
            description: 'User not authenticated',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.responses[403] = {
            description: 'Insufficient permissions to update post',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.responses[404] = {
            description: 'Post not found',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.security = [{ "bearerAuth": [] }]
    */
    res.json({});
});

router.delete('/newsposts/{id}', (req, res) => {
    /*  #swagger.tags = ['News Posts']
        #swagger.description = 'Delete a news post'
        #swagger.parameters['id'] = {
            in: 'path',
            description: 'Post ID to delete',
            required: true,
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
        }
        #swagger.responses[204] = {
            description: 'Post successfully deleted'
        }
        #swagger.responses[400] = {
            description: 'Invalid post ID',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.responses[401] = {
            description: 'User not authenticated',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.responses[403] = {
            description: 'Insufficient permissions to delete post',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.responses[404] = {
            description: 'Post not found',
            schema: { $ref: '#/definitions/ErrorResponse' }
        }
        #swagger.security = [{ "bearerAuth": [] }]
    */
    res.json({});
});

router.get('/health', (req, res) => {
    /*  #swagger.tags = ['Health Check']
        #swagger.description = 'Check the health status of the server'
        #swagger.responses[200] = {
            description: 'Server is running normally',
            schema: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'OK' },
                    timestamp: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00Z' },
                    uptime: { type: 'number', example: 3600 },
                    version: { type: 'string', example: '1.0.0' }
                }
            }
        }
    */
    res.json({});
});

export default router;
