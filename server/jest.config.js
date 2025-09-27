module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/integration.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/postsService.test.ts', 
    '<rootDir>/__tests__/postsService-fixed.test.ts'
  ],
  collectCoverageFrom: [
    'services/**/*.ts',
    'controller/**/*.ts',
    'routes/**/*.ts',
    '!**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: [],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  testTimeout: 30000,
};
