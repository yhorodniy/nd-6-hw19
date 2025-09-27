import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || '1234567890abcdef') as any;

        (req as AuthenticatedRequest).user = {
            id: decoded.userId,
            email: decoded.email,
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || '1234567890abcdef') as any;

                (req as AuthenticatedRequest).user = {
                    id: decoded.userId,
                    email: decoded.email,
                };
            } catch (error) {
                console.log('Optional auth failed:', error);
            }
        }

        next();
    } catch (error) {
        next();
    }
};
