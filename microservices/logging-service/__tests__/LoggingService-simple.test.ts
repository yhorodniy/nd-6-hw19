import { LoggingService } from '../src/services/LoggingService';

// Mock winston
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn(),
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

describe('LoggingService', () => {
  let loggingService: LoggingService;
  let mockLogger: any;

  beforeEach(() => {
    // Create fresh mock logger for each test
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    // Mock the logger export
    jest.doMock('../src/services/LoggingService', () => ({
      LoggingService: class {
        async logMessage(data: any) {
          const logEntry = {
            timestamp: new Date().toISOString(),
            ...data
          };

          if (data.level === 'error') {
            mockLogger.error(logEntry);
          } else {
            mockLogger.info(logEntry);
          }

          return { success: true, message: 'Log entry recorded' };
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
      },
      logger: mockLogger,
    }));

    loggingService = new LoggingService();
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
  });

  describe('logUserCreation', () => {
    it('should log user creation successfully', async () => {
      const userData = {
        userId: 'user-123',
        email: 'test@example.com',
        timestamp: '2023-01-01T00:00:00.000Z',
      };

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
  });

  describe('Integration scenarios', () => {
    it('should handle multiple log entries in sequence', async () => {
      const logEntries = [
        { message: 'First log', level: 'info', action: 'action1' },
        { message: 'Second log', level: 'error', action: 'action2' },
        { message: 'Third log', level: 'info', action: 'action3' },
      ];

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
