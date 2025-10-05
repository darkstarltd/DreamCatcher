import React, { useState, useMemo, useContext } from 'react';
import { DreamContext } from '../context/DreamContext';
import { Dream } from '../types';
import { MOODS } from '../constants';

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);
const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

interface CalendarProps {
    onDreamSelect: (dream: Dream) => void;
}

interface DayPopoverState {
    x: number;
    y: number;
    dreams: Dream[];
}

const Calendar: React.FC<CalendarProps> = ({ onDreamSelect }) => {
    const dreamContext = useContext(DreamContext);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dayPopover, setDayPopover] = useState<DayPopoverState | null>(null);

    if (!dreamContext) return null;

    const { dreams } = dreamContext;

    const dreamsByDate = useMemo(() => {
        const map = new Map<string, Dream[]>();
        dreams.forEach(dream => {
            const dateKey = dream.date;
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(dream);
        });
        return map;
    }, [dreams]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setDayPopover(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setDayPopover(null);
    };

    const handleDayClick = (event: React.MouseEvent, dreamsForDay: Dream[]) => {
        if (dreamsForDay.length === 0) return;
        event.stopPropagation();
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setDayPopover({ x: rect.left, y: rect.bottom + 5, dreams: dreamsForDay });
    };
    
    const handleDreamClick = (dream: Dream) => {
        onDreamSelect(dream);
        setDayPopover(null);
    };

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`pad-start-${i}`} className="border border-transparent"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dreamsForDay = dreamsByDate.get(dateKey) || [];
            const isToday = new Date().toDateString() === date.toDateString();
            
            const moodColor = dreamsForDay.length > 0
                ? MOODS.find(m => m.label === dreamsForDay[0].mood)?.color || '#a855f7'
                : '#a855f7';

            days.push(
                <button
                    key={day}
                    onClick={(e) => handleDayClick(e, dreamsForDay)}
                    disabled={dreamsForDay.length === 0}
                    aria-label={`${dreamsForDay.length} dreams on ${date.toLocaleDateString()}`}
                    className={`p-2 h-24 flex flex-col justify-between text-left rounded-lg transition-colors duration-200 border ${
                        dreamsForDay.length > 0 ? 'bg-black/20 border-purple-500/20 cursor-pointer hover:bg-purple-500/10 hover:border-purple-500/40' : 'border-transparent text-gray-500 cursor-default'
                    }`}
                >
                    <span className={`font-semibold ${isToday ? 'text-cyan-400' : 'text-white'}`}>{day}</span>
                    {dreamsForDay.length > 0 && (
                         <div className="flex flex-col items-end">
                            <span style={{backgroundColor: moodColor}} className="h-2 w-2 rounded-full mb-1"></span>
                            <span className="text-xs text-purple-300">{dreamsForDay.length} dream{dreamsForDay.length > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </button>
            );
        }
        
        const totalCells = days.length;
        const remainingCells = (7 - (totalCells % 7)) % 7;
        for (let i = 0; i < remainingCells; i++) {
            days.push(<div key={`pad-end-${i}`} className="border border-transparent"></div>);
        }
        
        return days;
    };
    
    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto h-full flex flex-col" onClick={() => setDayPopover(null)}>
             {dayPopover && (
                <div 
                    className="fixed z-50 bg-gray-900/80 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-2xl p-2 w-64 animate-fade-in"
                    style={{ top: dayPopover.y, left: dayPopover.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ul className="space-y-1">
                        {dayPopover.dreams.map(dream => (
                            <li key={dream.id}>
                                <button onClick={() => handleDreamClick(dream)} className="w-full text-left p-2 rounded hover:bg-purple-500/20 text-sm text-white truncate">
                                    {dream.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="flex justify-between items-center px-2">
                <h2 className="text-3xl font-bold text-white">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-purple-500/10 text-purple-200 hover:text-white" aria-label="Previous month"><ChevronLeftIcon /></button>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-purple-500/10 text-purple-200 hover:text-white" aria-label="Next month"><ChevronRightIcon /></button>
                </div>
            </div>
            
            <div className="flex-grow bg-black/30 backdrop-blur-sm p-4 rounded-2xl border border-purple-500/10 shadow-xl flex flex-col">
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-purple-300 font-bold mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 flex-grow">
                    {renderCalendarGrid()}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
