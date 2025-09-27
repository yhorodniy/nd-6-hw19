import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createLog } from './controllers/loggingController';
import { redisClient } from './services/redisClient';
import { LoggingService } from './services/LoggingService';

const app = express();
const PORT = 3002;
const loggingService = new LoggingService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.post('/logs', createLog);

// Health check
app.get('/health', (req: any, res: any) => {
  res.status(200).json({ status: 'OK', service: 'logging-service' });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req: any, res: any) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');

    // Subscribe to user creation events
    await redisClient.subscribe('user:created', async (message: string) => {
      try {
        const userData = JSON.parse(message);
        await loggingService.logUserCreation(userData);
        console.log('Logged user creation:', userData);
      } catch (error) {
        console.error('Failed to log user creation:', error);
      }
    });

    // Subscribe to user login events
    await redisClient.subscribe('user:logged_in', async (message: string) => {
      try {
        const userData = JSON.parse(message);
        await loggingService.logMessage({
          action: 'user_logged_in',
          level: 'info',
          userId: userData.userId,
          email: userData.email,
          timestamp: userData.timestamp
        });
        console.log('Logged user login:', userData);
      } catch (error) {
        console.error('Failed to log user login:', error);
      }
    });

    console.log('Subscribed to user:created and user:logged_in channels');
    
    app.listen(PORT, () => {
      console.log(`Logging Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await redisClient.disconnect();
  process.exit(0);
});

startServer();
