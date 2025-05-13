module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.js',
        'utils/**/*.js',
        '!**/node_modules/**',
        '!**/vendor/**'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    testPathIgnorePatterns: [
        '/node_modules/'
    ],
    setupFilesAfterEnv: ['./tests/setup.js'],
    testTimeout: 10000
}; 