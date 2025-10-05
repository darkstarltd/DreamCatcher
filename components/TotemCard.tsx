
import React from 'react';
import { Totem } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface TotemCardProps {
    totem: Totem;
    onSelect: () => void;
}

const TotemCard: React.FC<TotemCardProps> = ({ totem, onSelect }) => {
    return (
        <div 
            className="group relative aspect-[4/5] bg-black/20 rounded-xl border border-purple-500/10 overflow-hidden cursor-pointer shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1"
            onClick={onSelect}
        >
            {totem.imageUrl ? (
                <img src={totem.imageUrl} alt={totem.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900/50">
                    <div className="flex flex-col items-center gap-2 text-purple-400">
                        <LoadingSpinner />
                        <span className="text-xs">Generating...</span>
                    </div>
                </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent transition-opacity duration-300 group-hover:from-black/90"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h4 className="font-bold truncate">{totem.name}</h4>
                <p className="text-xs text-purple-300">{totem.dreamIds.length} appearances</p>
            </div>
        </div>
    );
};

export default TotemCard;
