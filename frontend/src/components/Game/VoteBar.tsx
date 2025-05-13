import React from 'react';

interface VoteBarProps {
    positive: number;
    negative: number;
    total: number;
}

const VoteBar: React.FC<VoteBarProps> = ({ positive, negative, total }) => {
    const totalVotes = positive + negative;
    const positivePercentage = totalVotes > 0 ? Math.round((positive / totalVotes) * 100) : 0;
    const negativePercentage = totalVotes > 0 ? Math.round((negative / totalVotes) * 100) : 0;

    return (
        <div className="vote-bar-container">
            <div className="vote-stats">
                <div>투표: {totalVotes}/{total}</div>
                <div>찬성: {positivePercentage}%</div>
                <div>반대: {negativePercentage}%</div>
            </div>

            <div className="vote-bar">
                {positive > 0 && (
                    <div
                        className="positive-bar"
                        data-testid="positive-bar"
                        style={{ width: `${positivePercentage}%` }}
                    />
                )}
                {negative > 0 && (
                    <div
                        className="negative-bar"
                        data-testid="negative-bar"
                        style={{ width: `${negativePercentage}%` }}
                    />
                )}
            </div>

            {totalVotes === total && total > 0 && (
                <div className={`vote-result ${positivePercentage > 50 ? 'positive' : 'negative'}`}>
                    {positivePercentage > 50 ? (
                        <div className="positive-result">
                            <span className="result-icon">✓</span>
                            <span className="result-text">설명 인정!</span>
                        </div>
                    ) : (
                        <div className="negative-result">
                            <span className="result-icon">✗</span>
                            <span className="result-text">설명 실패!</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VoteBar; 