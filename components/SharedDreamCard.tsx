import React from 'react';
import { Dream, LinkedProfile } from '../types';

// Helper to get initials from a name
const getInitials = (name: string, surname: string) => {
    const first = name ? name.charAt(0) : '';
    const second = surname ? surname.charAt(0) : '';
    return `${first}${second}`.toUpperCase();
};

interface SharedDreamCardProps {
    dream: Dream;
    profiles: LinkedProfile[];
    onViewDream: (dream: Dream) => void;
}

const SharedDreamCard: React.FC<SharedDreamCardProps> = ({ dream, profiles, onViewDream }) => {
    return (
        <div className="bg-black/20 p-4 rounded-xl border border-purple-500/10 space-y-3 animate-fade-in">
            <div>
                <p className="text-sm text-purple-300">{dream.date}</p>
                <h3 className="font-bold text-lg text-white">{dream.title}</h3>
                <p className="text-sm text-gray-300 mt-1 line-clamp-3">{dream.summary || dream.description}</p>
            </div>
            <div className="pt-3 border-t border-purple-500/20 flex justify-between items-center">
                <div>
                    <p className="text-xs text-purple-400 mb-1">Shared with:</p>
                    <div className="flex -space-x-2">
                        {profiles.map((profile, index) => (
                             <div key={profile.id} title={profile.username} className="w-8 h-8 rounded-full bg-purple-800 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white" style={{ zIndex: profiles.length - index }}>
                                {getInitials(profile.username, profile.relationship)}
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => onViewDream(dream)}
                    className="text-sm bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition-colors"
                >
                    View Dream
                </button>
            </div>
        </div>
    );
};

export default SharedDreamCard;