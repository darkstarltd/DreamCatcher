import React, { useState, useContext, useMemo } from 'react';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { OracleReading } from '../types';
import { getOracleReading } from '../services/geminiService';
import { EyeIcon, SparklesIcon, CheckIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

const OracleConsultation: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);

    const [question, setQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [reading, setReading] = useState<OracleReading | null>(null);
    const [cardImage, setCardImage] = useState<string | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);

    if (!dreamContext || !toastContext) return null;
    const { dreams, totems, addSavedReading } = dreamContext;
    const { addToast } = toastContext;

    const recentDreams = useMemo(() => {
        return [...dreams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    }, [dreams]);

    const handleConsult = async () => {
        if (!question.trim()) {
            addToast("Please ask a question to the Oracle.", "info");
            return;
        }
        setIsLoading(true);
        setReading(null);
        setCardImage(null);
        setIsFlipped(false);
        setHasBeenSaved(false);

        try {
            const result = await getOracleReading(question, recentDreams, totems);
            setReading(result);

            if (result.cardType === 'Dream') {
                const dream = dreams.find(d => d.title === result.cardName);
                setCardImage(dream?.imageUrl || null);
            } else {
                const totem = totems.find(t => t.name === result.cardName);
                setCardImage(totem?.imageUrl || null);
            }

            setTimeout(() => setIsFlipped(true), 500);
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'The Oracle is silent. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveReading = () => {
        if (reading && question && !hasBeenSaved) {
            addSavedReading({ question, ...reading });
            setHasBeenSaved(true);
            addToast("Oracle reading saved to your history.", "success");
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg space-y-3">
                <label htmlFor="oracle-question" className="block text-lg font-medium text-purple-200">Your Question</label>
                <textarea
                    id="oracle-question"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    rows={2}
                    className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="e.g., What should I focus on in my creative work?"
                />
                <button
                    onClick={handleConsult}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:bg-gray-600"
                >
                    {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
                    {isLoading ? 'Consulting...' : 'Consult the Oracle'}
                </button>
            </div>

            <div className="flex justify-center items-start min-h-[32rem]">
                {isLoading && !reading ? (
                    <div className="text-center text-purple-300 pt-16">
                        <p>Shuffling the cards of your subconscious...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-full max-w-sm h-[28rem] [perspective:1000px]">
                            <div className={`relative w-full h-full flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                                <div className="flip-card-front absolute w-full h-full bg-black/30 border-2 border-purple-500/50 p-6 flex flex-col items-center justify-center text-center shadow-2xl shadow-purple-500/20">
                                    <EyeIcon className="h-16 w-16 text-purple-300 animate-pulse" />
                                </div>
                                <div className="flip-card-back absolute w-full h-full bg-gray-900 border-2 border-purple-300 p-4 flex flex-col overflow-hidden shadow-2xl shadow-purple-500/20">
                                    {reading && (
                                        <>
                                            <div className="flex-shrink-0">
                                                {cardImage ? (
                                                    <img src={cardImage} alt={reading.cardName} className="w-full h-32 object-cover rounded-t-md mb-2" />
                                                ): <div className="w-full h-32 bg-black/20 rounded-t-md mb-2"></div>}
                                                <p className="text-xs text-purple-300 uppercase tracking-widest">{reading.cardType}</p>
                                                <h3 className="text-xl font-bold text-white">{reading.cardName}</h3>
                                            </div>
                                            <div className="mt-3 space-y-3 text-sm text-gray-300 overflow-y-auto pr-2 flex-grow">
                                                <div><h4 className="font-semibold text-purple-300">Upright:</h4><p>{reading.upright}</p></div>
                                                <div><h4 className="font-semibold text-purple-300">Reversed:</h4><p>{reading.reversed}</p></div>
                                                <div className="p-2 bg-yellow-500/10 border-l-4 border-yellow-500/50"><h4 className="font-semibold text-yellow-200">Guidance:</h4><p className="text-yellow-300">{reading.guidance}</p></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        {isFlipped && (
                            <button onClick={handleSaveReading} disabled={hasBeenSaved} className="flex items-center justify-center gap-2 py-2 px-4 bg-green-800/50 hover:bg-green-800/80 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {hasBeenSaved ? <><CheckIcon className="h-5 w-5" /> Saved</> : 'Save Reading'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OracleConsultation;
