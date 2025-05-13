import { useState } from 'react';

interface CreateGameFormProps {
    onSubmit: (data: { name: string; maxPlayers: number; isPrivate: boolean }) => void;
    onCancel: () => void;
}

const CreateGameForm = ({ onSubmit, onCancel }: CreateGameFormProps) => {
    const [name, setName] = useState<string>('');
    const [maxPlayers, setMaxPlayers] = useState<number>(8);
    const [isPrivate, setIsPrivate] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('게임 이름을 입력해주세요.');
            return;
        }

        onSubmit({
            name: name.trim(),
            maxPlayers,
            isPrivate
        });
    };

    return (
        <div className="create-game-form">
            <h2>새 게임 만들기</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="game-name">방 이름</label>
                    <input
                        id="game-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="방 이름을 입력하세요"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="max-players">최대 인원</label>
                    <select
                        id="max-players"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    >
                        {[4, 5, 6, 7, 8].map((num) => (
                            <option key={num} value={num}>
                                {num}명
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                        />
                        비공개 방
                    </label>
                </div>

                <div className="form-actions">
                    <button type="submit">방 만들기</button>
                    <button type="button" onClick={onCancel}>취소</button>
                </div>
            </form>
        </div>
    );
};

export default CreateGameForm; 