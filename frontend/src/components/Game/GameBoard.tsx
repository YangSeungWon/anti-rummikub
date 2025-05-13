import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { startTurnAction, voteAction, endTurnAction } from '../../store/gameSlice';
import { GameState } from '../../types';
import Timer from './Timer';
import VoteBar from './VoteBar';

interface GameBoardProps {
    gameState: GameState;
    currentUserId: string;
    onVote: (roundId: string, isPositive: boolean) => void;
}

const GameBoard = ({ gameState, currentUserId, onVote }: GameBoardProps) => {
    const { id: gameId } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const [timeLeft, setTimeLeft] = useState<number>(45); // 45초
    const [gracePeriod, setGracePeriod] = useState<number>(5); // 5초 준비 시간
    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const [showVoteButtons, setShowVoteButtons] = useState<boolean>(false);

    const { currentRound, players, votes, topic } = gameState;
    const isExplainer = currentRound?.explainerId === currentUserId;
    const roundId = currentRound?.id || '';

    // 턴 시작
    const handleStartTurn = () => {
        if (!gameId) return;
        dispatch(startTurnAction(gameId));
    };

    // 타이머 로직
    useEffect(() => {
        if (!currentRound) return;

        if (currentRound.status === 'waiting' && isExplainer) {
            // 설명자가 준비 상태인 경우 타이머 없음
            return;
        }

        if (currentRound.status === 'explaining') {
            // 그레이스 기간 카운트다운
            if (gracePeriod > 0) {
                const graceTimer = setInterval(() => {
                    setGracePeriod(prev => {
                        if (prev <= 1) {
                            clearInterval(graceTimer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(graceTimer);
            }

            // 실제 설명 타이머
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setShowVoteButtons(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [currentRound, gracePeriod, isExplainer]);

    // 턴 리셋 (다음 라운드용)
    useEffect(() => {
        if (currentRound?.status === 'waiting') {
            setTimeLeft(45);
            setGracePeriod(5);
            setHasVoted(false);
            setShowVoteButtons(false);
        }
    }, [currentRound?.status]);

    // 투표 처리
    const handleVote = (isPositive: boolean) => {
        if (!gameId || !roundId) return;

        // 소켓으로 투표 전송
        onVote(roundId, isPositive);

        // API로 투표 처리
        dispatch(voteAction({
            gameId,
            roundId,
            vote: isPositive ? 'yes' : 'no'
        }));

        setHasVoted(true);
    };

    // 턴 종료 (모든 투표가 완료되면 자동 호출)
    const handleEndTurn = () => {
        if (!gameId || !roundId) return;
        dispatch(endTurnAction({ gameId, roundId }));
    };

    // 투표 완료 확인
    useEffect(() => {
        if (!votes || !players.length) return;

        const totalVoters = players.length - 1; // 설명자 제외
        const totalVotes = votes.positive + votes.negative;

        // 모든 투표가 완료되면 턴 종료
        if (totalVotes >= totalVoters) {
            // 잠시 후 턴 종료 (결과 보여주기 위해)
            const endTurnTimeout = setTimeout(() => {
                handleEndTurn();
            }, 3000);

            return () => clearTimeout(endTurnTimeout);
        }
    }, [votes, players, gameId, roundId]);

    return (
        <div className="game-board">
            <div className="round-info">
                <div className="round-number">
                    라운드: {currentRound?.roundNumber || 1}/10
                    {currentRound?.isBonus && <span className="bonus-badge">보너스!</span>}
                </div>
                {currentRound?.status === 'explaining' && (
                    <Timer timeLeft={gracePeriod > 0 ? gracePeriod : timeLeft} isGracePeriod={gracePeriod > 0} />
                )}
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
                {topic && (
                    <div className="topic-meta">
                        <span className="category">{topic.category}</span>
                        <span className="difficulty">
                            난이도: {Array(topic.difficulty || 0).fill('★').join('')}
                        </span>
                    </div>
                )}
            </div>

            {isExplainer ? (
                <div className="explainer-area">
                    <h2>당신은 설명자입니다!</h2>

                    {currentRound?.status === 'waiting' && (
                        <button
                            className="start-turn-button"
                            onClick={handleStartTurn}
                        >
                            설명 시작하기
                        </button>
                    )}

                    {currentRound?.status === 'explaining' && (
                        <>
                            {gracePeriod > 0 ? (
                                <div className="grace-period">
                                    <p>준비 시간: {gracePeriod}초</p>
                                    <p>잠시 후 설명을 시작하세요.</p>
                                </div>
                            ) : (
                                <div>
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
                            )}
                        </>
                    )}
                </div>
            ) : (
                <div className="voter-area">
                    <h2>설명을 듣고 투표하세요</h2>

                    {showVoteButtons && !hasVoted && (
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

                    {!showVoteButtons && !hasVoted && (
                        <p>설명이 끝나면 투표 버튼이 활성화됩니다.</p>
                    )}

                    <VoteBar
                        positive={votes?.positive || 0}
                        negative={votes?.negative || 0}
                        total={players.length - 1} // 설명자 제외
                    />
                </div>
            )}

            <div className="player-list">
                <h3>참가자 ({players.length}명)</h3>
                <ul>
                    {players.map((player) => (
                        <li key={player.id} className={player.id === currentUserId ? 'current-player' : ''}>
                            {player.username}
                            {player.id === currentRound?.explainerId && ' (설명자)'}
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