import React, { useContext, useMemo } from 'react';
import { DreamContext } from '../context/DreamContext';
import { AuthContext } from '../context/AuthContext';
import { calculateLevel, getDreamerTitle, ACHIEVEMENTS } from '../utils/gamification';
import { QUEST_POOL } from '../utils/quests';
import { TrophyIcon, CheckBadgeIcon, CheckIcon } from './icons';
import AchievementCard from './AchievementCard';

const Path: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const authContext = useContext(AuthContext);

    if (!dreamContext || !authContext) return null;

    const { userXP, unlockedAchievements, dailyQuests } = dreamContext;
    const { currentUser } = authContext;

    const { level, progress, currentLevelXP, nextLevelXP } = calculateLevel(userXP);
    const title = getDreamerTitle(level);

    const questsWithDetails = useMemo(() => {
        return dailyQuests.map(storedQuest => {
            const details = QUEST_POOL.find(q => q.id === storedQuest.id);
            return { ...details, ...storedQuest };
        }).filter(q => q.title); // Filter out any quests not found in the pool
    }, [dailyQuests]);

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            <div className="text-center">
                <TrophyIcon className="h-12 w-12 mx-auto text-purple-400" />
                <h2 className="text-3xl font-bold text-purple-300 mt-2">Dreamer's Path</h2>
                <p className="text-purple-300 max-w-2xl mx-auto">Track your progress, unlock achievements, and watch your journey unfold.</p>
            </div>
            
            <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <p className="text-purple-300 text-sm">Welcome back,</p>
                        <h3 className="text-2xl font-bold text-white">{currentUser?.username}</h3>
                        <p className="font-semibold text-yellow-300">{title}</p>
                    </div>
                    <div className="w-full sm:w-1/2">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-lg font-bold text-white">Level {level}</span>
                            <span className="text-xs text-purple-300">{userXP} / {nextLevelXP} XP</span>
                        </div>
                        <div className="w-full bg-black/50 rounded-full h-4 border border-purple-500/20">
                            <div 
                                className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Quests */}
            <div>
                <h3 className="text-xl font-semibold text-purple-200 mb-4 flex items-center gap-2"><CheckBadgeIcon /> Today's Quests</h3>
                <div className="space-y-3">
                    {questsWithDetails.map(quest => (
                        <div key={quest.id} className={`p-4 rounded-lg border flex items-center gap-4 transition-all duration-300 ${quest.status === 'completed' ? 'bg-green-500/10 border-green-500/20 opacity-70' : 'bg-black/20 border-purple-500/10'}`}>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${quest.status === 'completed' ? 'bg-green-600' : 'bg-purple-600'}`}>
                                {quest.status === 'completed' ? <CheckIcon className="h-6 w-6" /> : <span className="text-sm">?</span>}
                            </div>
                            <div className="flex-grow">
                                <h4 className={`font-bold ${quest.status === 'completed' ? 'text-gray-400 line-through' : 'text-white'}`}>{quest.title}</h4>
                                <p className="text-xs text-purple-300">{quest.description}</p>
                            </div>
                            <div className="flex-shrink-0 text-sm font-bold text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded-md">
                                +{quest.xp} XP
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-purple-200 mb-4">Achievements</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {ACHIEVEMENTS.map(ach => (
                        <AchievementCard
                            key={ach.id}
                            achievement={ach}
                            unlockedDate={unlockedAchievements[ach.id] || null}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Path;