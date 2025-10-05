
import React, { useState, useContext } from 'react';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { Dream } from '../types';
import { generateDreamFromPrompt } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon } from './icons';

interface OneirogenProps {
    onDreamCreated: (dream: Dream) => void;
}

const Oneirogen: React.FC<OneirogenProps> = ({ onDreamCreated }) => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);

    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!dreamContext || !toastContext) return null;
    const { addDream } = dreamContext;
    const { addToast } = toastContext;

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            addToast("Please enter a prompt.", "error");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const dreamData = await generateDreamFromPrompt(prompt);
            const newDream = addDream({ 
                ...dreamData,
                chatHistory: [], 
                // Ensure other optional fields have default values if not provided by AI
                imageUrl: null,
                videoUrl: null,
                audioUrl: null,
                linkedDreamIds: [],
                sharedWith: [],
            });
            addToast("AI dream forged successfully!", "success");
            onDreamCreated(newDream);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to forge dream.";
            setError(msg);
            addToast(msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto space-y-6 animate-fade-in">
            <SparklesIcon className="h-16 w-16 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">Oneirogen: The AI Dream Forge</h2>
            <p className="text-purple-300">
                Provide a spark of an idea, a concept, or a feeling, and the AI will forge a complete dream entry for you.
                A perfect tool for creative blocks or exploring "what if" scenarios in your subconscious.
            </p>

            <div className="w-full p-4 bg-black/20 rounded-lg border border-purple-500/10 space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-800 border border-purple-500/50 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="e.g., A library where the books are made of water... A conversation with my childhood pet... The feeling of solving an impossible puzzle..."
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:opacity-50"
                >
                    {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
                    {isLoading ? 'Forging...' : 'Forge Dream'}
                </button>
                {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
        </div>
    );
};

export default Oneirogen;