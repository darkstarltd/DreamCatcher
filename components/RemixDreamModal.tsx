import React, { useState, useContext } from 'react';
import { Dream } from '../types';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { remixDream } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon, XIcon, LinkIcon, ShuffleIcon } from './icons';

interface RemixDreamModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalDream: Dream;
}

const RemixDreamModal: React.FC<RemixDreamModalProps> = ({ isOpen, onClose, originalDream }) => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);

    const [remixPrompt, setRemixPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [remixedDream, setRemixedDream] = useState<{ title: string; description: string } | null>(null);

    if (!isOpen || !dreamContext || !toastContext) return null;
    
    const { addDream, updateDream, selectDream } = dreamContext;
    const { addToast } = toastContext;

    const handleRemix = async () => {
        if (!remixPrompt.trim()) {
            addToast("Please enter a remix instruction.", "error");
            return;
        }
        setIsLoading(true);
        setError(null);
        setRemixedDream(null);
        try {
            const result = await remixDream(originalDream, remixPrompt);
            setRemixedDream(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remix dream.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (!remixedDream) return;

        const newDreamData = {
            ...originalDream,
            title: remixedDream.title,
            description: remixedDream.description,
            imageUrl: null, // Clear image as it's a new version
            videoUrl: null,
            chatHistory: [],
            linkedDreamIds: Array.from(new Set([...(originalDream.linkedDreamIds || []), originalDream.id])),
            isAIGenerated: true,
        };
        
        const newDream = addDream(newDreamData);

        // Link original dream back to the new one
        updateDream(originalDream.id, {
            linkedDreamIds: Array.from(new Set([...(originalDream.linkedDreamIds || []), newDream.id]))
        });

        addToast("Remixed dream saved!", "success");
        onClose();
        selectDream(newDream); // Navigate to the new dream
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] p-8 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-3xl font-bold text-purple-300 flex items-center gap-3">
                        <ShuffleIcon className="h-7 w-7" />
                        Remix Dream
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon /></button>
                </div>
                
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
                    {/* Original Dream */}
                    <div className="space-y-3 flex flex-col">
                        <h3 className="text-lg font-semibold text-purple-200">Original Dream</h3>
                        <div className="p-4 bg-black/20 rounded-lg border border-purple-500/10 h-full overflow-y-auto">
                            <h4 className="font-bold text-white">{originalDream.title}</h4>
                            <p className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">{originalDream.description}</p>
                        </div>
                    </div>

                    {/* Remix Area */}
                    <div className="space-y-3 flex flex-col">
                        <h3 className="text-lg font-semibold text-purple-200">Remix Instruction</h3>
                        <textarea
                            value={remixPrompt}
                            onChange={e => setRemixPrompt(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-800 border border-purple-500/50 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="e.g., Change the setting to a jungle. What if the main character could fly? Make the ending happy."
                            disabled={isLoading}
                        />
                        <button onClick={handleRemix} disabled={isLoading || !remixPrompt.trim()} className="flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:opacity-50">
                            {isLoading && !remixedDream ? <LoadingSpinner /> : <SparklesIcon />}
                            {isLoading && !remixedDream ? 'Remixing...' : 'Remix'}
                        </button>

                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <div className="flex-grow p-4 bg-black/20 rounded-lg border border-purple-500/10 min-h-[200px] overflow-y-auto">
                            {isLoading && !remixedDream && <div className="flex items-center justify-center h-full text-purple-300">Remixing in progress...</div>}
                            {remixedDream && (
                                <div className="animate-fade-in space-y-2">
                                    <h4 className="font-bold text-white">{remixedDream.title}</h4>
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{remixedDream.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-purple-500/10">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Close</button>
                    <button onClick={handleSave} disabled={!remixedDream} className="py-2 px-4 bg-green-700 hover:bg-green-600 rounded-md font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" /> Save as New Linked Dream
                    </button>
                </div>
            </div>
        </div>
    );
};
export default RemixDreamModal;