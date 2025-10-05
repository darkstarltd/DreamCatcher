import React from 'react';

// The animation classes (e.g., animate-sway-main) are defined in index.html
const LoadingSpinner: React.FC = () => {
    return (
        <svg viewBox="0 0 100 100" className="animate-sway-main text-purple-300 h-5 w-5">
            {/* Hoop */}
            <circle cx="50" cy="35" r="30" stroke="currentColor" strokeWidth="4" fill="none" />
            
            {/* Web */}
            <g stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7">
                <line x1="50" y1="5" x2="50" y2="65" />
                <line x1="20" y1="35" x2="80" y2="35" />
                <line x1="29.3" y1="14.3" x2="70.7" y2="55.7" />
                <line x1="29.3" y1="55.7" x2="70.7" y2="14.3" />
            </g>
            <circle cx="50" cy="35" r="5" fill="currentColor" fillOpacity="0.5" />

            {/* Hanging Feathers */}
            <g className="animate-sway-feather-1" style={{ animationDelay: '0.2s' }}>
                <line x1="50" y1="65" x2="50" y2="75" stroke="currentColor" strokeWidth="2" />
                <ellipse cx="50" cy="85" rx="4" ry="12" fill="currentColor" />
            </g>
            <g className="animate-sway-feather-2">
                <line x1="50" y1="65" x2="35" y2="75" stroke="currentColor" strokeWidth="2" />
                <ellipse cx="35" cy="85" rx="4" ry="12" fill="currentColor" fillOpacity="0.8" />
            </g>
            <g className="animate-sway-feather-1" style={{ animationDelay: '0.4s' }}>
                <line x1="50" y1="65" x2="65" y2="75" stroke="currentColor" strokeWidth="2" />
                <ellipse cx="65" cy="85" rx="4" ry="12" fill="currentColor" fillOpacity="0.8" />
            </g>
        </svg>
    );
};

export default LoadingSpinner;