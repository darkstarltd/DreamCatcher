import React, { useState, useContext, useEffect } from 'react';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { ModalContext } from '../context/ModalContext';
import { Dream } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { suggestConnections } from '../services/geminiService';

const ConnectionSuggestionsModal: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const modalContext = useContext(ModalContext);
    
    const [suggestions, setSuggestions] = useState<{ dreamId: string, reason: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    if (!modalContext) return null;
    const { modalState, closeModal } = modalContext;
    const { isOpen, dream: currentDream } = modalState.connectionSuggestions;
    const onClose = () => closeModal('connectionSuggestions');

    useEffect(() => {
        if (isOpen && dreamContext && currentDream) {
            const fetchSuggestions = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const result = await suggestConnections(currentDream, dreamContext.dreams);
                    setSuggestions(result);
                    setSelectedIds(new Set(result.map(s => s.dreamId)));
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to get suggestions.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSuggestions();
        }
    }, [isOpen, currentDream, dreamContext]);

    if (!isOpen || !dreamContext || !toastContext || !currentDream) return null;
    const { dreams, updateDream } = dreamContext;
    const { addToast } = toastContext;

    const handleToggle = (dreamId: string) => {
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(dreamId)) {
            newSelectedIds.delete(dreamId);
        } else {
            newSelectedIds.add(dreamId);
        }
        setSelectedIds(newSelectedIds);
    };

    const handleSave = () => {
        const newLinks = Array.from(selectedIds);
        const existingLinks = new Set(currentDream.linkedDreamIds || []);
        const allLinks = Array.from(new Set([...existingLinks, ...newLinks]));

        // Update current dream
        updateDream(currentDream.id, { linkedDreamIds: allLinks });

        // Update the other dreams to link back
        newLinks.forEach(id => {
            const dreamToUpdate = dreams.find(d => d.id === id);
            if (dreamToUpdate) {
                const updatedLinks = Array.from(new Set([...(dreamToUpdate.linkedDreamIds || []), currentDream.id]));
                updateDream(id, { linkedDreamIds: updatedLinks });
            }
        });

        addToast(`${newLinks.length} dream(s) linked successfully!`, 'success');
        onClose();
    };
    
    const suggestedDreams = suggestions.map(suggestion => {
        const dream = dreams.find(d => d.id === suggestion.dreamId);
        return { ...dream, reason: suggestion.reason };
    }).filter((d): d is Dream & { reason: string } => !!d.id);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center p-8">
                    <LoadingSpinner />
                    <p className="mt-4 text-purple-300">Finding connections in your subconscious...</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">
                    <p className="font-bold">Suggestion Failed</p>
                    <p>{error}</p>
                </div>
            );
        }
        if (suggestedDreams.length === 0) {
             return <p className="text-purple-400 text-center py-8">No strong connections found in your journal.</p>;
        }
        return suggestedDreams.map(dream => (
            <div key={dream.id} className="p-3 rounded-md bg-black/20 border border-purple-500/10">
                <div className="flex items-start">
                     <input
                        type="checkbox"
                        id={`suggest-${dream.id}`}
                        checked={selectedIds.has(dream.id)}
                        onChange={() => handleToggle(dream.id)}
                        className="h-5 w-5 rounded bg-gray-700 border-purple-500 text-purple-600 focus:ring-purple-500 cursor-pointer mt-1"
                    />
                    <label htmlFor={`suggest-${dream.id}`} className="ml-3 text-white cursor-pointer flex-grow">
                        <p className="font-semibold">{dream.title}</p>
                        <p className="text-sm text-purple-300">{dream.date}</p>
                        <blockquote className="mt-2 text-sm text-gray-300 italic border-l-2 border-purple-400/50 pl-2">
                            {dream.reason}
                        </blockquote>
                    </label>
                </div>
            </div>
        ));
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-2xl p-8 space-y-6 flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-purple-300">AI-Suggested Connections</h2>
                
                <div className="flex-grow overflow-y-auto pr-4 space-y-3 max-h-[60vh]">
                    {renderContent()}
                </div>
                
                {!isLoading && !error && suggestedDreams.length > 0 && (
                    <div className="flex justify-end gap-4 pt-4 border-t border-purple-500/20">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Cancel</button>
                        <button type="button" onClick={handleSave} disabled={selectedIds.size === 0} className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:opacity-50">
                            Link Selected ({selectedIds.size})
                        </button>
                    </div>
                )}
                 {!isLoading && (error || suggestedDreams.length === 0) && (
                     <div className="flex justify-end pt-4 border-t border-purple-500/20">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Close</button>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ConnectionSuggestionsModal;
