import { useState, useEffect } from 'react';

interface ErrorToastProps {
    message: string;
    duration?: number;
    onClose?: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({
    message,
    duration = 5000,
    onClose
}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // 지정된 시간 후에 자동으로 사라짐
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = () => {
        setVisible(false);
        if (onClose) onClose();
    };

    if (!visible) return null;

    return (
        <div className="error-toast">
            <div className="error-toast-content">
                <span className="error-icon">⚠️</span>
                <p>{message}</p>
            </div>
            <button className="close-button" onClick={handleClose}>×</button>
        </div>
    );
};

export default ErrorToast; 