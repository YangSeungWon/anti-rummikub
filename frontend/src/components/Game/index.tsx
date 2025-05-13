import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameApi } from '../../api';
import { Game as GameType, GameParticipant, GameState } from '../../types';
import { initializeSocket, joinGame, toggleReady } from '../../socket';
import GameLobby from './GameLobby';
import GameBoard from './GameBoard';
import ChatPanel from './ChatPanel';
import './Game.css';

// 임시 사용자 정보
const tempUser = {
    id: `user-${Date.now()}`,
    username: `Player${Math.floor(Math.random() * 1000)}`,
};

const Game = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [game, setGame] = useState<GameType | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [players, setPlayers] = useState<GameParticipant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;

        // 게임 정보 불러오기
        const fetchGameData = async () => {
            try {
                setLoading(true);
                const response = await gameApi.getGame(id);

                if (response.data.success) {
                    setGame(response.data.game);
                } else {
                    setError('게임 정보를 불러오는 데 실패했습니다.');
                }
            } catch (err) {
                console.error('게임 정보를 불러오는 중 오류가 발생했습니다.', err);
                setError('게임 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchGameData();

        // 소켓 연결 초기화
        const socket = initializeSocket();

        // 게임 입장
        joinGame(id, tempUser.id, tempUser.username);

        // 이벤트 리스너 등록
        const playerJoinedHandler = (data: any) => {
            console.log('플레이어 참가:', data);
            setPlayers(data.players);
        };

        const playerReadyChangedHandler = (data: any) => {
            console.log('준비 상태 변경:', data);
            setPlayers(data.players);

            // 자신의 준비 상태 확인
            if (data.playerId === tempUser.id) {
                setIsPlayerReady(data.isReady);
            }
        };

        const gameStartedHandler = (data: any) => {
            console.log('게임 시작:', data);
            setGameState({
                id,
                status: 'playing',
                players,
                currentRound: {
                    roundNumber: data.currentRound,
                    explainerId: data.explainer.id,
                    status: 'explaining',
                    isBonus: false,
                },
                topic: data.topic,
                chatMessages: [],
            });
        };

        // 이벤트 리스너 추가
        socket.on('playerJoined', playerJoinedHandler);
        socket.on('playerReadyChanged', playerReadyChangedHandler);
        socket.on('gameStarted', gameStartedHandler);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            socket.off('playerJoined', playerJoinedHandler);
            socket.off('playerReadyChanged', playerReadyChangedHandler);
            socket.off('gameStarted', gameStartedHandler);
        };
    }, [id]);

    const handleReadyToggle = () => {
        if (!id) return;
        toggleReady(id, tempUser.id);
    };

    const handleLeaveGame = () => {
        // 게임 나가기 처리
        navigate('/');
    };

    if (loading) {
        return <div className="game-loading">게임 정보를 불러오는 중...</div>;
    }

    if (error || !game) {
        return (
            <div className="game-error">
                <p>{error || '게임을 찾을 수 없습니다.'}</p>
                <button onClick={() => navigate('/')}>로비로 돌아가기</button>
            </div>
        );
    }

    return (
        <div className="game-container">
            <div className="game-header">
                <h1>{game.name}</h1>
                <button className="leave-button" onClick={handleLeaveGame}>
                    나가기
                </button>
            </div>

            {gameState?.status === 'playing' ? (
                <div className="game-playing">
                    <GameBoard
                        gameState={gameState}
                        currentUserId={tempUser.id}
                    />
                    <ChatPanel
                        gameId={id}
                        userId={tempUser.id}
                        username={tempUser.username}
                    />
                </div>
            ) : (
                <GameLobby
                    game={game}
                    players={players}
                    currentUserId={tempUser.id}
                    isReady={isPlayerReady}
                    onReadyToggle={handleReadyToggle}
                />
            )}
        </div>
    );
};

export default Game; 