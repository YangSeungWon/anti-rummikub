import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/Auth/LoginForm';
import { AuthContext } from '../context/AuthContext';

// Mock the AuthContext
const mockLogin = jest.fn();
const mockAuthContext = {
    user: null,
    token: null,
    loading: false,
    error: null,
    login: mockLogin,
    signup: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: false,
};

// Wrapper for providing AuthContext
const renderWithAuthContext = (ui: React.ReactElement, contextValue = mockAuthContext) => {
    return render(
        <AuthContext.Provider value={contextValue}>
            {ui}
        </AuthContext.Provider>
    );
};

describe('LoginForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders login form correctly', () => {
        renderWithAuthContext(<LoginForm />);

        // Check for title and form elements
        expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
        expect(screen.getByLabelText('사용자명')).toBeInTheDocument();
        expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
        expect(screen.getByText('계정이 없으신가요?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
    });

    test('should show validation error when form is submitted with empty fields', async () => {
        // Mock the setErrorMessage function
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const { container } = renderWithAuthContext(<LoginForm />);

        // Submit the form without entering data
        fireEvent.submit(screen.getByRole('button', { name: '로그인' }).closest('form') || container);

        // Wait for validation error to appear
        await waitFor(() => {
            const errorDiv = screen.queryByText((content) =>
                content.includes('사용자명과 비밀번호를 모두 입력해주세요')
            );
            expect(errorDiv).toBeInTheDocument();
        });

        // Verify that login function was not called
        expect(mockLogin).not.toHaveBeenCalled();

        // Restore console.error
        console.error = originalConsoleError;
    });

    test('should call login function with entered credentials', async () => {
        renderWithAuthContext(<LoginForm />);

        // Setup test data
        const username = 'testuser';
        const password = 'password123';

        // Fill the form
        await userEvent.type(screen.getByLabelText('사용자명'), username);
        await userEvent.type(screen.getByLabelText('비밀번호'), password);

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: '로그인' }));

        // Verify that login function was called with correct parameters
        expect(mockLogin).toHaveBeenCalledWith(username, password);
    });

    test('should display error message from auth context', () => {
        // Create auth context with an error
        const authContextWithError = {
            ...mockAuthContext,
            error: '로그인에 실패했습니다.',
        };

        // Render with error context
        renderWithAuthContext(<LoginForm />, authContextWithError);

        // Check for error message
        expect(screen.getByText('로그인에 실패했습니다.')).toBeInTheDocument();
    });

    test('should disable form inputs and button during loading', () => {
        // Create auth context with loading state
        const authContextLoading = {
            ...mockAuthContext,
            loading: true,
        };

        // Render with loading context
        renderWithAuthContext(<LoginForm />, authContextLoading);

        // Check that inputs and button are disabled
        expect(screen.getByLabelText('사용자명')).toBeDisabled();
        expect(screen.getByLabelText('비밀번호')).toBeDisabled();
        expect(screen.getByRole('button', { name: '로그인 중...' })).toBeDisabled();
    });

    test('should call onSuccess callback after successful login', async () => {
        // Mock success callback
        const onSuccess = jest.fn();

        // Setup successful login response
        mockLogin.mockResolvedValueOnce(undefined);

        // Render with onSuccess prop
        renderWithAuthContext(<LoginForm onSuccess={onSuccess} />);

        // Fill and submit the form
        await userEvent.type(screen.getByLabelText('사용자명'), 'testuser');
        await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');
        fireEvent.click(screen.getByRole('button', { name: '로그인' }));

        // Wait for the async login function to complete
        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });
    });

    test('should call onToggleForm when the signup button is clicked', () => {
        // Mock toggle callback
        const onToggleForm = jest.fn();

        // Render with onToggleForm prop
        renderWithAuthContext(<LoginForm onToggleForm={onToggleForm} />);

        // Click the signup button
        fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

        // Verify that onToggleForm was called
        expect(onToggleForm).toHaveBeenCalled();
    });
}); 