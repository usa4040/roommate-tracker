/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
    testPathIgnorePatterns: ['/node_modules/', '/__tests__/helpers/'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: 'tsconfig.test.json'
        }],
    },
    collectCoverageFrom: [
        '**/*.ts',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/__tests__/**',
    ],
    moduleFileExtensions: ['ts', 'js', 'json'],
    verbose: true,
};
