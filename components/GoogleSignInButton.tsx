import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.tsx';
import { ToastContext } from '../context/ToastContext.tsx';
import { GoogleIcon } from './icons';
import LoadingSpinner from './LoadingSpinner.tsx';

const GoogleSignInButton: React.FC = () => {
    const authContext = useContext(AuthContext);
    const toastContext = useContext(ToastContext);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await authContext?.loginWithGoogle();
        } catch (err) {
            toastContext?.addToast(err instanceof Error ? err.message : 'Google sign-in failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors disabled:opacity-70 border border-gray-300"
        >
            {isLoading ? <LoadingSpinner /> : <GoogleIcon className="h-5 w-5" />}
            Continue with Google
        </button>
    );
};

export default GoogleSignInButton;