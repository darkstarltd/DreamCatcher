import React, { useState, useContext, useMemo } from 'react';
import { DreamContext } from '../context/DreamContext';
import { ModalContext } from '../context/ModalContext';
import { ToastContext } from '../context/ToastContext';
import { Dream, DreamComparisonReport } from '../types';
import { compareTwoDreams } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { XIcon, SparklesIcon, CompareIcon } from './icons';

const DreamComparisonModal: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const modalContext = useContext(ModalContext);
    const toastContext = useContext(ToastContext);

    const [secondDream, setSecondDream] = useState<Dream | null>(null);
    const [analysis, setAnalysis] = useState<DreamComparisonReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    if (!modalContext || !dreamContext || !toastContext) return null;

    const { modalState, closeModal } = modalContext;
    const { isOpen, dream: firstDream } = modalState.dreamComparison;
    const { dreams } = dreamContext;
    const { addToast } = toastContext;

    const onClose = () => {
        setSecondDream(null);
        setAnalysis(null);
        setIsLoading(false);
        setSearchTerm('');
        closeModal('dreamComparison');
    };

    const filteredDreams = useMemo(() => {
        return dreams
            .filter(d => d.id !== firstDream?.id)
            .filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [dreams, firstDream, searchTerm]);

    const handleCompare = async () => {
        if (!firstDream || !secondDream) return;
        setIsLoading(true);
        setAnalysis(null);
        try {
            const result = await compareTwoDreams(firstDream, secondDream);
            setAnalysis(result);
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to compare dreams.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !firstDream) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-4xl max-h-[90vh] p-8 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-3xl font-bold text-purple-300 flex items-center gap-3">
                        <CompareIcon className="h-8 w-8" />
                        Compare Dreams
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon /></button>
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
                    {/* Column 1: First Dream & Selection List */}
                    <div className="flex flex-col gap-4">
                        <div className="p-4 bg-black/20 rounded-lg border border-purple-500/20">
                            <p className="text-xs text-purple-300">DREAM A</p>
                            <h3 className="font-bold text-white truncate">{firstDream.title}</h3>
                            <p className="text-sm text-gray-400">{firstDream.date}</p>
                        </div>
                        <div className="flex-grow flex flex-col p-4 bg-black/20 rounded-lg border border-purple-500/20">
                            <p className="text-purple-200 mb-2">Compare with (Dream B):</p>
                            <input
                                type="text"
                                placeholder="Search for a dream..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white mb-2"
                            />
                            <div className="flex-grow overflow-y-auto space-y-2">
                                {filteredDreams.map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => setSecondDream(d)}
                                        className={`w-full text-left p-2 rounded-md transition-colors border-2 ${secondDream?.id === d.id ? 'bg-purple-500/30 border-purple-400' : 'bg-gray-800/50 border-transparent hover:border-purple-500/50'}`}
                                    >
                                        <p className="font-semibold text-white truncate">{d.title}</p>
                                        <p className="text-xs text-purple-300">{d.date}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Second Dream & Analysis */}
                    <div className="flex flex-col gap-4">
                        <div className={`p-4 rounded-lg border h-[98px] transition-colors ${secondDream ? 'bg-black/20 border-purple-500/20' : 'bg-transparent border-dashed border-gray-600 flex items-center justify-center'}`}>
                            {secondDream ? (
                                <>
                                    <p className="text-xs text-purple-300">DREAM B</p>
                                    <h3 className="font-bold text-white truncate">{secondDream.title}</h3>
                                    <p className="text-sm text-gray-400">{secondDream.date}</p>
                                </>
                            ) : (
                                <p className="text-gray-500">Select a dream to compare</p>
                            )}
                        </div>
                        <div className="flex-grow p-4 bg-black/20 rounded-lg border border-purple-500/20 overflow-y-auto">
                            <h3 className="text-lg font-semibold text-purple-200 mb-2">AI Analysis</h3>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
                            ) : analysis ? (
                                <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-purple-300 space-y-4 animate-fade-in">
                                    <h4>Overall Synthesis</h4>
                                    <p>{analysis.overallSynthesis}</p>
                                    <h4>Shared Symbols & Themes</h4>
                                    <ul className="list-disc pl-5 text-sm">
                                        {analysis.sharedSymbols.length > 0 ? analysis.sharedSymbols.map((s, i) => <li key={i}>{s}</li>) : <li>None identified.</li>}
                                    </ul>
                                    <h4>Contrasting Themes</h4>
                                    <p><strong>Dream A:</strong> {analysis.contrastingThemes.dreamA}</p>
                                    <p><strong>Dream B:</strong> {analysis.contrastingThemes.dreamB}</p>
                                    <h4 className="!text-yellow-300">Possible Narrative Connection</h4>
                                    <p className="!text-yellow-300/90">{analysis.narrativeConnection}</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-purple-400 text-center">Select a second dream and click "Compare" to see the analysis.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-purple-500/10">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Close</button>
                    <button onClick={handleCompare} disabled={!secondDream || isLoading} className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors flex items-center gap-2 disabled:opacity-50">
                        {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
                        Compare
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DreamComparisonModal;