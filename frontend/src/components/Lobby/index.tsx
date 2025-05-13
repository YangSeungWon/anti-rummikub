import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameApi } from '../../api';
import { Game } from '../../types';
import GameList from './GameList';
import CreateGameForm from './CreateGameForm';
import './Lobby.css';

const Lobby = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        // 게임 목록 불러오기
        fetchGames();

        // 주기적으로 게임 목록 갱신
        const interval = setInterval(fetchGames, 10000);

        return () => clearInterval(interval);
    }, []);

    const fetchGames = async () => {
        try {
            setLoading(true);
            const response = await gameApi.getGames();
            if (response.data.success) {
                setGames(response.data.games);
            }
            setError(null);
        } catch (err) {
            console.error('게임 목록을 불러오는 중 오류가 발생했습니다.', err);
            setError('게임 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGame = async (data: { name: string; maxPlayers: number; isPrivate: boolean }) => {
        try {
            setLoading(true);
            const response = await gameApi.createGame(data);
            if (response.data.success) {
                // 생성된 게임으로 이동
                navigate(`/game/${response.data.game.id}`);
            }
        } catch (err) {
            console.error('게임 생성 중 오류가 발생했습니다.', err);
            setError('게임 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
            setShowCreateForm(false);
        }
    };

    const handleJoinGame = async (gameId: string) => {
        try {
            setLoading(true);
            const response = await gameApi.joinGame(gameId);
            if (response.data.success) {
                // 참가한 게임으로 이동
                navigate(`/game/${gameId}`);
            }
        } catch (err) {
            console.error('게임 참가 중 오류가 발생했습니다.', err);
            setError('게임 참가 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lobby-container">
            <h1>Anti-Rummikub: Improv Showdown</h1>

            <div className="lobby-actions">
                <button onClick={() => setShowCreateForm(true)}>방 만들기</button>
                <button onClick={fetchGames}>새로고침</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showCreateForm && (
                <CreateGameForm
                    onSubmit={handleCreateGame}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            <GameList
                games={games}
                loading={loading}
                onJoinGame={handleJoinGame}
            />
        </div>
    );
};

export default Lobby; 