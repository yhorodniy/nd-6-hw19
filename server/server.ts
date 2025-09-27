import 'reflect-metadata';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { swaggerOptions } from './config/swagger';

import staticGet from './routes/staticGet';
import newsPosts from './routes/newsPosts';
import healthRoute from './routes/health';
import { errorHandler } from './helpers/errorHandler';
import { logger, requestLogger } from './helpers/logger';
import { CLIENT_DIST } from './config/paths';
import { triggerError } from './controller/newspostsController';
import { initializeDatabase } from './config/database';
import { swaggerGuard } from './middleware/swaggerGuard';

dotenv.config();

const app: Application = express();
const PORT: string | number = process.env.PORT || 8000;

app.use(express.json());
app.use(express.static(CLIENT_DIST));
app.use(cors({
    origin: process.env.REDIRECT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(requestLogger);

// Generate Swagger documentation
const generateSwaggerDocs = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        exec('ts-node scripts/generateSwagger.ts', { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                logger.error('Error generating Swagger docs:', error);
                reject(error);
                return;
            }
            if (stderr) {
                logger.warn('Swagger generation warning:', stderr);
            }
            logger.info('Swagger documentation generated:', stdout);
            resolve();
        });
    });
};

// Setup Swagger UI
const setupSwagger = () => {
    const swaggerPath = path.join(__dirname, 'swagger-output.json');
    
    if (fs.existsSync(swaggerPath)) {
        try {
            const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
            
            // Swagger UI with guard
            app.use('/api-docs', swaggerGuard, swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
            
            // Raw JSON endpoint with guard
            app.get('/api-docs.json', swaggerGuard, (req, res) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(swaggerDocument);
            });
            
            logger.info('Swagger UI setup completed at /api-docs');
            logger.info('Swagger JSON available at /api-docs.json');
        } catch (error) {
            logger.error('Error reading swagger-output.json:', error);
        }
    } else {
        logger.warn('swagger-output.json not found, Swagger UI not available');
    }
};

app.use('/api/newsposts', newsPosts);
app.use('/api', healthRoute);
app.use('/', staticGet);

app.use('/error', triggerError);

app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
    try {
        await initializeDatabase();
        
        // Generate Swagger documentation before starting server
        await generateSwaggerDocs();
        
        // Setup Swagger UI
        setupSwagger();
        
        app.listen(PORT, () => {
            logger.info(`Server is running on http://localhost:${PORT}`);
            logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
