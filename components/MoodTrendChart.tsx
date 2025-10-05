
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Dream } from '../types';
import { MOODS } from '../constants';

interface MoodTrendChartProps {
    dreams: Dream[];
}

const getWeekStartDate = (date: Date): Date => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Normalize to midnight
    const day = d.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
};

const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ dreams }) => {
    const data = React.useMemo(() => {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const recentDreams = dreams.filter(d => new Date(d.date) >= ninetyDaysAgo);
        const weeklyMoodCounts = new Map<string, { [key: string]: number }>();

        // Initialize weekly buckets for the last ~13 weeks to ensure they exist even if empty
        for (let i = 12; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i * 7);
            const weekStart = getWeekStartDate(date);
            const weekKey = formatDateKey(weekStart);

            if (!weeklyMoodCounts.has(weekKey)) {
                const initialCounts = MOODS.reduce((acc, mood) => {
                    acc[mood.label] = 0;
                    return acc;
                }, {} as { [key: string]: number });
                weeklyMoodCounts.set(weekKey, initialCounts);
            }
        }
        
        recentDreams.forEach(dream => {
            const dreamDate = new Date(dream.date);
            const weekStart = getWeekStartDate(dreamDate);
            const weekKey = formatDateKey(weekStart);

            if (weeklyMoodCounts.has(weekKey)) {
                const counts = weeklyMoodCounts.get(weekKey)!;
                counts[dream.mood] = (counts[dream.mood] || 0) + 1;
            }
            // In case a dream is just over 90 days but its week start is in range
            else {
                 const initialCounts = MOODS.reduce((acc, mood) => ({...acc, [mood.label]: 0}), {} as { [key: string]: number });
                 initialCounts[dream.mood] = 1;
                 weeklyMoodCounts.set(weekKey, initialCounts);
            }
        });

        const sortedEntries = Array.from(weeklyMoodCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        
        const finalChartData = sortedEntries.map(([dateKey, counts]) => {
            // dateKey is 'YYYY-MM-DD'. Need to parse it carefully to avoid timezone issues.
            const [year, month, day] = dateKey.split('-').map(Number);
            const d = new Date(year, month - 1, day);
            const name = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return {
                name,
                ...counts,
            };
        });
        
        return finalChartData;
    }, [dreams]);

    if (dreams.length < 5) {
        return <div className="flex items-center justify-center h-full text-purple-400">Record at least 5 dreams to see trends.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
                <defs>
                    {MOODS.map(mood => (
                        <linearGradient key={mood.label} id={`color${mood.label.replace(' ', '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={mood.color} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={mood.color} stopOpacity={0}/>
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                        borderRadius: '0.5rem',
                    }}
                    cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}}/>
                {MOODS.map(mood => (
                    <Area
                        key={mood.label}
                        type="monotone"
                        dataKey={mood.label}
                        stroke={mood.color}
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill={`url(#color${mood.label.replace(' ', '')})`}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default MoodTrendChart;
