import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
    fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    message = '로딩 중...',
    fullScreen = false
}) => {
    const spinnerClass = `spinner ${size} ${fullScreen ? 'fullscreen' : ''}`;

    return (
        <div className={spinnerClass}>
            <div className="spinner-icon"></div>
            {message && <p className="spinner-text">{message}</p>}
        </div>
    );
};

export default LoadingSpinner; 