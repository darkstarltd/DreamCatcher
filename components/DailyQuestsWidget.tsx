import React, { useContext } from 'react';
import { DreamContext } from '../context/DreamContext';
import { QUEST_POOL } from '../utils/quests';
import { CheckBadgeIcon, CheckIcon } from './icons';

interface DailyQuestsWidgetProps {
    onNavigate: () => void;
}

const DailyQuestsWidget: React.FC<DailyQuestsWidgetProps> = ({ onNavigate }) => {
    const dreamContext = useContext(DreamContext);

    if (!dreamContext) return null;
    const { dailyQuests } = dreamContext;

    const questsWithDetails = dailyQuests.map(storedQuest => {
        const details = QUEST_POOL.find(q => q.id === storedQuest.id);
        return { ...details, ...storedQuest };
    }).filter(q => q.id && q.title);

    return (
        <div className="p-4 bg-black/20 rounded-xl border border-purple-500/10 h-80 flex flex-col">
            <div className="flex justify-between items-center mb-3 flex-shrink-0">
                <h3 className="font-semibold text-purple-200 flex items-center gap-2"><CheckBadgeIcon className="h-5 w-5" /> Today's Quests</h3>
                <button onClick={onNavigate} className="text-xs text-purple-300 hover:text-white transition-colors">View Path &rarr;</button>
            </div>
            <div className="space-y-3 overflow-y-auto pr-2 -mr-2 flex-grow">
                {questsWithDetails.map(quest => (
                    <div key={quest.id} className={`p-3 rounded-lg border flex items-center gap-3 transition-all duration-300 ${quest.status === 'completed' ? 'bg-green-500/10 border-green-500/20 opacity-80' : 'bg-black/20 border-purple-500/10'}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${quest.status === 'completed' ? 'bg-green-600' : 'bg-purple-600'}`}>
                            {quest.status === 'completed' ? <CheckIcon className="h-5 w-5" /> : <span className="text-sm">?</span>}
                        </div>
                        <div className="flex-grow">
                            <h4 className={`font-bold text-sm ${quest.status === 'completed' ? 'text-gray-400 line-through' : 'text-white'}`}>{quest.title}</h4>
                            <p className="text-xs text-purple-300 line-clamp-1">{quest.description}</p>
                        </div>
                        <div className="flex-shrink-0 text-xs font-bold text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded-md">
                            +{quest.xp} XP
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyQuestsWidget;
