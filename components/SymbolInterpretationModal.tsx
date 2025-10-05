import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { ExternalLinkIcon } from './icons';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { ModalContext } from '../context/ModalContext';
import { interpretSymbol } from '../services/geminiService';

const SymbolInterpretationModal: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const modalContext = useContext(ModalContext);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<{ interpretation: string; sources: { uri: string; title: string }[] } | null>(null);

    if (!dreamContext || !toastContext || !modalContext) return null;

    const { modalState, closeModal } = modalContext;
    const { isOpen, symbol, dream } = modalState.symbolInterpretation;
    const onClose = () => closeModal('symbolInterpretation');
    const { triggerAction } = dreamContext;

    useEffect(() => {
        if (isOpen && symbol && dream) {
            const fetchInterpretation = async () => {
                setIsLoading(true);
                setError(null);
                setData(null);
                try {
                    const result = await interpretSymbol(symbol, dream);
                    setData(result);
                    triggerAction('INTERPRET_SYMBOL');
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to get interpretation.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInterpretation();
        }
    }, [isOpen, symbol, dream, triggerAction]);
    
    if (!isOpen) return null;

    const handleSaveToLexicon = () => {
        if (!symbol || !data) return;
        
        const { addSymbolToLexicon, selectedDream } = dreamContext;
        const { addToast } = toastContext;

        addSymbolToLexicon({
            symbol: symbol,
            interpretation: data.interpretation,
            dreamIds: selectedDream ? [selectedDream.id] : [],
        });

        addToast(`"${symbol}" saved to your personal lexicon!`, 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-2xl p-8 space-y-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-purple-300">Interpreting: <span className="text-white">{symbol}</span></h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center p-8">
                            <LoadingSpinner />
                            <p className="mt-4 text-purple-300">Consulting the dream oracle...</p>
                        </div>
                    )}
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">
                            <p className="font-bold">Interpretation Failed</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {data && (
                        <div className="prose prose-invert max-w-none prose-p:text-gray-300 space-y-4">
                            <p>{data.interpretation}</p>

                            {data.sources && data.sources.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-purple-300">Sources:</h4>
                                    <ul className="list-none p-0 space-y-2">
                                        {data.sources.map((source, index) => (
                                            <li key={index} className="not-prose">
                                                <a
                                                    href={source.uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-200 transition-colors"
                                                >
                                                    <ExternalLinkIcon />
                                                    <span className="truncate">{source.title}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end gap-4 pt-4">
                     <button onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Close</button>
                    {data && !isLoading && !error && (
                         <button onClick={handleSaveToLexicon} className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors">Save to Lexicon</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SymbolInterpretationModal;