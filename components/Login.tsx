import React, { useState, useContext, FormEvent } from 'react';
import { AuthContext } from '../context/AuthContext.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';
import GoogleSignInButton from './GoogleSignInButton.tsx';

const Login: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await authContext?.login(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-black/20 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-500/10">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-purple-200 mb-1">Email</label>
                    <input
                        type="email"
                        id="login-email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-purple-200 mb-1">Password</label>
                    <input
                        type="password"
                        id="login-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all"
                        required
                    />
                </div>
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-2.5 px-4 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                >
                    {isLoading ? <LoadingSpinner /> : 'Log In'}
                </button>
            </form>
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-purple-500/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-400">OR</span>
                </div>
            </div>
            <GoogleSignInButton />
        </div>
    );
};

export default Login;