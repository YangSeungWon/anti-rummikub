interface TimerProps {
    timeLeft: number;
}

const Timer = ({ timeLeft }: TimerProps) => {
    // 시간을 MM:SS 형식으로 변환
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // 타이머 색상 계산 (45초에서 0초로 가면서 녹색 -> 노란색 -> 빨간색으로 변화)
    const getTimerColor = (seconds: number): string => {
        if (seconds > 30) {
            return '#27ae60'; // 녹색
        } else if (seconds > 10) {
            return '#f39c12'; // 노란색
        } else {
            return '#e74c3c'; // 빨간색
        }
    };

    return (
        <div
            className="timer"
            style={{
                color: getTimerColor(timeLeft),
                borderColor: getTimerColor(timeLeft)
            }}
        >
            <div className="timer-icon">⏱</div>
            <div className="timer-value">{formatTime(timeLeft)}</div>
        </div>
    );
};

export default Timer; 