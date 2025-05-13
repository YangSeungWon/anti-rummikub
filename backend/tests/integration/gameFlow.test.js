const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../src/models/User');
const Game = require('../../src/models/Game');
const Topic = require('../../src/models/Topic');

describe('Game Flow Integration Tests', () => {
    let testUsers = [];
    let gameId;
    let accessTokens = [];

    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/anti-rummikub-test');

        // Create test users
        const users = [
            { username: 'testuser1', password: 'password123' },
            { username: 'testuser2', password: 'password123' },
            { username: 'testuser3', password: 'password123' },
        ];

        // Clear existing users and create new ones
        await User.deleteMany({});

        // Create users and store their tokens
        for (const user of users) {
            const res = await request(app)
                .post('/api/auth/signup')
                .send(user);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();

            testUsers.push(res.body.user);
            accessTokens.push(res.body.token);
        }

        // Create test topics
        await Topic.deleteMany({});
        await Topic.create([
            { content: '스마트폰', category: '기술', difficulty: 1 },
            { content: '등산', category: '취미', difficulty: 2 },
            { content: '양자역학', category: '과학', difficulty: 3 },
        ]);
    });

    afterAll(async () => {
        // Clean up
        await Game.deleteMany({});
        await User.deleteMany({});
        await Topic.deleteMany({});

        // Disconnect from test database
        await mongoose.connection.close();
    });

    test('User 1 should create a game', async () => {
        const response = await request(app)
            .post('/api/games')
            .set('Authorization', `Bearer ${accessTokens[0]}`)
            .send({
                name: 'Test Game Room',
                maxPlayers: 3,
                isPrivate: false
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.game).toBeDefined();
        expect(response.body.game.name).toBe('Test Game Room');
        expect(response.body.game.creatorId).toBe(testUsers[0].id);

        gameId = response.body.game.id;
    });

    test('User 2 should join the game', async () => {
        const response = await request(app)
            .post(`/api/games/${gameId}/join`)
            .set('Authorization', `Bearer ${accessTokens[1]}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.gameState).toBeDefined();
        expect(response.body.gameState.players).toHaveLength(2);

        // Check that both users are in the player list
        const playerIds = response.body.gameState.players.map(p => p.id);
        expect(playerIds).toContain(testUsers[0].id);
        expect(playerIds).toContain(testUsers[1].id);
    });

    test('User 3 should join the game', async () => {
        const response = await request(app)
            .post(`/api/games/${gameId}/join`)
            .set('Authorization', `Bearer ${accessTokens[2]}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.gameState.players).toHaveLength(3);
    });

    test('All users should set ready status', async () => {
        for (let i = 0; i < 3; i++) {
            const response = await request(app)
                .post(`/api/games/${gameId}/ready`)
                .set('Authorization', `Bearer ${accessTokens[i]}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        }

        // Get game state to verify all players are ready
        const gameResponse = await request(app)
            .get(`/api/games/${gameId}`)
            .set('Authorization', `Bearer ${accessTokens[0]}`);

        expect(gameResponse.status).toBe(200);
        expect(gameResponse.body.game.players.every(p => p.isReady)).toBe(true);
    });

    test('Creator should start the game', async () => {
        const response = await request(app)
            .post(`/api/games/${gameId}/start`)
            .set('Authorization', `Bearer ${accessTokens[0]}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.gameState.status).toBe('playing');
        expect(response.body.gameState.currentRound).toBeDefined();
    });

    test('First explainer should start their turn', async () => {
        // Get game state to find current explainer
        const gameResponse = await request(app)
            .get(`/api/games/${gameId}`)
            .set('Authorization', `Bearer ${accessTokens[0]}`);

        const currentRound = gameResponse.body.game.currentRound;
        const explainerId = currentRound.explainerId;

        // Find which user is the explainer
        const explorerIndex = testUsers.findIndex(user => user.id === explainerId);

        // Start turn
        const response = await request(app)
            .post(`/api/games/${gameId}/rounds/current/start`)
            .set('Authorization', `Bearer ${accessTokens[explorerIndex]}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.round.status).toBe('explaining');
    });

    test('Other players should vote on the explanation', async () => {
        // Get game state to find current explainer
        const gameResponse = await request(app)
            .get(`/api/games/${gameId}`)
            .set('Authorization', `Bearer ${accessTokens[0]}`);

        const currentRound = gameResponse.body.game.currentRound;
        const explainerId = currentRound.explainerId;

        // Vote from non-explainer players
        for (let i = 0; i < testUsers.length; i++) {
            if (testUsers[i].id !== explainerId) {
                const response = await request(app)
                    .post(`/api/games/${gameId}/rounds/current/vote`)
                    .set('Authorization', `Bearer ${accessTokens[i]}`)
                    .send({ vote: true }); // Positive vote

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
            }
        }

        // Check if round is completed
        const updatedGameResponse = await request(app)
            .get(`/api/games/${gameId}`)
            .set('Authorization', `Bearer ${accessTokens[0]}`);

        expect(updatedGameResponse.body.game.currentRound.votes).toHaveLength(2); // Two votes from non-explainers
    });

    test('Explainer should end the turn', async () => {
        // Get game state to find current explainer
        const gameResponse = await request(app)
            .get(`/api/games/${gameId}`)
            .set('Authorization', `Bearer ${accessTokens[0]}`);

        const currentRound = gameResponse.body.game.currentRound;
        const explainerId = currentRound.explainerId;

        // Find which user is the explainer
        const explainerIndex = testUsers.findIndex(user => user.id === explainerId);

        // End turn
        const response = await request(app)
            .post(`/api/games/${gameId}/rounds/current/end`)
            .set('Authorization', `Bearer ${accessTokens[explainerIndex]}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.round.status).toBe('completed');

        // Check that scores were updated
        const updatedGameResponse = await request(app)
            .get(`/api/games/${gameId}`)
            .set('Authorization', `Bearer ${accessTokens[0]}`);

        // Verify at least one player has a score > 0
        const hasScores = updatedGameResponse.body.game.players.some(p => p.score > 0);
        expect(hasScores).toBe(true);
    });
}); 