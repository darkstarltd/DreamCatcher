import React, { useContext } from 'react';
import { DreamContext } from '../context/DreamContext';
import { FireIcon } from './icons';

const StreakCard: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    if (!dreamContext) return null;
    
    const { currentStreak, longestStreak } = dreamContext;

    const getFlameSize = () => {
        if (currentStreak >= 30) return 'h-12 w-12';
        if (currentStreak >= 14) return 'h-10 w-10';
        if (currentStreak >= 7) return 'h-8 w-8';
        if (currentStreak > 0) return 'h-7 w-7';
        return 'h-6 w-6';
    }

    const getFlameColor = () => {
        if (currentStreak >= 30) return 'text-red-500';
        if (currentStreak >= 7) return 'text-orange-500';
        if (currentStreak > 0) return 'text-yellow-500';
        return 'text-gray-600';
    }

    return (
        <div className="p-4 bg-black/20 rounded-xl border border-purple-500/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <FireIcon className={`transition-all duration-500 ${getFlameSize()} ${getFlameColor()} ${currentStreak > 0 ? 'drop-shadow-[0_0_10px_currentColor]' : ''}`} />
                <div>
                    <h3 className="font-semibold text-purple-200">Current Streak</h3>
                    <p className="text-4xl font-bold text-white">{currentStreak} Day{currentStreak !== 1 && 's'}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs text-purple-300">Longest</p>
                <p className="font-bold text-lg text-white">{longestStreak}</p>
            </div>
        </div>
    );
};

export default StreakCard;
