-- users 테이블
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    is_bot BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- games 테이블
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    max_players INTEGER NOT NULL,
    current_players INTEGER NOT NULL DEFAULT 0,
    creator_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'waiting',
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- game_participants 테이블
CREATE TABLE IF NOT EXISTS game_participants (
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_ready BOOLEAN DEFAULT false,
    score INTEGER DEFAULT 0,
    socket_id VARCHAR(255),
    PRIMARY KEY (game_id, user_id)
);

-- (필요시 다른 테이블도 여기에 추가) 