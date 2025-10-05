import React, { useState, useMemo, useContext } from 'react';
import { Dream } from '../types';
import DreamCard from './DreamCard';
import { FilterIcon, PlusIcon } from './icons';
import { MOODS } from '../constants';
import { ModalContext } from '../context/ModalContext';

interface DreamListProps {
    dreams: Dream[];
    selectedDream: Dream | null;
    onSelectDream: (dream: Dream) => void;
}

const DreamList: React.FC<DreamListProps> = ({ dreams, selectedDream, onSelectDream }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [showRecurringOnly, setShowRecurringOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const modalContext = useContext(ModalContext);


    const filteredDreams = useMemo(() => {
        return dreams.filter(dream => {
            const lowercasedFilter = searchTerm.toLowerCase();
            const textMatch = !searchTerm ||
                dream.title.toLowerCase().includes(lowercasedFilter) ||
                dream.description.toLowerCase().includes(lowercasedFilter) ||
                (dream.tags && dream.tags.some(tag => tag.toLowerCase().includes(lowercasedFilter)));

            const moodMatch = !selectedMood || dream.mood === selectedMood;

            const recurringMatch = !showRecurringOnly || !!dream.isRecurring;
            
            // Use direct string comparison for YYYY-MM-DD to avoid timezone issues.
            const dateMatch = (!startDate || dream.date >= startDate) && (!endDate || dream.date <= endDate);

            return textMatch && moodMatch && recurringMatch && dateMatch;
        });
    }, [dreams, searchTerm, selectedMood, showRecurringOnly, startDate, endDate]);
    
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedMood(null);
        setShowRecurringOnly(false);
        setStartDate('');
        setEndDate('');
    };
    
    const activeFilterCount = [searchTerm, selectedMood, showRecurringOnly, startDate, endDate].filter(Boolean).length;

    return (
        <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-purple-500/10 shadow-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Dream Archive</h2>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-sm text-purple-200 hover:text-white bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors relative"
                >
                    <FilterIcon className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white shadow-md">{activeFilterCount}</span>
                    )}
                </button>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="mb-4 p-4 bg-black/20 border border-purple-500/10 rounded-lg space-y-4">
                    <input
                        type="text"
                        placeholder="Search by keyword or tag..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all"
                    />
                     <div>
                        <span className="block text-sm font-medium text-purple-200 mb-2">Filter by Mood</span>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setSelectedMood(null)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${!selectedMood ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:border-purple-500'}`}>All</button>
                            {MOODS.map(({label, emoji}) => (
                                <button key={label} onClick={() => setSelectedMood(label)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedMood === label ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:border-purple-500'}`}>
                                    {emoji} {label}
                                </button>
                            ))}
                        </div>
                    </div>
                     <label htmlFor="recurring-filter" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" id="recurring-filter" className="sr-only" checked={showRecurringOnly} onChange={() => setShowRecurringOnly(!showRecurringOnly)} />
                            <div className="block bg-gray-600/50 w-10 h-6 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showRecurringOnly ? 'transform translate-x-4 bg-cyan-400' : ''}`}></div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-purple-200">Show only recurring dreams</span>
                    </label>
                     <div>
                        <span className="block text-sm font-medium text-purple-200 mb-2">Filter by Date Range</span>
                        <div className="flex items-center gap-2">
                             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-1.5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all" />
                            <span className="text-purple-300">to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-1.5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all" />
                        </div>
                    </div>
                    {activeFilterCount > 0 && <button onClick={resetFilters} className="text-sm text-purple-300 hover:text-white transition-colors">Clear Filters</button>}
                </div>
            </div>
           
            {filteredDreams.length > 0 ? (
                <div className="space-y-3 overflow-y-auto pr-2 -mr-2 flex-grow">
                    {filteredDreams.map(dream => (
                        <DreamCard
                            key={dream.id}
                            dream={dream}
                            isSelected={selectedDream?.id === dream.id}
                            onClick={() => onSelectDream(dream)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center h-full p-4 space-y-4">
                    {dreams.length > 0 ? (
                        <>
                            <p className="text-purple-400">No dreams match your filters.</p>
                            <button onClick={resetFilters} className="text-sm bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition-colors">
                                Clear Filters
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-purple-400">Your dream journal is empty.</p>
                            <button
                                onClick={() => modalContext?.openModal('newDream')}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 transition-all duration-300 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                <PlusIcon />
                                Record Your First Dream
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DreamList;