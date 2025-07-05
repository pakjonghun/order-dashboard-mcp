/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/test/**/*.test.ts'],
  roots: ['<rootDir>/src'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      useESM: false,
    },
  },
};
