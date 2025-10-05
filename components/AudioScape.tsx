import React, { useState, useContext, useMemo } from 'react';
import { DreamContext } from '../context/DreamContext';
import { Dream, AudioScapeParams } from '../types';
import { getAudioScapeParams } from '../utils/audio';
import AudioScapePlayer from './AudioScapePlayer';
import { AudioWaveIcon } from './icons';
import DreamCard from './DreamCard';

interface AudioScapeProps {
    onDreamSelect: (dream: Dream) => void;
}

const AudioScape: React.FC<AudioScapeProps> = ({ onDreamSelect }) => {
    const dreamContext = useContext(DreamContext);
    const [selectedDream, setSelectedDream] = useState<Dream | null>(null);

    const audioParams = useMemo(() => {
        if (!selectedDream) return null;
        return getAudioScapeParams(selectedDream.mood, selectedDream.tags);
    }, [selectedDream]);

    if (!dreamContext) return null;
    const { dreams } = dreamContext;

    return (
        <div className="flex h-full gap-4 animate-fade-in">
            <div className="w-1/3 flex-shrink-0 h-full bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-purple-500/10 shadow-xl flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-4">Select a Dream</h2>
                <div className="space-y-3 overflow-y-auto pr-2 -mr-2 flex-grow">
                    {dreams.map(dream => (
                        <DreamCard 
                            key={dream.id}
                            dream={dream}
                            isSelected={selectedDream?.id === dream.id}
                            onClick={() => setSelectedDream(dream)}
                        />
                    ))}
                </div>
            </div>

            <div className="flex-1 h-full bg-black/20 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/10 shadow-2xl flex flex-col justify-center text-center">
                {selectedDream && audioParams ? (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">{selectedDream.title}</h2>
                        <p className="text-purple-300 max-w-xl mx-auto">{selectedDream.summary}</p>
                        <div className="max-w-md mx-auto">
                           <AudioScapePlayer params={audioParams} />
                        </div>
                        <button onClick={() => onDreamSelect(selectedDream)} className="text-sm text-purple-300 hover:text-white transition-colors">
                            View Full Dream Details
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AudioWaveIcon className="h-16 w-16 mx-auto text-purple-500/30" />
                        <h2 className="text-3xl font-bold text-white">AudioScape</h2>
                        <p className="text-purple-300 max-w-md mx-auto">
                           Select a dream from your archive to generate a procedural, ambient soundscape based on its mood and themes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioScape;
