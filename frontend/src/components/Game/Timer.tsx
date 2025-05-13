import { useEffect, useState } from 'react';

interface TimerProps {
    timeLeft: number;
    isGracePeriod?: boolean;
}

const Timer = ({ timeLeft, isGracePeriod = false }: TimerProps) => {
    const [timerClass, setTimerClass] = useState('timer');

    useEffect(() => {
        // 10초 이하면 경고 스타일
        if (timeLeft <= 5 && !isGracePeriod) {
            setTimerClass('timer danger');
        } else if (timeLeft <= 10 && !isGracePeriod) {
            setTimerClass('timer warning');
        } else {
            setTimerClass(isGracePeriod ? 'timer grace' : 'timer');
        }
    }, [timeLeft, isGracePeriod]);

    // 시간 형식화 (MM:SS)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className={timerClass}>
            {isGracePeriod ? (
                <>
                    <span className="timer-label">준비 시간:</span>
                    <span className="timer-value">{timeLeft}</span>
                </>
            ) : (
                <>
                    <span className="timer-label">남은 시간:</span>
                    <span className="timer-value">{formatTime(timeLeft)}</span>
                </>
            )}
        </div>
    );
};

export default Timer; 