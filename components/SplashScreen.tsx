import React from 'react';

interface SplashScreenProps {
  isFading: boolean;
}

// A simple star SVG for the background
const Stars: React.FC = () => (
    <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
        <div className="absolute top-[20%] left-[80%] w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute top-[50%] left-[50%] w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-[80%] left-[10%] w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-[90%] left-[90%] w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
    </div>
);

const SplashScreen: React.FC<SplashScreenProps> = ({ isFading }) => {
  return (
    <div className={`fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-[100] transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <Stars />
        <div className="w-64 h-64 relative">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                <defs>
                    <radialGradient id="grad-splash-core">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#67e8f9" />
                    </radialGradient>
                </defs>
                {/* Central Core */}
                <circle cx="100" cy="100" r="10" fill="url(#grad-splash-core)" style={{ animation: 'cosmic-pulse 2s infinite ease-in-out' }} />
                
                {/* Lines and Icons */}
                <g stroke="#a855f7" strokeOpacity="0.7" strokeWidth="1.5">
                    {/* Journal */}
                    <line x1="100" y1="100" x2="100" y2="30" className="splash-line" style={{animationDelay: '0.2s'}}/>
                    <path d="M95 20 L105 20 L105 25 L95 25Z M95 20 C90 20 90 30 95 30 M105 20 C110 20 110 30 105 30" stroke="white" strokeWidth="1" fill="none" className="splash-icon" style={{animationDelay: '2.2s'}} />

                    {/* Dashboard */}
                    <line x1="100" y1="100" x2="160" y2="60" className="splash-line" style={{animationDelay: '0.4s'}}/>
                    <path d="M155 52 L155 58 L160 58 L160 48 L165 48 L165 58" stroke="white" strokeWidth="1" fill="none" className="splash-icon" style={{animationDelay: '2.4s'}}/>

                     {/* Vault */}
                    <line x1="100" y1="100" x2="160" y2="140" className="splash-line" style={{animationDelay: '0.6s'}}/>
                    <circle cx="165" cy="145" r="5" stroke="white" strokeWidth="1" fill="none" className="splash-icon" style={{animationDelay: '2.6s'}} />
                    <circle cx="165" cy="145" r="2" stroke="white" strokeWidth="0.5" fill="white" className="splash-icon" style={{animationDelay: '2.6s'}} />

                     {/* Scape */}
                    <line x1="100" y1="100" x2="100" y2="170" className="splash-line" style={{animationDelay: '0.8s'}}/>
                    <path d="M95 180 Q100 170 105 180 M98 177 Q100 174 102 177" stroke="white" strokeWidth="1" fill="none" className="splash-icon" style={{animationDelay: '2.8s'}}/>

                     {/* Incubation */}
                    <line x1="100" y1="100" x2="40" y2="140" className="splash-line" style={{animationDelay: '1.0s'}}/>
                    <path d="M35 145 Q40 135 45 145 M40 145 L40 150" stroke="white" strokeWidth="1" fill="none" className="splash-icon" style={{animationDelay: '3.0s'}}/>
                    
                    {/* Guide */}
                     <line x1="100" y1="100" x2="40" y2="60" className="splash-line" style={{animationDelay: '1.2s'}}/>
                     <path d="M35 55 L45 65 M45 55 L35 65 M40 50 L40 70" stroke="white" strokeWidth="1" fill="none" className="splash-icon" style={{animationDelay: '3.2s'}}/>
                </g>
            </svg>
        </div>
        <h1 className="text-5xl font-bold text-white mt-8" style={{ animation: 'title-glow-fade 1.5s ease-out 3.5s forwards', opacity: 0 }}>
            Dream Catcher
        </h1>
    </div>
  );
};

export default SplashScreen;