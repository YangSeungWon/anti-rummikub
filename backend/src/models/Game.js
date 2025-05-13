const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Game {
    // 게임 생성
    static async create(gameData) {
        const { name, maxPlayers = 8, creatorId } = gameData;
        const id = uuidv4();

        const query = `
      INSERT INTO games (id, name, max_players, current_players, creator_id, status) 
      VALUES ($1, $2, $3, 1, $4, 'waiting') 
      RETURNING *
    `;

        const result = await db.query(query, [id, name, maxPlayers, creatorId]);

        // 방장을 참가자로 자동 추가
        await db.query(
            'INSERT INTO game_participants (game_id, user_id, is_ready, score) VALUES ($1, $2, false, 0)',
            [id, creatorId]
        );

        return this.formatGameData(result.rows[0]);
    }

    // ID로 게임 조회
    static async findById(id) {
        const query = 'SELECT * FROM games WHERE id = $1';
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.formatGameData(result.rows[0]);
    }

    // 게임 목록 조회
    static async findAll(includePrivate = false) {
        const query = includePrivate
            ? 'SELECT * FROM games ORDER BY created_at DESC'
            : 'SELECT * FROM games WHERE is_private = false ORDER BY created_at DESC';

        const result = await db.query(query);
        return result.rows.map(game => this.formatGameData(game));
    }

    // 게임 참가
    static async join(gameId, userId) {
        // 게임 존재 및 참가 가능 상태 확인
        const gameQuery = 'SELECT * FROM games WHERE id = $1';
        const gameResult = await db.query(gameQuery, [gameId]);

        if (gameResult.rows.length === 0) {
            throw new Error('게임을 찾을 수 없습니다.');
        }

        const game = gameResult.rows[0];

        if (game.status !== 'waiting') {
            throw new Error('이미 시작된 게임에는 참가할 수 없습니다.');
        }

        if (game.current_players >= game.max_players) {
            throw new Error('게임 방이 가득 찼습니다.');
        }

        // 이미 참가한 유저인지 확인
        const participantQuery = 'SELECT * FROM game_participants WHERE game_id = $1 AND user_id = $2';
        const participantResult = await db.query(participantQuery, [gameId, userId]);

        if (participantResult.rows.length > 0) {
            throw new Error('이미 게임에 참가하고 있습니다.');
        }

        // 트랜잭션 시작
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            // 참가자 추가
            await client.query(
                'INSERT INTO game_participants (game_id, user_id, is_ready, score) VALUES ($1, $2, false, 0)',
                [gameId, userId]
            );

            // 현재 참가자 수 증가
            await client.query(
                'UPDATE games SET current_players = current_players + 1 WHERE id = $1',
                [gameId]
            );

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        return this.getGameState(gameId);
    }

    // 게임 상태 조회
    static async getGameState(gameId) {
        // 게임 정보 조회
        const gameQuery = 'SELECT * FROM games WHERE id = $1';
        const gameResult = await db.query(gameQuery, [gameId]);

        if (gameResult.rows.length === 0) {
            throw new Error('게임을 찾을 수 없습니다.');
        }

        const game = this.formatGameData(gameResult.rows[0]);

        // 참가자 정보 조회
        const participantsQuery = `
      SELECT gp.*, u.username 
      FROM game_participants gp
      JOIN users u ON gp.user_id = u.id
      WHERE gp.game_id = $1
    `;
        const participantsResult = await db.query(participantsQuery, [gameId]);

        const players = participantsResult.rows.map(row => ({
            id: row.user_id,
            username: row.username,
            isReady: row.is_ready,
            score: row.score,
            socketId: row.socket_id || null
        }));

        // 현재 라운드 정보 조회 (게임 중인 경우)
        let currentRound = null;
        if (game.status === 'playing') {
            const roundQuery = `
        SELECT r.*, t.content as topic_content, t.category as topic_category, t.difficulty as topic_difficulty
        FROM rounds r
        LEFT JOIN topics t ON r.topic_id = t.id
        WHERE r.game_id = $1
        ORDER BY r.round_number DESC
        LIMIT 1
      `;
            const roundResult = await db.query(roundQuery, [gameId]);

            if (roundResult.rows.length > 0) {
                const round = roundResult.rows[0];
                currentRound = {
                    roundNumber: round.round_number,
                    explainerId: round.explainer_id,
                    startTime: round.start_time,
                    endTime: round.end_time,
                    status: round.status,
                    isBonus: round.is_bonus,
                    topic: round.topic_id ? {
                        id: round.topic_id,
                        content: round.topic_content,
                        category: round.topic_category,
                        difficulty: round.topic_difficulty
                    } : null
                };
            }
        }

        return {
            ...game,
            players,
            currentRound
        };
    }

    // 준비 상태 토글
    static async toggleReady(gameId, userId) {
        const query = `
      UPDATE game_participants 
      SET is_ready = NOT is_ready 
      WHERE game_id = $1 AND user_id = $2
      RETURNING is_ready
    `;

        const result = await db.query(query, [gameId, userId]);

        if (result.rows.length === 0) {
            throw new Error('게임 참가자를 찾을 수 없습니다.');
        }

        return result.rows[0].is_ready;
    }

    // 게임 시작
    static async start(gameId) {
        // 게임 존재 및 상태 확인
        const gameQuery = 'SELECT * FROM games WHERE id = $1';
        const gameResult = await db.query(gameQuery, [gameId]);

        if (gameResult.rows.length === 0) {
            throw new Error('게임을 찾을 수 없습니다.');
        }

        const game = gameResult.rows[0];

        if (game.status !== 'waiting') {
            throw new Error('이미 시작된 게임입니다.');
        }

        // 참가자 확인 및 준비 상태 확인
        const participantsQuery = 'SELECT * FROM game_participants WHERE game_id = $1';
        const participantsResult = await db.query(participantsQuery, [gameId]);

        if (participantsResult.rows.length < 2) {
            throw new Error('게임을 시작하려면 최소 2명의 참가자가 필요합니다.');
        }

        // 모든 참가자가 준비 상태인지 확인
        const notReadyCount = participantsResult.rows.filter(p => !p.is_ready).length;
        if (notReadyCount > 0) {
            throw new Error('모든 참가자가 준비 상태여야 게임을 시작할 수 있습니다.');
        }

        // 트랜잭션 시작
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            // 게임 상태 업데이트
            await client.query(
                'UPDATE games SET status = $1 WHERE id = $2',
                ['playing', gameId]
            );

            // 첫 번째 라운드 생성
            const firstExplainerId = participantsResult.rows[0].user_id;

            // 랜덤 주제 선택
            const topicQuery = 'SELECT * FROM topics ORDER BY RANDOM() LIMIT 1';
            const topicResult = await client.query(topicQuery);

            if (topicResult.rows.length === 0) {
                throw new Error('주제를 찾을 수 없습니다.');
            }

            const topic = topicResult.rows[0];

            // 첫 라운드 생성
            await client.query(`
        INSERT INTO rounds (
          game_id, round_number, explainer_id, topic_id, status, is_bonus
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [gameId, 1, firstExplainerId, topic.id, 'waiting', false]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        return this.getGameState(gameId);
    }

    // 게임 데이터 포맷팅
    static formatGameData(gameData) {
        return {
            id: gameData.id,
            name: gameData.name,
            maxPlayers: gameData.max_players,
            currentPlayers: gameData.current_players,
            isPrivate: gameData.is_private,
            status: gameData.status,
            createdAt: gameData.created_at,
            creatorId: gameData.creator_id
        };
    }
}

module.exports = Game; 