import { Request, Response, NextFunction } from 'express';
import { logger } from '../helpers/logger';

export const swaggerGuard = (req: Request, res: Response, next: NextFunction): void => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const allowSwaggerInProduction = process.env.ALLOW_SWAGGER_IN_PRODUCTION === 'true';
    
    if (!isDevelopment && !allowSwaggerInProduction) {
        logger.warn(`Swagger access denied in production: ${req.ip} tried to access ${req.path}`);
        res.status(404).json({ 
            error: 'Not Found',
            message: 'API documentation is not available in production'
        });
        return;
    }
    
    next();
};
