const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './',
})

const customJestConfig = {
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/lib/(.*)$': '<rootDir>/lib/$1',
        '^@/store/(.*)$': '<rootDir>/store/$1',
        '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    clearMocks: true,
    testMatch: [
        '**/tests/**/*.test.js',
        '**/tests/**/*.integration.test.js',
    ],
}

module.exports = createJestConfig(customJestConfig)