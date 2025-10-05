import React, { useState, useContext } from 'react';
import { DreamContext } from '../context/DreamContext';
import { ModalContext } from '../context/ModalContext';
import { Dream, SleepSession } from '../types';
import { MoonSoundIcon } from './icons';

interface SomniloquyProps {
    onDreamSelect: (dream: Dream) => void;
}

const Somniloquy: React.FC<SomniloquyProps> = ({ onDreamSelect }) => {
    const dreamContext = useContext(DreamContext);
    const modalContext = useContext(ModalContext);

    if (!dreamContext || !modalContext) return null;
    const { sleepSessions } = dreamContext;
    const { openModal } = modalContext;

    const formatDuration = (start: number, end: number) => {
        const durationMs = end - start;
        const hours = Math.floor(durationMs / 3600000);
        const minutes = Math.floor((durationMs % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
             <div className="text-center">
                <MoonSoundIcon className="h-12 w-12 mx-auto text-purple-400" />
                <h2 className="text-3xl font-bold text-purple-300 mt-2">Somniloquy</h2>
                <p className="text-purple-300 max-w-2xl mx-auto">Capture the sounds of your subconscious. The AI listens for sleep talk and other noises, recording short fragments for you to analyze and turn into dream entries.</p>
            </div>

             <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg text-center">
                <h3 className="text-xl font-semibold text-purple-200">Start a New Sleep Session</h3>
                <p className="text-purple-400 mt-1 mb-4">Your microphone will be used to detect and record sound fragments.</p>
                <button
                    onClick={() => openModal('sleepSession')}
                    className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors"
                >
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-1"></div>
                    Start Recording
                </button>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-200 border-b border-purple-500/20 pb-2">Past Sessions</h3>
                {sleepSessions.length === 0 ? (
                     <div className="text-center py-16 bg-black/30 rounded-lg border border-purple-500/20">
                        <h3 className="mt-4 text-xl font-semibold text-white">No Sleep Sessions Recorded</h3>
                        <p className="mt-2 text-purple-300">Start a session to begin capturing audio fragments.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sleepSessions.map(session => (
                            <button 
                                key={session.id}
                                onClick={() => openModal('sessionDetail', { session })}
                                className="w-full text-left p-4 bg-black/30 rounded-lg border border-purple-500/20 hover:bg-purple-900/40 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-lg text-white">
                                        Session from {new Date(session.startTime).toLocaleDateString()}
                                    </p>
                                    <span className="text-sm text-purple-300">{formatDuration(session.startTime, session.endTime)}</span>
                                </div>
                                <p className="text-sm text-purple-400 mt-1">
                                    Captured {session.fragments.length} audio {session.fragments.length === 1 ? 'fragment' : 'fragments'}.
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Somniloquy;