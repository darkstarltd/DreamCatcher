import React, { useContext } from 'react';
import { Dream } from '../types';
import { MOODS } from '../constants';
import { CometIcon, ClipboardIcon, LinkIcon, EditIcon, TrashIcon, ImageIcon, SparklesIcon } from './icons';
import { DreamContext } from '../context/DreamContext';
import { ModalContext } from '../context/ModalContext';
import { ContextMenuContext } from '../context/ContextMenuContext';

interface DreamCardProps {
    dream: Dream;
    isSelected: boolean;
    onClick: () => void;
}

const DreamCard: React.FC<DreamCardProps> = ({ dream, isSelected, onClick }) => {
    const dreamContext = useContext(DreamContext);
    const modalContext = useContext(ModalContext);
    const contextMenu = useContext(ContextMenuContext);

    if (!dreamContext || !modalContext || !contextMenu) return null;

    const moodEmoji = MOODS.find(m => m.label === dream.mood)?.emoji || '🤔';
    const moodColor = MOODS.find(m => m.label === dream.mood)?.color || '#a855f7';

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const { deleteDream } = dreamContext;

        const menuItems = (
            <>
                <button onClick={() => modalContext.openModal('editDream', { dream })} className="flex items-center gap-2 w-full text-left p-2 text-sm rounded-md hover:bg-purple-500/20">
                    <EditIcon className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => deleteDream(dream.id)} className="flex items-center gap-2 w-full text-left p-2 text-sm rounded-md text-red-400 hover:bg-red-500/20">
                    <TrashIcon className="h-4 w-4" /> Delete
                </button>
                 {!dream.imageUrl && (
                    <button onClick={() => modalContext.openModal('generateImage', { dream })} className="flex items-center gap-2 w-full text-left p-2 text-sm rounded-md hover:bg-purple-500/20">
                        <ImageIcon className="h-4 w-4" /> Generate Image
                    </button>
                )}
            </>
        );

        contextMenu.showContextMenu(e.clientX, e.clientY, menuItems);
    };
    
    const handleGenerateImageClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card selection
        modalContext.openModal('generateImage', { dream });
    };

    return (
        <div
            onClick={onClick}
            onContextMenu={handleContextMenu}
            className={`group relative w-full text-left p-4 rounded-xl transition-all duration-300 border-2 transform hover:-translate-y-1 cursor-pointer ${
                isSelected 
                ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.4)]' 
                : 'bg-black/20 border-transparent hover:border-purple-500/50 hover:bg-purple-900/20 hover:shadow-xl hover:shadow-purple-500/10'
            }`}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2">
                         {dream.isAIGenerated && <span title="AI-Generated"><CometIcon className="h-4 w-4 text-cyan-400 flex-shrink-0" /></span>}
                         {dream.isMemo && <span title="Quick Memo"><ClipboardIcon className="h-4 w-4 text-purple-300 flex-shrink-0" /></span>}
                         {(dream.linkedDreamIds?.length || 0) > 0 && <span title="Part of a series"><LinkIcon className="h-4 w-4 text-cyan-300 flex-shrink-0" /></span>}
                         <h3 className="font-bold text-white truncate">{dream.title}</h3>
                    </div>
                    <p className="text-xs text-purple-300 mt-1">{dream.date}{dream.isMemo && <span className="italic ml-2">(Memo)</span>}</p>
                </div>
                 <div className="text-3xl flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: `${moodColor}20`}}>
                    {moodEmoji}
                </div>
            </div>
            <p className="text-sm text-gray-300 mt-2 line-clamp-2">{dream.summary || dream.description}</p>
            
            {!dream.imageUrl && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={handleGenerateImageClick} 
                        className="p-1.5 bg-purple-600/50 hover:bg-purple-500 rounded-full text-white shadow-lg"
                        title="Generate Image"
                    >
                        <SparklesIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DreamCard;