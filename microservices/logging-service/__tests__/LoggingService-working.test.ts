import { LoggingService } from '../src/services/LoggingService';

// Mock winston and winston-daily-rotate-file
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

jest.mock('winston', () => ({
  createLogger: jest.fn(() => mockLogger),
  format: {
    combine: jest.fn(() => 'combined-format'),
    timestamp: jest.fn(() => 'timestamp-format'),
    errors: jest.fn(() => 'errors-format'),
    json: jest.fn(() => 'json-format'),
    colorize: jest.fn(() => 'colorize-format'),
    simple: jest.fn(() => 'simple-format'),
  },
  transports: {
    Console: jest.fn(),
  },
}));

jest.mock('winston-daily-rotate-file', () => {
  return jest.fn().mockImplementation(() => ({
    filename: 'test-log.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
  }));
});

// Mock logger instance that gets imported
jest.mock('../src/services/LoggingService', () => {
  const originalModule = jest.requireActual('../src/services/LoggingService');
  return {
    ...originalModule,
    logger: mockLogger,
  };
});

describe('LoggingService', () => {
  let loggingService: LoggingService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    loggingService = new LoggingService();
  });

  describe('logMessage', () => {
    it('should log info message successfully', async () => {
      const logData = {
        message: 'Test info message',
        level: 'info',
        userId: 'user-123',
        action: 'test_action'
      };

      const result = await loggingService.logMessage(logData);

      expect(result).toEqual({
        success: true,
        message: 'Log entry recorded'
      });

      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test info message',
          level: 'info',
          userId: 'user-123',
          action: 'test_action',
          timestamp: expect.any(String),
        })
      );
    });

    it('should log error message successfully', async () => {
      const logData = {
        message: 'Test error message',
        level: 'error',
        userId: 'user-123',
        action: 'test_error'
      };

      const result = await loggingService.logMessage(logData);

      expect(result).toEqual({
        success: true,
        message: 'Log entry recorded'
      });

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error message',
          level: 'error',
          userId: 'user-123',
          action: 'test_error',
          timestamp: expect.any(String),
        })
      );
    });

    it('should default to info level when level is not specified', async () => {
      const logData = {
        message: 'Test message without level',
        userId: 'user-123'
      };

      const result = await loggingService.logMessage(logData);

      expect(result).toEqual({
        success: true,
        message: 'Log entry recorded'
      });

      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test message without level',
          userId: 'user-123',
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('logUserCreation', () => {
    it('should log user creation successfully', async () => {
      const userData = {
        userId: 'user-123',
        email: 'test@example.com',
        timestamp: '2023-01-01T00:00:00.000Z'
      };

      const result = await loggingService.logUserCreation(userData);

      expect(result).toEqual({
        success: true,
        message: 'Log entry recorded'
      });

      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'user_created',
          level: 'info',
          userId: 'user-123',
          email: 'test@example.com',
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should handle logging errors gracefully', async () => {
      // Make logger.info throw an error
      mockLogger.info.mockImplementation(() => {
        throw new Error('Winston error');
      });

      const logData = {
        message: 'Test message',
        level: 'info'
      };

      await expect(loggingService.logMessage(logData)).rejects.toThrow('Winston error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to log message:',
        expect.any(Error)
      );
    });
  });
});
