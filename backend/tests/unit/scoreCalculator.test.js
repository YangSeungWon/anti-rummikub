const { calculateScore } = require('../../utils/scoreCalculator');

describe('Score Calculator', () => {
    test('should calculate correct score for all positive votes', () => {
        const votes = [
            { userId: 'user1', vote: true },
            { userId: 'user2', vote: true },
            { userId: 'user3', vote: true },
        ];

        const difficulty = 2;

        const score = calculateScore(votes, difficulty);

        // 100% positive votes with difficulty 2 should give maximum score
        expect(score).toBe(2 * 10); // 20 points
    });

    test('should calculate correct score for mixed votes', () => {
        const votes = [
            { userId: 'user1', vote: true },
            { userId: 'user2', vote: true },
            { userId: 'user3', vote: false },
            { userId: 'user4', vote: false },
        ];

        const difficulty = 3;

        const score = calculateScore(votes, difficulty);

        // 50% positive votes with difficulty 3 should give half the maximum score
        expect(score).toBe(Math.floor(3 * 10 * 0.5)); // 15 points
    });

    test('should calculate correct score for all negative votes', () => {
        const votes = [
            { userId: 'user1', vote: false },
            { userId: 'user2', vote: false },
            { userId: 'user3', vote: false },
        ];

        const difficulty = 1;

        const score = calculateScore(votes, difficulty);

        // 0% positive votes should give zero points
        expect(score).toBe(0);
    });

    test('should handle empty votes array', () => {
        const votes = [];
        const difficulty = 2;

        const score = calculateScore(votes, difficulty);

        // No votes should result in zero points
        expect(score).toBe(0);
    });

    test('should handle missing difficulty', () => {
        const votes = [
            { userId: 'user1', vote: true },
            { userId: 'user2', vote: true },
        ];

        // Default difficulty should be 1
        const score = calculateScore(votes);

        // 100% positive votes with default difficulty 1 should give 10 points
        expect(score).toBe(10);
    });

    test('should limit maximum score based on difficulty', () => {
        const votes = [
            { userId: 'user1', vote: true },
            { userId: 'user2', vote: true },
        ];

        // Maximum difficulty (5 in our system)
        const difficulty = 5;

        const score = calculateScore(votes, difficulty);

        // 100% positive votes with maximum difficulty should give maximum points
        expect(score).toBe(5 * 10); // 50 points
    });

    test('should handle decimal percentages correctly', () => {
        const votes = [
            { userId: 'user1', vote: true },
            { userId: 'user2', vote: true },
            { userId: 'user3', vote: false },
        ];

        const difficulty = 2;

        const score = calculateScore(votes, difficulty);

        // 66.67% positive votes with difficulty 2 should round down to the nearest integer
        expect(score).toBe(Math.floor(2 * 10 * (2 / 3))); // 13 points
    });
}); 