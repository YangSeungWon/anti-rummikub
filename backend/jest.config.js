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
        '**/tests/**/*.test.js',
        '**/tests/**/*.spec.js',
        '**/__tests__/**/*.js',
        '**/?(*.)+(spec|test).js'
    ],
    testPathIgnorePatterns: [
        '/node_modules/'
    ],
    setupFilesAfterEnv: ['./tests/config/global-setup.js'],
    testTimeout: 30000,
    forceExit: true,
    clearMocks: true,
    restoreMocks: true,
    maxWorkers: 1 // 병렬 실행을 방지하여 메모리 DB 충돌 방지
}; 