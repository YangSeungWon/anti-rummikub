import type { Game } from '../../types';

interface GameListProps {
    games: Game[];
    loading: boolean;
    onJoinGame: (gameId: string) => void;
}

const GameList = ({ games, loading, onJoinGame }: GameListProps) => {
    if (loading) {
        return <div className="game-list-loading">게임 목록을 불러오는 중...</div>;
    }

    if (games.length === 0) {
        return (
            <div className="game-list-empty">
                <p>현재 진행 중인 게임이 없습니다.</p>
                <p>새 게임을 만들어 시작해보세요!</p>
            </div>
        );
    }

    return (
        <div className="game-list">
            <h2>공개 방 목록</h2>
            <table>
                <thead>
                    <tr>
                        <th>방 이름</th>
                        <th>인원</th>
                        <th>상태</th>
                        <th>입장</th>
                    </tr>
                </thead>
                <tbody>
                    {games.map((game) => (
                        <tr key={game.id}>
                            <td>{game.name}</td>
                            <td>{game.currentPlayers} / {game.maxPlayers}</td>
                            <td>
                                {game.status === 'waiting' && '대기 중'}
                                {game.status === 'playing' && '게임 중'}
                                {game.status === 'finished' && '종료됨'}
                            </td>
                            <td>
                                {game.status === 'waiting' && game.currentPlayers < game.maxPlayers ? (
                                    <button onClick={() => onJoinGame(game.id)}>
                                        참가
                                    </button>
                                ) : (
                                    <button disabled>
                                        {game.status === 'waiting' ? '꽉 참' : '진행 중'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GameList; 