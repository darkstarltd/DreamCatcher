import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MOODS } from '../constants';

interface MoodData {
    name: string;
    value: number;
    emoji: string;
}

interface MoodChartProps {
    data: MoodData[];
}

const moodColorMap = MOODS.reduce((acc, mood) => {
    acc[mood.label] = mood.color;
    return acc;
}, {} as Record<string, string>);

const emojiMap = MOODS.reduce((acc, mood) => {
    acc[mood.label] = mood.emoji;
    return acc;
}, {} as Record<string, string>);

interface CustomTooltipProps {
    active?: boolean;
    payload?: {
        payload: MoodData & { total: number };
    }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const { name, value, emoji, total } = payload[0].payload;
      const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
      return (
        <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-500/30 p-3 rounded-lg shadow-lg text-white">
          <p className="font-bold text-purple-300">{`${emojiMap[name] || emoji} ${name}`}</p>
          <p>{`Count: ${value} (${percent}%)`}</p>
        </div>
      );
    }
    return null;
};

const MoodChart: React.FC<MoodChartProps> = ({ data }) => {
    const totalDreamsWithMood = data.reduce((sum, entry) => sum + entry.value, 0);
    const chartData = data.map(d => ({ ...d, total: totalDreamsWithMood }));

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-purple-400">No mood data recorded yet.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                >
                    {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={moodColorMap[entry.name] || '#8884d8'} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" formatter={(value) => <span className="text-gray-300 text-sm">{emojiMap[value]} {value}</span>}/>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default MoodChart;