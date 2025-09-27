import { LoggingService, logger } from '../src/services/LoggingService';

// Mock winston
jest.mock('winston');
jest.mock('winston-daily-rotate-file');

describe('LoggingService', () => {
  let loggingService: LoggingService;
  let mockLogger: jest.Mocked<typeof logger>;

  beforeEach(() => {
    loggingService = new LoggingService();
    mockLogger = logger as jest.Mocked<typeof logger>;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('logMessage', () => {
    it('should log info message successfully', async () => {
      const logData = {
        message: 'Test info message',
        level: 'info',
        userId: 'user-123',
        action: 'test_action',
      };

      mockLogger.info = jest.fn();

      const result = await loggingService.logMessage(logData);

      expect(result).toEqual({
        success: true,
        message: 'Log entry recorded',
      });

      expect(mockLogger.info).toHaveBeenCalledWith({
        timestamp: expect.any(String),
        message: 'Test info message',
        level: 'info',
        userId: 'user-123',
        action: 'test_action',
      });
    });

    it('should log error message successfully', async () => {
      const logData = {
        message: 'Test error message',
        level: 'error',
        userId: 'user-123',
        action: 'test_error',
      };

      mockLogger.error = jest.fn();

      const result = await loggingService.logMessage(logData);

      expect(result).toEqual({
        success: true,
        message: 'Log entry recorded',
      });

      expect(mockLogger.error).toHaveBeenCalledWith({
        timestamp: expect.any(String),
        message: 'Test error message',
        level: 'error',
        userId: 'user-123',
        action: 'test_error',
      });
    });

    it('should default to info level when level is not specified', async () => {
      const logData = {
        message: 'Test message without level',
        userId: 'user-123',
      };

      mockLogger.info = jest.fn();

      const result = await loggingService.logMessage(logData);

      expect(result).toEqual({
        success: true,
        message: 'Log entry recorded',
      });

      expect(mockLogger.info).toHaveBeenCalledWith({
        timestamp: expect.any(String),
        message: 'Test message without level',
        userId: 'user-123',
      });
    });

    it('should handle logging errors gracefully', async () => {
      const logData = {
        message: 'Test message',
        level: 'info',
      };

      mockLogger.info = jest.fn().mockImplementation(() => {
        throw new Error('Logging failed');
      });
      mockLogger.error = jest.fn();

      await expect(loggingService.logMessage(logData)).rejects.toThrow('Logging failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to log message:',
        expect.any(Error)
      );
    });
  });

  describe('logUserCreation', () => {
    it('should log user creation successfully', async () => {
      const userData = {
        userId: 'user-123',
        email: 'test@example.com',
        timestamp: '2023-01-01T00:00:00.000Z',
      };

      mockLogger.info = jest.fn();

      const result = await loggingService.logUserCreation(userData);

      expect(result).toEqual({
        success: true,
        message: 'Log entry recorded',
      });

      expect(mockLogger.info).toHaveBeenCalledWith({
        timestamp: expect.any(String),
        action: 'user_created',
        level: 'info',
        userId: 'user-123',
        email: 'test@example.com',
      });
    });

    it('should handle user creation logging errors', async () => {
      const userData = {
        userId: 'user-123',
        email: 'test@example.com',
        timestamp: '2023-01-01T00:00:00.000Z',
      };

      mockLogger.info = jest.fn().mockImplementation(() => {
        throw new Error('Logging user creation failed');
      });
      mockLogger.error = jest.fn();

      await expect(loggingService.logUserCreation(userData)).rejects.toThrow(
        'Logging user creation failed'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to log message:',
        expect.any(Error)
      );
    });
  });

  describe('Logger instance', () => {
    it('should create logger with correct configuration', () => {
      // Since winston is mocked, we can only test that the logger is created
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple log entries in sequence', async () => {
      const logEntries = [
        { message: 'First log', level: 'info', action: 'action1' },
        { message: 'Second log', level: 'error', action: 'action2' },
        { message: 'Third log', level: 'info', action: 'action3' },
      ];

      mockLogger.info = jest.fn();
      mockLogger.error = jest.fn();

      const results = await Promise.all(
        logEntries.map((entry) => loggingService.logMessage(entry))
      );

      results.forEach((result) => {
        expect(result).toEqual({
          success: true,
          message: 'Log entry recorded',
        });
      });

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent user creation logs', async () => {
      const userDataList = [
        {
          userId: 'user-1',
          email: 'user1@example.com',
          timestamp: '2023-01-01T00:00:00.000Z',
        },
        {
          userId: 'user-2',
          email: 'user2@example.com',
          timestamp: '2023-01-01T00:01:00.000Z',
        },
        {
          userId: 'user-3',
          email: 'user3@example.com',
          timestamp: '2023-01-01T00:02:00.000Z',
        },
      ];

      mockLogger.info = jest.fn();

      const results = await Promise.all(
        userDataList.map((userData) => loggingService.logUserCreation(userData))
      );

      results.forEach((result) => {
        expect(result).toEqual({
          success: true,
          message: 'Log entry recorded',
        });
      });

      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });
  });
});
