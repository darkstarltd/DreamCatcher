import React, { useState, useContext, useEffect } from 'react';
import { DreamContext } from '../context/DreamContext';
import { Dream } from '../types';

interface LinkDreamsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDream: Dream;
}

const LinkDreamsModal: React.FC<LinkDreamsModalProps> = ({ isOpen, onClose, currentDream }) => {
    const context = useContext(DreamContext);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (currentDream?.linkedDreamIds) {
            setSelectedIds(new Set(currentDream.linkedDreamIds));
        } else {
            setSelectedIds(new Set());
        }
    }, [currentDream, isOpen]);

    if (!isOpen || !context) return null;

    const { dreams, updateDream } = context;

    const handleToggle = (dreamId: string) => {
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(dreamId)) {
            newSelectedIds.delete(dreamId);
        } else {
            newSelectedIds.add(dreamId);
        }
        setSelectedIds(newSelectedIds);
    };

    const handleSave = () => {
        const newLinkedIds = Array.from(selectedIds);
        const originalLinkedIds = currentDream.linkedDreamIds || [];

        // Find which dreams were added and which were removed
        const addedIds = newLinkedIds.filter(id => !originalLinkedIds.includes(id));
        const removedIds = originalLinkedIds.filter(id => !newLinkedIds.includes(id));

        // Update the current dream
        updateDream(currentDream.id, { linkedDreamIds: newLinkedIds });

        // Update newly added dreams to link back to the current dream
        addedIds.forEach(id => {
            const dream = dreams.find(d => d.id === id);
            if (dream) {
                const updatedLinkedIds = Array.from(new Set([...(dream.linkedDreamIds || []), currentDream.id]));
                updateDream(dream.id, { linkedDreamIds: updatedLinkedIds });
            }
        });

        // Update newly removed dreams to unlink from the current dream
        removedIds.forEach(id => {
            const dream = dreams.find(d => d.id === id);
            if (dream && dream.linkedDreamIds) {
                const updatedLinkedIds = dream.linkedDreamIds.filter(linkId => linkId !== currentDream.id);
                updateDream(dream.id, { linkedDreamIds: updatedLinkedIds });
            }
        });
        
        onClose();
    };

    const otherDreams = dreams.filter(d => d.id !== currentDream.id);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-2xl p-8 space-y-6 flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-purple-300">Link Dreams to "{currentDream.title}"</h2>
                
                <div className="flex-grow overflow-y-auto pr-4 space-y-2 max-h-[60vh]">
                    {otherDreams.length > 0 ? otherDreams.map(dream => (
                        <div key={dream.id} className="flex items-center p-2 rounded-md hover:bg-purple-900/30 transition-colors">
                            <input
                                type="checkbox"
                                id={`link-${dream.id}`}
                                checked={selectedIds.has(dream.id)}
                                onChange={() => handleToggle(dream.id)}
                                className="h-5 w-5 rounded bg-gray-700 border-purple-500 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <label htmlFor={`link-${dream.id}`} className="ml-3 text-white cursor-pointer">
                                <p className="font-semibold">{dream.title}</p>
                                <p className="text-sm text-purple-300">{dream.date}</p>
                            </label>
                        </div>
                    )) : (
                        <p className="text-purple-400 text-center py-8">There are no other dreams to link.</p>
                    )}
                </div>
                
                <div className="flex justify-end gap-4 pt-4 border-t border-purple-500/20">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Cancel</button>
                    <button type="button" onClick={handleSave} className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors">Save Links</button>
                </div>
            </div>
        </div>
    );
};

export default LinkDreamsModal;