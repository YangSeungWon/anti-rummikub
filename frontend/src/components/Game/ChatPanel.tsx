import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../../types';

interface ChatPanelProps {
    gameId: string;
    userId: string;
    username: string;
    messages: ChatMessage[];
    onSendChat: (message: string) => void;
}

const ChatPanel = ({ gameId, userId, username, messages, onSendChat }: ChatPanelProps) => {
    const [inputValue, setInputValue] = useState<string>('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // 채팅 스크롤을 항상 아래로 유지
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // 채팅 전송 처리
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputValue.trim()) {
            return;
        }

        // 소켓으로 채팅 메시지 전송
        onSendChat(inputValue.trim());

        // 입력 필드 초기화
        setInputValue('');
    };

    return (
        <div className="chat-panel">
            <div className="chat-header">
                <h2>채팅</h2>
            </div>

            <div className="chat-container" ref={chatContainerRef}>
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>아직 메시지가 없습니다.</p>
                        <p>채팅을 시작해보세요!</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={index}
                            className={`chat-message ${message.userId === userId ? 'my-message' : 'other-message'}`}
                        >
                            <div className="message-sender">
                                {message.userId === userId ? '나' : message.username}
                            </div>
                            <div className="message-content">{message.message}</div>
                            <div className="message-time">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    maxLength={200}
                />
                <button type="submit">전송</button>
            </form>
        </div>
    );
};

export default ChatPanel; 