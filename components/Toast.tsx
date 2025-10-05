
import React, { useEffect, useState, useCallback } from 'react';
import { CheckIcon, XIcon, TrophyIcon, InformationCircleIcon } from './icons';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'achievement';
    onDismiss: () => void;
}

const toastConfig = {
    success: {
        icon: <CheckIcon className="h-5 w-5 text-green-300" />,
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        bar: 'bg-green-400',
    },
    error: {
        icon: <XIcon className="h-5 w-5 text-red-300" />,
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        bar: 'bg-red-400',
    },
    info: {
        icon: <InformationCircleIcon className="h-5 w-5 text-blue-300" />,
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        bar: 'bg-blue-400',
    },
    achievement: {
        icon: <TrophyIcon className="h-6 w-6 text-yellow-300" />,
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-400/30',
        bar: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    }
};


const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);

    const handleDismiss = useCallback(() => {
        setIsFadingOut(true);
        // Wait for animation to finish before calling onDismiss
        setTimeout(() => {
            onDismiss();
        }, 300); 
    }, [onDismiss]);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleDismiss();
        }, 4500);

        return () => clearTimeout(timer);
    }, [handleDismiss]);

    const config = toastConfig[type];

    // CSS animations `animate-toast-in`, `animate-toast-out`, `animate-progress-bar` are assumed to be defined in a global stylesheet (e.g., index.html)
    return (
        <div className={`w-full ${config.bg} ${config.border} backdrop-blur-md rounded-lg shadow-lg overflow-hidden flex items-start animate-toast-in ${isFadingOut ? 'animate-toast-out' : ''}`}>
            <div className="flex-shrink-0 p-3">{config.icon}</div>
            <div className="flex-grow p-3 pr-8">
                <p className="text-sm font-medium text-white">{message}</p>
            </div>
            <button onClick={handleDismiss} className="absolute top-1 right-1 p-1 text-gray-400 hover:text-white rounded-full">
                &times;
            </button>
            <div className="absolute bottom-0 left-0 h-1 w-full">
                <div className={`${config.bar} h-full animate-progress-bar`}></div>
            </div>
        </div>
    );
};

export default Toast;
