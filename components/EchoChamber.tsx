
import React, { useState, useContext, FC } from 'react';
import { ToastContext } from '../context/ToastContext';
import { DreamEcho } from '../types';
import { generateDreamEcho } from '../services/geminiService';
import { EchoIcon, SparklesIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

const EchoChamber: FC = () => {
    const toastContext = useContext(ToastContext);
    const [fragment, setFragment] = useState('');
    const [echo, setEcho] = useState<DreamEcho | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!toastContext) return null;
    const { addToast } = toastContext;

    const handleCastEcho = async () => {
        if (!fragment.trim()) {
            addToast("Please enter a dream fragment to cast.", "error");
            return;
        }
        setIsLoading(true);
        setEcho(null);
        try {
            const result = await generateDreamEcho(fragment.trim());
            setEcho(result);
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to generate echoes.", "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleTryAgain = () => {
        setEcho(null);
        setFragment('');
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center">
                <EchoIcon className="h-12 w-12 mx-auto text-purple-400" />
                <h2 className="text-3xl font-bold text-purple-300 mt-2">Echo Chamber</h2>
                <p className="text-purple-300 max-w-2xl mx-auto">Cast a fragment of your dream into the void and see what echoes back. A tool for anonymous, ephemeral reflection.</p>
            </div>
            
            {!echo && (
                <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg space-y-4">
                    <textarea
                        value={fragment}
                        onChange={e => setFragment(e.target.value)}
                        rows={4}
                        className="w-full bg-gray-800 border border-purple-500/50 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="e.g., A clock with no hands... The feeling of remembering a forgotten song... A city made of coral..."
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleCastEcho}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
                        {isLoading ? 'Casting into the void...' : 'Cast Echo'}
                    </button>
                </div>
            )}
            
            {isLoading && !echo && (
                <div className="text-center p-8">
                    <p className="text-purple-300">Listening for echoes...</p>
                </div>
            )}

            {echo && (
                <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg space-y-6 animate-fade-in">
                    <div>
                        <h3 className="text-sm font-semibold text-purple-200 uppercase tracking-wider">Your Fragment</h3>
                        <blockquote className="mt-2 text-lg text-white italic border-l-4 border-purple-500/50 pl-4">
                            "{echo.original}"
                        </blockquote>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">Echoes from the Void</h3>
                        {echo.echoes.map((e, i) => (
                             <blockquote key={i} className="text-gray-300 italic border-l-2 border-cyan-400/50 pl-3">
                                {e}
                            </blockquote>
                        ))}
                    </div>
                     <div className="text-center pt-4 border-t border-purple-500/10">
                        <button
                            onClick={handleTryAgain}
                            className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold transition-colors"
                        >
                            Cast Another Echo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EchoChamber;