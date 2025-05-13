import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGame, joinGameAction } from '../../store/gameSlice';
import { useGameSocket } from '../../socket/useGameSocket';
import GameLobby from './GameLobby';
import GameBoard from './GameBoard';
import ChatPanel from './ChatPanel';
import './Game.css';

const Game = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    // 게임 상태 selector
    const gameState = useAppSelector(state => state.game);
    const { players, status, isLoading, error } = gameState;

    // 게임 소켓 연결
    const { connected, ready, vote, sendChat } = useGameSocket({
        gameId: id || '',
        autoJoin: true
    });

    // 플레이어 준비 상태 확인
    const isPlayerReady = players.find(p => p.id === user?.id)?.isReady || false;

    useEffect(() => {
        if (!id || !user) return;

        // 게임 정보 불러오기
        dispatch(fetchGame(id));

        // 게임 참가
        if (connected) {
            dispatch(joinGameAction(id));
        }
    }, [id, user, dispatch, connected]);

    const handleReadyToggle = () => {
        ready();
    };

    const handleLeaveGame = () => {
        // 게임 나가기 처리
        navigate('/lobby');
    };

    if (isLoading) {
        return <div className="game-loading">게임 정보를 불러오는 중...</div>;
    }

    if (error || !id) {
        return (
            <div className="game-error">
                <p>{error || '게임을 찾을 수 없습니다.'}</p>
                <button onClick={() => navigate('/lobby')}>로비로 돌아가기</button>
            </div>
        );
    }

    return (
        <div className="game-container">
            <div className="game-header">
                <h1>{gameState.name}</h1>
                <div className="user-info">
                    <span>{user?.username}</span>
                </div>
                <button className="leave-button" onClick={handleLeaveGame}>
                    나가기
                </button>
            </div>

            {status === 'playing' ? (
                <div className="game-playing">
                    <GameBoard
                        gameState={gameState}
                        currentUserId={user?.id || ''}
                        onVote={vote}
                    />
                    <ChatPanel
                        gameId={id}
                        userId={user?.id || ''}
                        username={user?.username || ''}
                        onSendChat={sendChat}
                        messages={gameState.chatMessages}
                    />
                </div>
            ) : (
                <GameLobby
                    game={gameState}
                    players={players}
                    currentUserId={user?.id || ''}
                    isReady={isPlayerReady}
                    onReadyToggle={handleReadyToggle}
                    isConnected={connected}
                />
            )}
        </div>
    );
};

export default Game; 