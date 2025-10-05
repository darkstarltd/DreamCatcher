import React, { useState } from 'react';
import { Dream } from '../types.ts';
import { analyzeDreamSeries } from '../services/geminiService.ts';
import { WeaveIcon, SparklesIcon, XIcon, LinkIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface DreamWeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    seriesDreams: Dream[];
    onDreamSelect: (dream: Dream) => void;
}

const DreamWeaveModal: React.FC<DreamWeaveModalProps> = ({ isOpen, onClose, seriesDreams, onDreamSelect }) => {
    const [analysis, setAnalysis] = useState<{ narrativeSummary: string; evolvingThemes: string[]; predictedContinuation: string; } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    // Sort dreams by date to create a chronological series for analysis
    const sortedSeries = [...seriesDreams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeDreamSeries(sortedSeries);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze the dream series.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-4xl max-h-[90vh] p-8 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-3xl font-bold text-purple-300 flex items-center gap-3">
                        <WeaveIcon className="h-6 w-6" />
                        Dream Weave
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-2">
                    {/* Dream Series Timeline */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-purple-200">Dream Series</h3>
                        <div className="relative pl-4 border-l-2 border-purple-500/30 space-y-4">
                            {sortedSeries.map((dream, index) => (
                                <div key={dream.id} className="relative">
                                    <div className="absolute -left-[23px] top-1 h-4 w-4 bg-purple-500 rounded-full border-2 border-gray-900"></div>
                                    <button onClick={() => onDreamSelect(dream)} className="p-3 bg-black/20 rounded-lg hover:bg-purple-900/40 w-full text-left transition-colors">
                                        <p className="font-semibold text-white">{dream.title}</p>
                                        <p className="text-xs text-purple-300">{dream.date}</p>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* AI Analysis Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-purple-200">Series Analysis</h3>
                            <button onClick={handleAnalyze} disabled={isLoading} className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-white disabled:opacity-50">
                                {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
                                Analyze
                            </button>
                        </div>

                        <div className="p-4 bg-black/20 rounded-lg border border-purple-500/10 min-h-[300px]">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-purple-300">
                                    <LoadingSpinner />
                                    <p className="mt-2">Analyzing the narrative thread...</p>
                                </div>
                            )}
                            {error && <p className="text-red-400">{error}</p>}
                            {analysis ? (
                                <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-purple-300 space-y-4 animate-fade-in">
                                    <h4>Narrative Summary</h4>
                                    <p>{analysis.narrativeSummary}</p>
                                    <h4>Evolving Themes</h4>
                                    <ul className="list-disc pl-5">
                                        {analysis.evolvingThemes.map((theme, i) => <li key={i}>{theme}</li>)}
                                    </ul>
                                    <h4>Predicted Continuation</h4>
                                    <p>{analysis.predictedContinuation}</p>
                                </div>
                            ) : (
                                !isLoading && !error && <p className="text-purple-400 text-center pt-16">Click "Analyze" to generate an AI summary of this dream series.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DreamWeaveModal;