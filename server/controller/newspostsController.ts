import { Request, Response, NextFunction } from 'express';
import { PostsService } from '../services/postsService';
import { AuthenticatedRequest } from '../helpers/auth';
import { PostCreateRequest, PostUpdateRequest } from '../types/types';

const postsService = new PostsService();

export const getNewsPosts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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
    try {
        const page = parseInt(req.query.page as string) || 0;
        const size = parseInt(req.query.size as string) || 10;
        let category = req.query.category as string | undefined;
        if (category && category === 'All Genres') {
            category = undefined;
        }
        
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.id;

        const posts = await postsService.getAllPosts(page, size, category, userId);

        return res.status(200).json(posts);
    } catch (error) {
        next(error);
    }
};

export const getSinglePost = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<Response | void> => {
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
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'Post ID is required' });
        }

        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.id;

        const post = await postsService.getPostById(id, userId);
        return res.status(200).json(post);
    } catch (error) {
        next(error);
    }
};

export const createPost = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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
    try {
        debugger;
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const postData: PostCreateRequest = req.body;
        const newPost = await postsService.createPost(postData, authReq.user.id);

        return res.status(201).json(newPost);
    } catch (error) {
        next(error);
    }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'Post ID is required' });
        }

        const postData: PostUpdateRequest = req.body;
        const updatedPost = await postsService.updatePost(id, postData, authReq.user.id);

        return res.status(200).json(updatedPost);
    } catch (error) {
        next(error);
    }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'Post ID is required' });
        }

        await postsService.deletePost(id, authReq.user.id);

        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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
    try {
        const categories = await postsService.getCategories();
        return res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

export const triggerError = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const error = new Error('This is a test error');
    next(error);
};
