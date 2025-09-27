import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { SERVER_LOGS } from '../config/paths';

const generalLogTransport = new DailyRotateFile({
    filename: path.join(SERVER_LOGS, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    level: 'info'
});

const errorLogTransport = new DailyRotateFile({
    filename: path.join(SERVER_LOGS, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '1m',
    maxFiles: '5d',
    level: 'error'
});

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        generalLogTransport,
        errorLogTransport
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const logData = {
        method: req.method,
        url: req.url,
        body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined
    };

    logger.info('Incoming request', logData);
    next();
};

