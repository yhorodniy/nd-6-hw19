import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createUser, loginUser, getUserById } from './controllers/userController';
import { redisClient } from './services/redisClient';

const app = express();
const PORT = 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.post('/users/create', createUser);
app.post('/users/login', loginUser);
app.get('/users/:id', getUserById);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'user-service' });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
    
    app.listen(PORT, () => {
      console.log(`User Service running on port ${PORT}`);
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
