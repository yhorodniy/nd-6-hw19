import { Request, Response, NextFunction } from 'express';
import { ValidationError, NewspostsServiceError, AuthServiceError } from './errors';
import { logger } from './logger';
import { ErrorResponse } from '../types/types';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
    if (error instanceof ValidationError) {
        logger.warn('Validation error occurred', {
            message: error.message,
            details: error.details,
            url: req.url,
            method: req.method
        });
        
        const response: ErrorResponse = {
            message: error.message,
            status: 400
        };

        if (process.env.NODE_ENV === 'development') {
            response.stack = error.stack;
        }

        res.status(400).json(response);
        return;
    }

    if (error instanceof AuthServiceError) {
        logger.warn('Auth service error occurred', {
            message: error.message,
            statusCode: error.statusCode,
            originalError: error.originalError?.message,
            url: req.url,
            method: req.method
        });

        const response: ErrorResponse = {
            message: error.message,
            status: error.statusCode
        };

        if (process.env.NODE_ENV === 'development') {
            response.stack = error.stack;
        }

        res.status(error.statusCode).json(response);
        return;
    }

    if (error instanceof NewspostsServiceError) {
        logger.error('Service error occurred', {
            message: error.message,
            originalError: error.originalError?.message,
            stack: error.stack,
            url: req.url,
            method: req.method
        });

        const response: ErrorResponse = {
            message: error.message,
            status: 500
        };

        if (process.env.NODE_ENV === 'development') {
            response.stack = error.stack;
        }

        res.status(500).json(response);
        return;
    }

    logger.error('Unexpected error occurred', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
    });

    const response: ErrorResponse = {
        message: 'Internal server error',
        status: 500
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
        response.originalMessage = error.message;
    }

    res.status(500).json(response);
};
