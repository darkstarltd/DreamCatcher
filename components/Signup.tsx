import React, { useState, useContext, FormEvent } from 'react';
import { AuthContext } from '../context/AuthContext.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';
import GoogleSignInButton from './GoogleSignInButton.tsx';

const Signup: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [dob, setDob] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await authContext?.signup({ email, username, password, name, surname, dob });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign up failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-black/20 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-500/10">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Create Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="signup-name" className="block text-sm font-medium text-purple-200 mb-1">Name</label>
                        <input type="text" id="signup-name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all" required />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="signup-surname" className="block text-sm font-medium text-purple-200 mb-1">Surname</label>
                        <input type="text" id="signup-surname" value={surname} onChange={e => setSurname(e.target.value)} className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all" required />
                    </div>
                </div>
                 <div>
                    <label htmlFor="signup-dob" className="block text-sm font-medium text-purple-200 mb-1">Date of Birth</label>
                    <input type="date" id="signup-dob" value={dob} onChange={e => setDob(e.target.value)} className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all" required />
                </div>
                <div>
                    <label htmlFor="signup-username" className="block text-sm font-medium text-purple-200 mb-1">Username</label>
                    <input type="text" id="signup-username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all" required />
                </div>
                <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-purple-200 mb-1">Email</label>
                    <input type="email" id="signup-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all" required />
                </div>
                <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-purple-200 mb-1">Password</label>
                    <input type="password" id="signup-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all" required />
                </div>
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-2.5 px-4 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                >
                    {isLoading ? <LoadingSpinner /> : 'Sign Up'}
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

export default Signup;