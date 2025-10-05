import React, { useState, useEffect } from 'react';

const OfflineIndicator: React.FC = () => {
    const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => setIsOffline(false);

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    if (!isOffline) {
        return null;
    }

    return (
        <div 
            className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center p-2 z-[101] text-sm font-semibold animate-fade-in"
            role="status"
            aria-live="assertive"
        >
            You are currently offline. Some features may be unavailable.
        </div>
    );
};

export default OfflineIndicator;
