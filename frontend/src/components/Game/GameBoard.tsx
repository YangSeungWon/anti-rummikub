import { useState, useEffect } from 'react';
import { GameState } from '../../types';
import Timer from './Timer';
import VoteBar from './VoteBar';

interface GameBoardProps {
    gameState: GameState;
    currentUserId: string;
}

const GameBoard = ({ gameState, currentUserId }: GameBoardProps) => {
    const [timeLeft, setTimeLeft] = useState<number>(45); // 45초
    const [hasVoted, setHasVoted] = useState<boolean>(false);

    const isExplainer = gameState.currentRound?.explainerId === currentUserId;

    // 타이머 로직
    useEffect(() => {
        if (!gameState.currentRound || gameState.currentRound.status !== 'explaining') {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState.currentRound]);

    // 주제 정보
    const topic = gameState.topic;

    // 투표 처리
    const handleVote = (isPositive: boolean) => {
        // 소켓으로 투표 전송 (실제 구현 필요)
        // sendVote(gameState.id, currentUserId, explanationId, isPositive);
        setHasVoted(true);
    };

    return (
        <div className="game-board">
            <div className="round-info">
                <div className="round-number">
                    라운드: {gameState.currentRound?.roundNumber || 1}/10
                </div>
                <Timer timeLeft={timeLeft} />
            </div>

            <div className="topic-card">
                <h2>주제</h2>
                <div className="topic-content">
                    {isExplainer ? (
                        <p>{topic?.content || '주제를 불러오는 중...'}</p>
                    ) : (
                        <p>현재 라운드에서는 당신이 설명자가 아닙니다.</p>
                    )}
                </div>
                <div className="topic-meta">
                    <span className="category">{topic?.category}</span>
                    <span className="difficulty">
                        난이도: {Array(topic?.difficulty || 0).fill('★').join('')}
                    </span>
                </div>
            </div>

            {isExplainer ? (
                <div className="explainer-area">
                    <h2>당신은 설명자입니다!</h2>
                    <p>위 주제를 45초 안에 창의적으로 설명해보세요.</p>
                    <div className="explanation-tips">
                        <h3>팁</h3>
                        <ul>
                            <li>주제를 재미있고 창의적으로 묘사하세요.</li>
                            <li>직접적인 단어는 사용하지 마세요.</li>
                            <li>다른 플레이어들이 쉽게 이해할 수 있도록 설명하세요.</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="voter-area">
                    <h2>설명을 듣고 투표하세요</h2>

                    {timeLeft === 0 && !hasVoted && (
                        <div className="vote-buttons">
                            <button
                                className="vote-button positive"
                                onClick={() => handleVote(true)}
                            >
                                👍 찬성
                            </button>
                            <button
                                className="vote-button negative"
                                onClick={() => handleVote(false)}
                            >
                                👎 반대
                            </button>
                        </div>
                    )}

                    {hasVoted && (
                        <div className="vote-complete">
                            <p>투표가 완료되었습니다!</p>
                            <p>다른 플레이어들의 투표를 기다리는 중...</p>
                        </div>
                    )}

                    {timeLeft > 0 && (
                        <p>설명이 끝나면 투표 버튼이 활성화됩니다.</p>
                    )}

                    <VoteBar
                        positive={gameState.votes?.positive || 0}
                        negative={gameState.votes?.negative || 0}
                        total={gameState.players.length - 1} // 설명자 제외
                    />
                </div>
            )}

            <div className="player-list">
                <h3>참가자 ({gameState.players.length}명)</h3>
                <ul>
                    {gameState.players.map((player) => (
                        <li key={player.id} className={player.id === currentUserId ? 'current-player' : ''}>
                            {player.username}
                            {player.id === gameState.currentRound?.explainerId && ' (설명자)'}
                            {player.id === currentUserId && ' (나)'}
                            <span className="player-score">점수: {player.score}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default GameBoard; 