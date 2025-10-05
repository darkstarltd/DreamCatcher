import React, { useState, useContext } from 'react';
import { DreamContext } from '../context/DreamContext.tsx';
import { ToastContext } from '../context/ToastContext.tsx';
import { IncubationSession } from '../types.ts';
import { generateIncubationGuide } from '../services/geminiService.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import { SparklesIcon } from './icons/index.tsx';

interface IncubationSetupModalProps {
    onClose: () => void;
    onGuideGenerated: (session: IncubationSession) => void;
}

const IncubationSetupModal: React.FC<IncubationSetupModalProps> = ({ onClose, onGuideGenerated }) => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);

    const [intention, setIntention] = useState('');
    const [keywords, setKeywords] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!dreamContext || !toastContext) return null;
    const { addIncubationSession } = dreamContext;
    const { addToast } = toastContext;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!intention.trim()) {
            setError('Please set an intention.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const keywordsArray = keywords.split(',').map(k => k.trim()).filter(Boolean);
            const guide = await generateIncubationGuide(intention, keywordsArray);

            const newSession = addIncubationSession({
                intention,
                keywords: keywordsArray,
                guidedScript: guide.guidedScript,
                focusImagePrompt: guide.focusImagePrompt,
            });
            
            addToast("Incubation guide generated!", "success");
            onGuideGenerated(newSession);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate guide.';
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-2xl p-8 space-y-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-purple-300">New Incubation Session</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                
                <p className="text-purple-300">What would you like to dream about? Be specific with your intention.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="intention" className="block text-sm font-medium text-purple-200 mb-1">My Intention is to...</label>
                        <input
                            type="text"
                            id="intention"
                            value={intention}
                            onChange={e => setIntention(e.target.value)}
                            className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="e.g., find a solution to my current project"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="keywords" className="block text-sm font-medium text-purple-200 mb-1">Focus Keywords (optional, comma-separated)</label>
                        <input
                            type="text"
                            id="keywords"
                            value={keywords}
                            onChange={e => setKeywords(e.target.value)}
                            className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="e.g., code, logic, breakthrough, clarity"
                        />
                    </div>
                     {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Cancel</button>
                        <button type="submit" disabled={isLoading} className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors flex items-center gap-2 disabled:opacity-50">
                            {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
                            {isLoading ? 'Generating Guide...' : 'Generate Guide'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IncubationSetupModal;