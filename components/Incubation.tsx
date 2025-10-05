import React, { useState, useContext } from 'react';
import { DreamContext } from '../context/DreamContext.tsx';
import { ModalContext } from '../context/ModalContext.tsx';
import { Dream, IncubationSession } from '../types.ts';
import { SeedlingIcon, LinkIcon } from './icons/index.tsx';

interface IncubationProps {
    onDreamSelect: (dream: Dream) => void;
}

const Incubation: React.FC<IncubationProps> = ({ onDreamSelect }) => {
    const dreamContext = useContext(DreamContext);
    const modalContext = useContext(ModalContext);

    if (!dreamContext || !modalContext) return null;
    const { incubationSessions, dreams } = dreamContext;
    const { openModal } = modalContext;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-purple-300">Dream Incubation</h2>
                <button
                    onClick={() => openModal('incubationSetup')}
                    className="flex items-center gap-2 text-sm text-purple-300 hover:text-white bg-purple-800/50 hover:bg-purple-800/80 px-4 py-2 rounded-md transition-colors"
                >
                    <SeedlingIcon className="h-5 w-5" />
                    Start New Session
                </button>
            </div>
            
            <p className="text-purple-300">Set an intention for your dreams. The AI will guide you through a pre-sleep meditation to help you dream about a specific topic, solve a problem, or achieve lucidity.</p>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-200 border-b border-purple-500/20 pb-2">Session History</h3>
                {incubationSessions.length === 0 ? (
                    <div className="text-center py-16 bg-black/30 rounded-lg border border-purple-500/20">
                        <SeedlingIcon className="h-16 w-16 mx-auto text-purple-400 opacity-50" />
                        <h3 className="mt-4 text-xl font-semibold text-white">No Incubation Sessions Yet</h3>
                        <p className="mt-2 text-purple-300">Start a new session to plant a seed in your subconscious.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {incubationSessions.map(session => {
                            const relatedDream = session.relatedDreamId ? dreams.find(d => d.id === session.relatedDreamId) : null;
                            return (
                                <div key={session.id} className="p-4 bg-black/30 rounded-lg border border-purple-500/20">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-purple-400">{session.date}</p>
                                            <p className="font-bold text-lg text-white">Intention: "{session.intention}"</p>
                                        </div>
                                        {session.isComplete && !relatedDream && (
                                            <button className="text-xs text-purple-300 hover:text-white">Link Dream</button>
                                        )}
                                    </div>
                                    {relatedDream && (
                                        <div className="mt-2 pt-2 border-t border-purple-500/10">
                                            <p className="text-xs font-semibold text-purple-400 mb-1">Resulting Dream:</p>
                                            <button 
                                                onClick={() => onDreamSelect(relatedDream)}
                                                className="flex items-center gap-1.5 text-sm bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 px-2 py-1 rounded-full transition-colors"
                                            >
                                                <LinkIcon className="h-3 w-3" />
                                                {relatedDream.title}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Incubation;