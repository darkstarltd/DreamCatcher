import React, { useContext, useMemo } from 'react';
import { DreamContext } from '../context/DreamContext';
import TagCloud from './TagCloud';
import MoodTrendChart from './MoodTrendChart';
import StreakCard from './StreakCard';
import { BookOpenIcon, CrystalBallIcon } from './icons';
import DailyQuestsWidget from './DailyQuestsWidget';
import { View, Dream } from '../types';
import DreamOfTheDay from './DreamOfTheDay';

interface DashboardProps {
    onSetView: (view: View) => void;
    onDreamSelect: (dream: Dream) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSetView, onDreamSelect }) => {
    const dreamContext = useContext(DreamContext);

    if (!dreamContext) return null;

    const { dreams, totems } = dreamContext;

    const allTags = useMemo(() => {
        const tagCounts: { [key: string]: number } = {};
        dreams.forEach(dream => {
            dream.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 30); // Limit to top 30 tags for performance
    }, [dreams]);

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            
            {/* New Dream of the Day Row */}
            <DreamOfTheDay onDreamSelect={onDreamSelect} />

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StreakCard />
                <div className="p-4 bg-black/20 rounded-xl border border-purple-500/10 flex flex-col items-center justify-center text-center">
                    <BookOpenIcon className="h-8 w-8 text-purple-300 mb-2"/>
                    <h3 className="font-semibold text-purple-200">Total Dreams</h3>
                    <p className="text-4xl font-bold text-white mt-1">{dreams.length}</p>
                </div>
                 <div className="p-4 bg-black/20 rounded-xl border border-purple-500/10 flex flex-col items-center justify-center text-center">
                    <CrystalBallIcon className="h-8 w-8 text-cyan-300 mb-2"/>
                    <h3 className="font-semibold text-purple-200">Totems Discovered</h3>
                    <p className="text-4xl font-bold text-white mt-1">{totems.length}</p>
                </div>
            </div>
            
            {/* Quests & Tags Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-1">
                    <DailyQuestsWidget onNavigate={() => onSetView('path')} />
                </div>
                 <div className="p-4 bg-black/20 rounded-xl border border-purple-500/10 col-span-1 lg:col-span-2 h-80">
                    <h3 className="font-semibold text-purple-200 mb-2">Frequent Tags</h3>
                    <TagCloud data={allTags} />
                </div>
            </div>

             {/* Trends Row */}
            <div className="p-4 bg-black/20 rounded-xl border border-purple-500/10 h-80">
                <h3 className="font-semibold text-purple-200 mb-2">Weekly Mood Trends (Last 90 Days)</h3>
                <MoodTrendChart dreams={dreams} />
            </div>
        </div>
    );
};

export default Dashboard;