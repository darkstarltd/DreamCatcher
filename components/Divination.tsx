import React, { useState, useContext } from 'react';
import { DreamContext } from '../context/DreamContext';
import { ModalContext } from '../context/ModalContext';
import { SavedOracleReading } from '../types';
import { EyeIcon, SparklesIcon, HistoryIcon } from './icons';
import OracleConsultation from './Oracle';

type DivinationView = 'oracle' | 'history';

const ReadingHistory: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const modalContext = useContext(ModalContext);

    if (!dreamContext || !modalContext) return null;
    const { savedReadings } = dreamContext;
    const { openModal } = modalContext;

    return (
        <div className="space-y-4">
            {savedReadings.length === 0 ? (
                <div className="text-center py-16 bg-black/30 rounded-lg border border-purple-500/20">
                    <HistoryIcon className="h-16 w-16 mx-auto text-purple-400 opacity-50" />
                    <h3 className="mt-4 text-xl font-semibold text-white">No Saved Readings</h3>
                    <p className="mt-2 text-purple-300">Your past consultations with the Oracle will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedReadings.map(reading => (
                        <button 
                            key={reading.id} 
                            onClick={() => openModal('readingDetail', { reading })}
                            className="p-4 bg-black/30 rounded-lg border border-purple-500/20 text-left hover:bg-purple-900/40 transition-colors"
                        >
                            <p className="text-sm text-purple-300">{reading.date}</p>
                            <p className="font-semibold text-white mt-1 truncate">Q: {reading.question}</p>
                            <div className="mt-2 pt-2 border-t border-purple-500/10">
                                <p className="text-xs text-purple-400">Card Drawn:</p>
                                <p className="font-medium text-purple-200">{reading.cardName} ({reading.cardType})</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Divination: React.FC = () => {
    const [view, setView] = useState<DivinationView>('oracle');

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center">
                <EyeIcon className="h-12 w-12 mx-auto text-purple-400" />
                <h2 className="text-3xl font-bold text-purple-300 mt-2">Divination</h2>
                <p className="text-purple-300 max-w-2xl mx-auto">Seek guidance from your subconscious or review past consultations.</p>
            </div>
            
            <div className="flex border-b border-purple-500/20">
                <button onClick={() => setView('oracle')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${view === 'oracle' ? 'border-b-2 border-purple-400 text-white' : 'text-purple-300 hover:text-white'}`}>
                    <SparklesIcon className="h-4 w-4" /> Oracle
                </button>
                <button onClick={() => setView('history')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${view === 'history' ? 'border-b-2 border-purple-400 text-white' : 'text-purple-300 hover:text-white'}`}>
                    <HistoryIcon className="h-4 w-4" /> History
                </button>
            </div>

            {view === 'oracle' && <OracleConsultation />}
            {view === 'history' && <ReadingHistory />}
        </div>
    );
};

export default Divination;