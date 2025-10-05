import React from 'react';
import { Achievement } from '../types';

interface AchievementCardProps {
    achievement: Achievement;
    unlockedDate: string | null;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, unlockedDate }) => {
    const isUnlocked = !!unlockedDate;
    const Icon = achievement.icon;

    return (
        <div className={`p-4 rounded-lg border flex flex-col items-center text-center transition-all duration-300 ${isUnlocked ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-black/20 border-purple-500/10'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${isUnlocked ? 'bg-yellow-500/20' : 'bg-gray-800/50'}`}>
                <Icon className={`h-8 w-8 transition-colors ${isUnlocked ? 'text-yellow-300' : 'text-purple-300/50'}`} />
            </div>
            <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>{achievement.name}</h3>
            <p className="text-xs flex-grow mt-1">{isUnlocked ? achievement.description : '???'}</p>
            {isUnlocked && (
                <p className="text-xs text-yellow-400/80 mt-2">
                    Unlocked: {new Date(unlockedDate).toLocaleDateString()}
                </p>
            )}
        </div>
    );
};

export default AchievementCard;
