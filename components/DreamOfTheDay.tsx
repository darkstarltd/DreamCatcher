import React, { useState, useEffect, useContext } from 'react';
import { DreamContext } from '../context/DreamContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { selectDreamOfTheDay } from '../services/geminiService';
import { Dream } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon } from './icons';

interface DreamOfTheDayProps {
    onDreamSelect: (dream: Dream) => void;
}

interface StoredDreamOfTheDay {
    dreamId: string;
    insight: string;
    dreamTitle: string;
    dreamDate: string;
}

const getTodayKey = () => new Date().toISOString().split('T')[0];

const DreamOfTheDay: React.FC<DreamOfTheDayProps> = ({ onDreamSelect }) => {
    const dreamContext = useContext(DreamContext);
    const [storedData, setStoredData] = useLocalStorage<StoredDreamOfTheDay | null>(`dream-of-the-day-${getTodayKey()}`, null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!storedData && !isLoading && dreamContext && dreamContext.dreams.length > 3) {
            const generate = async () => {
                setIsLoading(true);
                try {
                    const recentDreams = dreamContext.dreams
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 7);

                    if (recentDreams.length < 3) {
                        setIsLoading(false);
                        return;
                    }
                    
                    const { dreamId, insight } = await selectDreamOfTheDay(recentDreams);
                    const selectedDream = dreamContext.dreams.find(d => d.id === dreamId);

                    if (selectedDream) {
                        setStoredData({
                            dreamId: selectedDream.id,
                            insight: insight,
                            dreamTitle: selectedDream.title,
                            dreamDate: selectedDream.date,
                        });
                    }
                } catch (error) {
                    console.error("Failed to generate Dream of the Day:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            generate();
        }
    }, [storedData, isLoading, dreamContext, setStoredData]);
    
    if (!dreamContext || dreamContext.dreams.length < 3) {
        return null; // Don't show the component if not enough dreams
    }

    if (isLoading) {
        return (
            <div className="p-6 bg-black/20 rounded-xl border border-purple-500/10 flex items-center justify-center text-center text-purple-300 gap-4">
                <LoadingSpinner />
                <span>Selecting your Dream of the Day...</span>
            </div>
        );
    }
    
    if (!storedData) {
         return (
             <div className="p-6 bg-black/20 rounded-xl border border-purple-500/10 text-center text-purple-400">
                <p>Record a few more dreams to unlock your daily AI insight.</p>
            </div>
         );
    }

    const handleViewDream = () => {
        const dream = dreamContext.dreams.find(d => d.id === storedData.dreamId);
        if (dream) {
            onDreamSelect(dream);
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-xl border border-purple-500/20 shadow-lg animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
                <SparklesIcon className="h-6 w-6 text-yellow-300" />
                <h3 className="text-xl font-bold text-white">Dream of the Day</h3>
            </div>
            <div className="pl-8">
                 <h4 className="font-semibold text-white text-lg">{storedData.dreamTitle}</h4>
                 <p className="text-xs text-purple-300 mb-2">{storedData.dreamDate}</p>
                 <blockquote className="italic text-purple-200 border-l-2 border-cyan-400/50 pl-3">
                    "{storedData.insight}"
                 </blockquote>
                 <button onClick={handleViewDream} className="mt-4 text-sm bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition-colors font-semibold">
                    View Dream
                 </button>
            </div>
        </div>
    );
};

export default DreamOfTheDay;
