interface VoteBarProps {
    positive: number;
    negative: number;
    total: number;
}

const VoteBar = ({ positive, negative, total }: VoteBarProps) => {
    // 투표율 계산
    const votedCount = positive + negative;
    const votedPercentage = total > 0 ? Math.round((votedCount / total) * 100) : 0;

    // 찬성/반대 비율 계산
    const positivePercentage = votedCount > 0 ? Math.round((positive / votedCount) * 100) : 0;

    return (
        <div className="vote-bar-container">
            <div className="vote-counts">
                <div className="positive-count">👍 {positive}</div>
                <div className="vote-progress">
                    {votedCount}/{total} 투표 완료 ({votedPercentage}%)
                </div>
                <div className="negative-count">👎 {negative}</div>
            </div>

            <div className="vote-bar">
                <div
                    className="positive-bar"
                    style={{ width: `${positivePercentage}%` }}
                ></div>
                <div
                    className="negative-bar"
                    style={{ width: `${100 - positivePercentage}%` }}
                ></div>
            </div>

            {votedCount > 0 && (
                <div className="vote-percentage">
                    <div>찬성: {positivePercentage}%</div>
                    <div>반대: {100 - positivePercentage}%</div>
                </div>
            )}

            {/* 투표 결과 표시 */}
            {votedCount === total && total > 0 && (
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