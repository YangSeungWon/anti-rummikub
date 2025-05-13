const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Round {
    // 라운드 시작
    static async start(roundId) {
        const query = `
      UPDATE rounds 
      SET status = 'explaining', start_time = NOW() 
      WHERE id = $1
      RETURNING *
    `;

        const result = await db.query(query, [roundId]);

        if (result.rows.length === 0) {
            throw new Error('라운드를 찾을 수 없습니다.');
        }

        return this.formatRoundData(result.rows[0]);
    }

    // 현재 라운드 조회
    static async getCurrentRound(gameId) {
        const query = `
      SELECT r.*, t.content as topic_content, t.category as topic_category, t.difficulty as topic_difficulty
      FROM rounds r
      LEFT JOIN topics t ON r.topic_id = t.id
      WHERE r.game_id = $1
      ORDER BY r.round_number DESC
      LIMIT 1
    `;

        const result = await db.query(query, [gameId]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.formatRoundData(result.rows[0]);
    }

    // 설명 기록
    static async recordExplanation(roundId, content) {
        const id = uuidv4();

        const query = `
      INSERT INTO explanations (id, round_id, content) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;

        const result = await db.query(query, [id, roundId, content]);
        return result.rows[0];
    }

    // 투표 처리
    static async vote(roundId, userId, isPositive) {
        // 현재 라운드와 설명 확인
        const roundQuery = `
      SELECT r.*, e.id as explanation_id
      FROM rounds r
      LEFT JOIN explanations e ON e.round_id = r.id
      WHERE r.id = $1
    `;

        const roundResult = await db.query(roundQuery, [roundId]);

        if (roundResult.rows.length === 0) {
            throw new Error('라운드를 찾을 수 없습니다.');
        }

        const round = roundResult.rows[0];

        if (!round.explanation_id) {
            throw new Error('이 라운드에 대한 설명이 없습니다.');
        }

        // 설명자는 투표할 수 없음
        if (userId === round.explainer_id) {
            throw new Error('설명자는 자신의 설명에 투표할 수 없습니다.');
        }

        // 이미 투표했는지 확인
        const existingVoteQuery = 'SELECT * FROM votes WHERE round_id = $1 AND user_id = $2';
        const existingVoteResult = await db.query(existingVoteQuery, [roundId, userId]);

        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            if (existingVoteResult.rows.length > 0) {
                // 기존 투표 업데이트
                await client.query(
                    'UPDATE votes SET is_positive = $1 WHERE round_id = $2 AND user_id = $3',
                    [isPositive, roundId, userId]
                );
            } else {
                // 새 투표 추가
                await client.query(
                    'INSERT INTO votes (round_id, user_id, explanation_id, is_positive) VALUES ($1, $2, $3, $4)',
                    [roundId, userId, round.explanation_id, isPositive]
                );
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        // 투표 집계 결과 반환
        return this.getVotesForRound(roundId);
    }

    // 라운드에 대한 투표 조회
    static async getVotesForRound(roundId) {
        const query = `
      SELECT 
        COUNT(*) FILTER (WHERE is_positive = true) as positive,
        COUNT(*) FILTER (WHERE is_positive = false) as negative
      FROM votes
      WHERE round_id = $1
    `;

        const result = await db.query(query, [roundId]);

        return {
            positive: parseInt(result.rows[0].positive) || 0,
            negative: parseInt(result.rows[0].negative) || 0
        };
    }

    // 라운드 종료 및 점수 계산
    static async end(roundId) {
        // 라운드 정보 조회
        const roundQuery = `
      SELECT r.*, g.id as game_id
      FROM rounds r
      JOIN games g ON r.game_id = g.id
      WHERE r.id = $1
    `;

        const roundResult = await db.query(roundQuery, [roundId]);

        if (roundResult.rows.length === 0) {
            throw new Error('라운드를 찾을 수 없습니다.');
        }

        const round = roundResult.rows[0];

        // 투표 결과 조회
        const votes = await this.getVotesForRound(roundId);

        // 총 투표 수
        const totalVotes = votes.positive + votes.negative;

        // 설명 성공 여부 (과반수 찬성)
        const isExplanationAccepted = totalVotes > 0 && (votes.positive / totalVotes) > 0.5;

        // 트랜잭션 시작
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            // 라운드 종료 처리
            await client.query(
                'UPDATE rounds SET status = $1, end_time = NOW() WHERE id = $2',
                ['finished', roundId]
            );

            // 설명 인정 여부 업데이트
            if (round.explanation_id) {
                await client.query(
                    'UPDATE explanations SET is_accepted = $1 WHERE round_id = $2',
                    [isExplanationAccepted, roundId]
                );
            }

            // 점수 계산 및 업데이트
            if (isExplanationAccepted) {
                // 설명자 점수 증가 (기본 10점)
                const baseScore = 10;

                // 보너스 라운드인 경우 2배
                const scoreMultiplier = round.is_bonus ? 2 : 1;

                // 최종 점수
                const finalScore = baseScore * scoreMultiplier;

                // 설명자 점수 업데이트
                await client.query(
                    'UPDATE game_participants SET score = score + $1 WHERE game_id = $2 AND user_id = $3',
                    [finalScore, round.game_id, round.explainer_id]
                );
            }

            // 다음 라운드 설정 (필요한 경우)
            const participantsQuery = 'SELECT user_id FROM game_participants WHERE game_id = $1';
            const participantsResult = await client.query(participantsQuery, [round.game_id]);

            const participants = participantsResult.rows.map(p => p.user_id);

            // 다음 설명자 결정 (현재 설명자의 다음 참가자)
            const currentExplainerIndex = participants.indexOf(round.explainer_id);
            const nextExplainerIndex = (currentExplainerIndex + 1) % participants.length;
            const nextExplainerId = participants[nextExplainerIndex];

            // 다음 라운드가 10라운드를 초과하면 게임 종료
            if (round.round_number >= 10) {
                await client.query(
                    'UPDATE games SET status = $1 WHERE id = $2',
                    ['finished', round.game_id]
                );
            } else {
                // 다음 라운드 생성
                const nextRoundNumber = round.round_number + 1;

                // 5의 배수 라운드는 보너스 라운드
                const isBonus = nextRoundNumber % 5 === 0;

                // 랜덤 주제 선택
                const topicQuery = 'SELECT * FROM topics ORDER BY RANDOM() LIMIT 1';
                const topicResult = await client.query(topicQuery);

                if (topicResult.rows.length > 0) {
                    const topic = topicResult.rows[0];

                    // 새 라운드 생성
                    await client.query(`
            INSERT INTO rounds (
              game_id, round_number, explainer_id, topic_id, status, is_bonus
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `, [round.game_id, nextRoundNumber, nextExplainerId, topic.id, 'waiting', isBonus]);
                }
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        // 점수 업데이트 및 다음 라운드 정보 반환
        const scoreUpdatesQuery = 'SELECT user_id, score FROM game_participants WHERE game_id = $1';
        const scoreUpdatesResult = await db.query(scoreUpdatesQuery, [round.game_id]);

        const scoreUpdates = scoreUpdatesResult.rows.map(row => ({
            playerId: row.user_id,
            score: row.score
        }));

        // 다음 라운드 정보
        const nextRound = await this.getCurrentRound(round.game_id);

        return {
            roundId,
            isExplanationAccepted,
            scoreUpdates,
            nextRound: nextRound ? {
                roundNumber: nextRound.roundNumber,
                explainerId: nextRound.explainerId,
                isBonus: nextRound.isBonus
            } : null
        };
    }

    // 라운드 데이터 포맷팅
    static formatRoundData(roundData) {
        const formattedRound = {
            id: roundData.id,
            gameId: roundData.game_id,
            roundNumber: roundData.round_number,
            explainerId: roundData.explainer_id,
            status: roundData.status,
            isBonus: roundData.is_bonus,
            startTime: roundData.start_time,
            endTime: roundData.end_time
        };

        // 주제 정보가 있는 경우 추가
        if (roundData.topic_id) {
            formattedRound.topic = {
                id: roundData.topic_id,
                content: roundData.topic_content,
                category: roundData.topic_category,
                difficulty: roundData.topic_difficulty
            };
        }

        return formattedRound;
    }
}

module.exports = Round; 