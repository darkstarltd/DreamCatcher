import React, { useState, useContext } from 'react';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { SleepSession, SleepFragment, Dream } from '../types';
import { analyzeSleepFragment } from '../services/geminiService';
import { SparklesIcon, PlusIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface SessionDetailModalProps {
    session: SleepSession;
    onClose: () => void;
    onDreamSelect: (dream: Dream) => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, onClose, onDreamSelect }) => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    
    const [analyzingFragmentId, setAnalyzingFragmentId] = useState<string | null>(null);

    if (!dreamContext || !toastContext) return null;
    const { updateSleepSession, addDream } = dreamContext;
    const { addToast } = toastContext;

    const handleAnalyzeFragment = async (fragment: SleepFragment) => {
        setAnalyzingFragmentId(fragment.id);
        try {
            const match = fragment.audioUrl.match(/^data:.+;base64,(.+)$/);
            if (!match) throw new Error("Invalid audio data URL.");
            const base64Data = match[1];

            const result = await analyzeSleepFragment(base64Data, fragment.mimeType);

            // Update the fragment within the session
            const updatedFragments = session.fragments.map(f =>
                f.id === fragment.id ? { ...f, ...result } : f
            );
            updateSleepSession(session.id, { fragments: updatedFragments });
            addToast("Fragment analyzed!", 'success');
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Analysis failed.', 'error');
        } finally {
            setAnalyzingFragmentId(null);
        }
    };

    const handleCreateDream = (fragment: SleepFragment) => {
        if (!fragment.title || !fragment.transcription) return;

        addDream({
            title: fragment.title,
            description: fragment.transcription,
            mood: 'Bizarre', // Default mood
            tags: ['sleep-talk', fragment.theme || 'unknown-theme'],
            summary: `A dream fragment captured via Somniloquy. Theme: ${fragment.theme}.`,
            isRecurring: false,
            lucidity: 1,
            clarity: 2,
            chatHistory: [],
            audioUrl: fragment.audioUrl,
        });

        addToast("Dream created from fragment!", "success");
        onClose();
        // The App component will handle navigation
    };
    
    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-3xl max-h-[90vh] p-8 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0">
                    <div className="flex justify-between items-start mb-1">
                        <h2 className="text-3xl font-bold text-purple-300">Sleep Session Details</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                    </div>
                     <p className="text-purple-400">
                        {new Date(session.startTime).toLocaleString()}
                    </p>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 mt-6 space-y-4">
                    {session.fragments.length === 0 ? (
                        <p className="text-purple-300 text-center py-10">No audio fragments were captured in this session.</p>
                    ) : (
                        session.fragments.map(fragment => (
                            <div key={fragment.id} className="p-4 bg-black/20 rounded-lg border border-purple-500/10">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <audio controls src={fragment.audioUrl} className="w-full sm:w-auto" />
                                    <div className="flex-grow text-center sm:text-left">
                                        <h4 className="font-semibold text-white">{fragment.title || 'Untitled Fragment'}</h4>
                                        <p className="text-sm text-purple-300">{fragment.theme || 'Not yet analyzed'}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-2">
                                         <button
                                            onClick={() => handleAnalyzeFragment(fragment)}
                                            disabled={analyzingFragmentId === fragment.id}
                                            className="flex items-center gap-1.5 text-xs py-1.5 px-3 bg-purple-800/50 hover:bg-purple-800/80 rounded-md transition-colors disabled:opacity-50"
                                        >
                                            {analyzingFragmentId === fragment.id ? <LoadingSpinner /> : <SparklesIcon />}
                                            Analyze
                                        </button>
                                        {fragment.title && (
                                            <button
                                                onClick={() => handleCreateDream(fragment)}
                                                className="flex items-center gap-1.5 text-xs py-1.5 px-3 bg-green-800/50 hover:bg-green-800/80 rounded-md transition-colors"
                                            >
                                                <PlusIcon className="h-4 w-4" /> Dream
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {fragment.transcription && (
                                     <blockquote className="mt-3 text-sm text-gray-300 italic border-l-2 border-purple-400/50 pl-2">
                                        "{fragment.transcription}"
                                    </blockquote>
                                )}
                            </div>
                        ))
                    )}
                </div>

                 <div className="flex justify-end pt-4 flex-shrink-0">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Close</button>
                </div>
            </div>
         </div>
    );
};

export default SessionDetailModal;
