import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useSocket } from '../socket/useSocket';
import { AuthContext } from '../context/AuthContext';
import * as socketModule from '../socket';

// Mock socket module
jest.mock('../socket', () => ({
    initializeSocket: jest.fn(),
    isSocketConnected: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    joinGame: jest.fn(),
    toggleReady: jest.fn(),
    sendVote: jest.fn(),
    sendChatMessage: jest.fn(),
}));

// Mock the AuthContext
const mockUser = { id: 'user123', username: 'testuser' };
const mockAuthContext = {
    user: mockUser,
    token: 'test-token',
    loading: false,
    error: null,
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: true,
};

// Wrapper for the hook with AuthContext
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={mockAuthContext}>
        {children}
    </AuthContext.Provider>
);

describe('useSocket Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Set default return values for mocked functions
        (socketModule.isSocketConnected as jest.Mock).mockReturnValue(true);
    });

    test('should initialize socket and check connection', () => {
        // Render the hook
        const { result } = renderHook(() => useSocket(), { wrapper });

        // Check if socket is initialized
        expect(socketModule.initializeSocket).toHaveBeenCalled();

        // Connection status should be true based on our mock
        expect(result.current.connected).toBe(true);
    });

    test('should auto join game when autoJoin is true', () => {
        const gameId = 'game123';

        // Render the hook with autoJoin=true
        renderHook(() => useSocket({ gameId, autoJoin: true }), { wrapper });

        // Check if joinGame is called with correct parameters
        expect(socketModule.joinGame).toHaveBeenCalledWith(
            gameId,
            mockUser.id,
            mockUser.username
        );
    });

    test('should not auto join game when autoJoin is false', () => {
        const gameId = 'game123';

        // Render the hook with autoJoin=false
        renderHook(() => useSocket({ gameId, autoJoin: false }), { wrapper });

        // Check that joinGame is not called
        expect(socketModule.joinGame).not.toHaveBeenCalled();
    });

    test('should handle event listeners correctly', () => {
        // Mock handler function
        const mockHandler = jest.fn();

        // Render the hook
        const { result } = renderHook(() => useSocket(), { wrapper });

        // Add an event listener
        act(() => {
            result.current.on('testEvent', mockHandler);
        });

        // Check if addEventListener is called with correct parameters
        expect(socketModule.addEventListener).toHaveBeenCalledWith(
            'testEvent',
            mockHandler
        );
    });

    test('should toggle ready state', () => {
        const gameId = 'game123';

        // Render the hook
        const { result } = renderHook(() => useSocket({ gameId }), { wrapper });

        // Call ready function
        act(() => {
            result.current.ready();
        });

        // Check if toggleReady is called with correct parameters
        expect(socketModule.toggleReady).toHaveBeenCalledWith(
            gameId,
            mockUser.id
        );
    });

    test('should send vote', () => {
        const gameId = 'game123';
        const roundId = 'round123';

        // Render the hook
        const { result } = renderHook(() => useSocket({ gameId }), { wrapper });

        // Call vote function
        act(() => {
            result.current.vote(roundId, true);
        });

        // Check if sendVote is called with correct parameters
        expect(socketModule.sendVote).toHaveBeenCalledWith(
            gameId,
            mockUser.id,
            roundId,
            true
        );
    });

    test('should send chat message', () => {
        const gameId = 'game123';
        const message = 'Hello, world!';

        // Render the hook
        const { result } = renderHook(() => useSocket({ gameId }), { wrapper });

        // Call sendChat function
        act(() => {
            result.current.sendChat(message);
        });

        // Check if sendChatMessage is called with correct parameters
        expect(socketModule.sendChatMessage).toHaveBeenCalledWith(
            gameId,
            mockUser.id,
            mockUser.username,
            message
        );
    });
}); 