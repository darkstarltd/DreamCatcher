import React, { useState, useContext, useMemo } from 'react';
import { DreamContext } from '../context/DreamContext';
import { SettingsContext } from '../context/SettingsContext';
import { Dream, LinkedProfile } from '../types';
import SharedDreamCard from './SharedDreamCard';
import { UsersIcon } from './icons';

interface DreamCircleProps {
    onDreamSelect: (dream: Dream) => void;
}

const DreamCircle: React.FC<DreamCircleProps> = ({ onDreamSelect }) => {
    const dreamContext = useContext(DreamContext);
    const settingsContext = useContext(SettingsContext);
    const [filterProfileId, setFilterProfileId] = useState<string | null>(null);

    if (!dreamContext || !settingsContext) return null;

    const { dreams } = dreamContext;
    const { linkedProfiles } = settingsContext;

    const sharedDreams = useMemo(() => {
        return dreams
            .filter(d => d.sharedWith && d.sharedWith.length > 0)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [dreams]);

    const filteredFeed = useMemo(() => {
        if (!filterProfileId) return sharedDreams;
        return sharedDreams.filter(d => d.sharedWith?.includes(filterProfileId));
    }, [sharedDreams, filterProfileId]);
    
    const profilesById = useMemo(() => new Map(linkedProfiles.map(p => [p.id, p])), [linkedProfiles]);

    const getProfilesForDream = (dream: Dream): LinkedProfile[] => {
        return (dream.sharedWith || []).map(id => profilesById.get(id)).filter((p): p is LinkedProfile => !!p);
    };

    return (
        <div className="flex flex-col md:flex-row h-full gap-6 animate-fade-in max-w-6xl mx-auto w-full">
            {/* Left Sidebar for Filters (Desktop) */}
            <div className="w-full md:w-1/4 flex-shrink-0 space-y-4">
                <h2 className="text-2xl font-bold text-white">Dream Circle</h2>
                {/* Desktop Filter List */}
                <div className="space-y-2 hidden md:block">
                     <button
                        onClick={() => setFilterProfileId(null)}
                        className={`w-full text-left p-3 rounded-lg transition-colors text-white ${!filterProfileId ? 'bg-purple-600/50' : 'bg-black/20 hover:bg-purple-500/10'}`}
                    >
                        All Shared Dreams
                    </button>
                    {linkedProfiles.map(profile => (
                        <button
                            key={profile.id}
                            onClick={() => setFilterProfileId(profile.id)}
                            className={`w-full text-left p-3 rounded-lg transition-colors text-white ${filterProfileId === profile.id ? 'bg-purple-600/50' : 'bg-black/20 hover:bg-purple-500/10'}`}
                        >
                            <p className="font-semibold">{profile.username}</p>
                            <p className="text-xs text-purple-300">{profile.relationship}</p>
                        </button>
                    ))}
                </div>
                 {/* Mobile Filter Dropdown */}
                 <div className="md:hidden">
                    <select
                        value={filterProfileId || 'all'}
                        onChange={(e) => setFilterProfileId(e.target.value === 'all' ? null : e.target.value)}
                        className="w-full p-3 rounded-lg bg-black/20 text-white border border-purple-500/20 focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="all">All Shared Dreams</option>
                        {linkedProfiles.map(profile => (
                             <option key={profile.id} value={profile.id}>{profile.username} ({profile.relationship})</option>
                        ))}
                    </select>
                 </div>
            </div>

            {/* Main Feed */}
            <div className="flex-1 overflow-y-auto pr-2">
                {filteredFeed.length > 0 ? (
                    <div className="space-y-4">
                        {filteredFeed.map(dream => (
                            <SharedDreamCard
                                key={dream.id}
                                dream={dream}
                                profiles={getProfilesForDream(dream)}
                                onViewDream={onDreamSelect}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-purple-300 bg-black/20 rounded-lg">
                        <UsersIcon className="h-16 w-16 text-purple-500/30" />
                        <h3 className="mt-4 text-xl font-semibold text-white">
                            {sharedDreams.length === 0 ? "Your Dream Circle is Quiet" : "No Dreams Shared with this Profile"}
                        </h3>
                        <p className="mt-2 max-w-sm">
                           {sharedDreams.length === 0 ? "Use the 'Share' button on a dream's detail page to share it with profiles you've added in Settings." : "Select another profile or 'All Shared Dreams' to see more."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DreamCircle;