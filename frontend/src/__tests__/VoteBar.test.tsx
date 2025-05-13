import React from 'react';
import { render, screen } from '@testing-library/react';
import VoteBar from '../components/Game/VoteBar';

// First, we need to make the VoteBar component file since it wasn't shown in the provided files
// Let's assume it's a simple component that displays a progress bar for votes

// Mock the CSS modules
jest.mock('../components/Game/VoteBar.module.css', () => ({
    voteBar: 'voteBar',
    voteBarContainer: 'voteBarContainer',
    positiveBar: 'positiveBar',
    negativeBar: 'negativeBar',
    voteStats: 'voteStats',
}));

describe('VoteBar Component', () => {
    test('renders with no votes', () => {
        render(<VoteBar positive={0} negative={0} total={5} />);

        // Check for 0 votes text
        expect(screen.getByText('투표: 0/5')).toBeInTheDocument();
    });

    test('renders with some positive votes', () => {
        render(<VoteBar positive={2} negative={0} total={5} />);

        // Check for vote count text
        expect(screen.getByText('투표: 2/5')).toBeInTheDocument();

        // Check for vote percentage text
        expect(screen.getByText('찬성: 100%')).toBeInTheDocument();
        expect(screen.getByText('반대: 0%')).toBeInTheDocument();

        // Check that the vote bar has the correct width
        const positiveBarElement = screen.getByTestId('positive-bar');
        expect(positiveBarElement).toHaveStyle({ width: '100%' });
    });

    test('renders with some negative votes', () => {
        render(<VoteBar positive={0} negative={3} total={5} />);

        // Check for vote count text
        expect(screen.getByText('투표: 3/5')).toBeInTheDocument();

        // Check for vote percentage text
        expect(screen.getByText('찬성: 0%')).toBeInTheDocument();
        expect(screen.getByText('반대: 100%')).toBeInTheDocument();

        // Check that the vote bar has the correct width
        const negativeBarElement = screen.getByTestId('negative-bar');
        expect(negativeBarElement).toHaveStyle({ width: '100%' });
    });

    test('renders with mixed votes', () => {
        render(<VoteBar positive={2} negative={2} total={5} />);

        // Check for vote count text
        expect(screen.getByText('투표: 4/5')).toBeInTheDocument();

        // Check for vote percentage text
        expect(screen.getByText('찬성: 50%')).toBeInTheDocument();
        expect(screen.getByText('반대: 50%')).toBeInTheDocument();

        // Check that the vote bars have the correct width
        const positiveBarElement = screen.getByTestId('positive-bar');
        const negativeBarElement = screen.getByTestId('negative-bar');
        expect(positiveBarElement).toHaveStyle({ width: '50%' });
        expect(negativeBarElement).toHaveStyle({ width: '50%' });
    });

    test('handles edge case with more votes than total', () => {
        // This could happen if the total prop is not updated correctly
        render(<VoteBar positive={3} negative={4} total={5} />);

        // Check for vote count text - should show actual vote count
        expect(screen.getByText('투표: 7/5')).toBeInTheDocument();

        // Check for vote percentage text
        expect(screen.getByText('찬성: 43%')).toBeInTheDocument();
        expect(screen.getByText('반대: 57%')).toBeInTheDocument();
    });

    test('shows correct percentages with no votes', () => {
        render(<VoteBar positive={0} negative={0} total={5} />);

        // When no votes, both should show 0%
        expect(screen.getByText('찬성: 0%')).toBeInTheDocument();
        expect(screen.getByText('반대: 0%')).toBeInTheDocument();
    });
}); 