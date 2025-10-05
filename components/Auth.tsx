import React, { useState, useContext } from 'react';
import Login from './Login.tsx';
import Signup from './Signup.tsx';
import { AuthContext } from '../context/AuthContext.tsx';

const Auth: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const authContext = useContext(AuthContext);

    const handleGuestLogin = () => {
        authContext?.continueAsGuest();
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans p-4">
            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8 animate-fade-in">
                     <h1 className="text-5xl font-bold text-white" style={{textShadow: '0 0 20px rgba(192, 132, 252, 0.7)' }}>
                        Dream Catcher
                    </h1>
                    <p className="text-purple-200 mt-2 text-lg">Unlock the mysteries of your subconscious.</p>
                </div>
                
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    {isLoginView ? <Login /> : <Signup />}
                </div>

                <div className="text-center mt-6 space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <button
                        onClick={() => setIsLoginView(!isLoginView)}
                        className="text-purple-300 hover:text-white transition-colors"
                    >
                        {isLoginView
                            ? "Don't have an account? Sign Up"
                            : "Already have an account? Log In"}
                    </button>
                    <div>
                        <button
                            onClick={handleGuestLogin}
                            className="text-sm text-gray-400 hover:text-purple-300 transition-colors"
                        >
                            Or continue as a guest to try the app
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
