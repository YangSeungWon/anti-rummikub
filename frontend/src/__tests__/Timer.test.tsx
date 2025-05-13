import React from 'react';
import { render, screen } from '@testing-library/react';
import Timer from '../components/Game/Timer';

describe('Timer Component', () => {
    test('renders regular timer with formatted time', () => {
        // 45 seconds
        render(<Timer timeLeft={45} />);

        // Check for the timer label
        expect(screen.getByText('남은 시간:')).toBeInTheDocument();

        // Check for the formatted time (0:45)
        expect(screen.getByText('0:45')).toBeInTheDocument();

        // Check that it doesn't have warning or grace period class
        const timerElement = screen.getByText('남은 시간:').parentElement;
        expect(timerElement).toHaveClass('timer');
        expect(timerElement).not.toHaveClass('warning');
        expect(timerElement).not.toHaveClass('danger');
        expect(timerElement).not.toHaveClass('grace');
    });

    test('renders warning timer when time is below 10 seconds', () => {
        render(<Timer timeLeft={10} />);

        // Check for the warning class
        const timerElement = screen.getByText('남은 시간:').parentElement;
        expect(timerElement).toHaveClass('timer');
        expect(timerElement).toHaveClass('warning');
    });

    test('renders danger timer when time is below 5 seconds', () => {
        render(<Timer timeLeft={3} />);

        // Check for the danger class
        const timerElement = screen.getByText('남은 시간:').parentElement;
        expect(timerElement).toHaveClass('timer');
        expect(timerElement).toHaveClass('danger');
    });

    test('renders grace period timer', () => {
        render(<Timer timeLeft={5} isGracePeriod={true} />);

        // Check for the grace period label and value
        expect(screen.getByText('준비 시간:')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();

        // Check for the grace class
        const timerElement = screen.getByText('준비 시간:').parentElement;
        expect(timerElement).toHaveClass('timer');
        expect(timerElement).toHaveClass('grace');
    });

    test('formats time correctly for minutes and seconds', () => {
        render(<Timer timeLeft={65} />); // 1 minute and 5 seconds

        // Check for the formatted time (1:05)
        expect(screen.getByText('1:05')).toBeInTheDocument();
    });

    test('formats time correctly when seconds < 10', () => {
        render(<Timer timeLeft={61} />); // 1 minute and 1 second

        // Check for the formatted time (1:01)
        expect(screen.getByText('1:01')).toBeInTheDocument();
    });
}); 