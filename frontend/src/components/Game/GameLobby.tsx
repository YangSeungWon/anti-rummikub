import type { GameState, GameParticipant } from '../../types';
import { useAppDispatch } from '../../store/hooks';
import { startGameAction } from '../../store/gameSlice';
import { useParams } from 'react-router-dom';

interface GameLobbyProps {
    game: GameState;
    players: GameParticipant[];
    currentUserId: string;
    isReady: boolean;
    onReadyToggle: () => void;
    isConnected: boolean;
}

const GameLobby = ({
    game,
    players,
    currentUserId,
    isReady,
    onReadyToggle,
    isConnected,
}: GameLobbyProps) => {
    const { id: gameId } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const isCreator = game.creatorId === currentUserId;

    // 모든 플레이어의 준비 완료 여부 확인
    const allPlayersReady = players.length > 1 && players.every(player => player.isReady);

    // 게임 시작
    const handleStartGame = () => {
        if (gameId) {
            dispatch(startGameAction(gameId));
        }
    };

    return (
        <div className="game-lobby">
            <div className="connection-status">
                <span className={isConnected ? 'connected' : 'disconnected'}>
                    {isConnected ? '서버에 연결됨 ✓' : '연결 중...'}
                </span>
            </div>

            <div className="game-info">
                <div className="game-details">
                    <p>
                        <strong>최대 인원:</strong> {game.maxPlayers}명
                    </p>
                    <p>
                        <strong>현재 인원:</strong> {players.length}명
                    </p>
                    <p>
                        <strong>게임 상태:</strong> {game.status === 'waiting' ? '대기 중' : '게임 중'}
                    </p>
                </div>

                <div className="ready-action">
                    <button
                        className={`ready-button ${isReady ? 'ready' : ''}`}
                        onClick={onReadyToggle}
                        disabled={!isConnected}
                    >
                        {isReady ? '준비 완료 ✓' : '준비하기'}
                    </button>

                    {isCreator && allPlayersReady && (
                        <button
                            className="start-game-button"
                            onClick={handleStartGame}
                            disabled={!isConnected || !allPlayersReady}
                        >
                            게임 시작
                        </button>
                    )}
                </div>
            </div>

            <div className="players-list">
                <h2>참가자 목록</h2>
                <table>
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>준비 상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player) => (
                            <tr key={player.id} className={player.id === currentUserId ? 'current-player' : ''}>
                                <td>
                                    {player.username}
                                    {player.id === currentUserId && ' (나)'}
                                    {player.id === game.creatorId && ' (방장)'}
                                </td>
                                <td className={player.isReady ? 'ready' : 'not-ready'}>
                                    {player.isReady ? '준비 완료 ✓' : '준비 중...'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="lobby-info">
                <h2>게임 안내</h2>
                <ul>
                    <li>모든 플레이어가 준비 완료하면 게임이 시작됩니다.</li>
                    <li>각 라운드마다 한 명이 설명자로 선정됩니다.</li>
                    <li>설명자는 제시된 주제를 45초 동안 설명합니다.</li>
                    <li>다른 플레이어들은 설명을 듣고 투표합니다.</li>
                    <li>과반수 이상의 찬성을 받으면 설명이 인정됩니다.</li>
                    <li>모든 라운드가 끝나면 최종 점수를 집계합니다.</li>
                </ul>
            </div>
        </div>
    );
};

export default GameLobby; 