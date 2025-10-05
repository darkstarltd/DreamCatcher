import React, { useState, useContext } from 'react';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { identifyDreamSeries } from '../services/geminiService';
import { Dream } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon, WeaveIcon, LinkIcon } from './icons';

interface SeriesProps {
    onDreamSelect: (dream: Dream) => void;
}

const Series: React.FC<SeriesProps> = ({ onDreamSelect }) => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const [isLoading, setIsLoading] = useState(false);

    if (!dreamContext || !toastContext) return null;

    const { dreams, dreamSeries, setDreamSeries } = dreamContext;
    const { addToast } = toastContext;
    
    const DREAM_THRESHOLD = 20;

    const handleAnalyze = async () => {
        setIsLoading(true);
        try {
            const result = await identifyDreamSeries(dreams);
            setDreamSeries(result);
            if (result.length > 0) {
                addToast(`Found ${result.length} potential dream series!`, 'success');
            } else {
                addToast('No distinct series found at this time.', 'info');
            }
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to analyze for series.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center">
                <WeaveIcon className="h-12 w-12 mx-auto text-purple-400" />
                <h2 className="text-3xl font-bold text-purple-300 mt-2">Series Detector</h2>
                <p className="text-purple-300 max-w-2xl mx-auto">
                    Let the AI automatically find narrative threads and recurring stories hidden within your dream journal.
                </p>
            </div>

            <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg text-center space-y-3">
                <h3 className="text-xl font-semibold text-white">Find Narrative Threads</h3>
                <p className="text-purple-400">Analyze your entire journal to automatically group dreams into narrative series.</p>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || dreams.length < DREAM_THRESHOLD}
                    title={dreams.length < DREAM_THRESHOLD ? `You need at least ${DREAM_THRESHOLD} dreams to use this feature.` : 'Analyze for Series'}
                    className="flex items-center justify-center gap-2 mx-auto py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:opacity-50"
                >
                    {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
                    {isLoading ? 'Analyzing...' : 'Analyze Journal for Dream Series'}
                </button>
            </div>
            
            {isLoading ? (
                <div className="text-center p-8">
                    {/* The loading state is handled by the button's content change */}
                </div>
            ) : dreamSeries.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-purple-200 border-b border-purple-500/20 pb-2">Detected Series</h3>
                    {dreamSeries.map(series => (
                        <div key={series.seriesId} className="p-4 bg-black/20 rounded-xl border border-purple-500/10">
                            <h4 className="font-bold text-xl text-white">{series.title}</h4>
                            <p className="text-gray-300 italic mt-1">"{series.themeSummary}"</p>
                            <div className="mt-3 pt-3 border-t border-purple-500/10">
                                <p className="text-xs font-semibold text-purple-400 mb-2">Dreams in this series:</p>
                                <div className="flex flex-col gap-2">
                                    {series.dreamIds.map(dreamId => {
                                        const dream = dreams.find(d => d.id === dreamId);
                                        if (!dream) return null;
                                        return (
                                            <button 
                                                key={dreamId} 
                                                onClick={() => onDreamSelect(dream)}
                                                className="flex items-center gap-2 text-left p-2 rounded-md bg-purple-900/40 hover:bg-purple-900/70 transition-colors"
                                            >
                                                <LinkIcon className="h-4 w-4 text-purple-300 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-white">{dream.title}</p>
                                                    <p className="text-xs text-purple-300">{dream.date}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 bg-black/20 rounded-2xl border border-purple-500/10">
                    <WeaveIcon className="h-16 w-16 mx-auto text-purple-500/30" />
                    <h3 className="mt-4 text-xl font-semibold text-white">No Series Detected Yet</h3>
                    <p className="mt-2 text-purple-300">Click the button above to analyze your journal. You need at least 20 dreams for the best results.</p>
                </div>
            )}
        </div>
    );
};

export default Series;