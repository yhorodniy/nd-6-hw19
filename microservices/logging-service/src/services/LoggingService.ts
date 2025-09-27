import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logDir = path.join(__dirname, '../../logs');

const generalLogTransport = new DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  level: 'info'
});

const errorLogTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
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

export class LoggingService {
  async logMessage(data: any) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        ...data
      };

      if (data.level === 'error') {
        logger.error(logEntry);
      } else {
        logger.info(logEntry);
      }

      return { success: true, message: 'Log entry recorded' };
    } catch (error) {
      logger.error('Failed to log message:', error);
      throw error;
    }
  }

  async logUserCreation(userData: any) {
    return this.logMessage({
      action: 'user_created',
      level: 'info',
      userId: userData.userId,
      email: userData.email,
      timestamp: userData.timestamp
    });
  }
}
