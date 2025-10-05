import React, { useState, useContext, useMemo } from 'react';
import { DreamContext } from '../context/DreamContext.tsx';
import { ToastContext } from '../context/ToastContext.tsx';
import { ModalContext } from '../context/ModalContext.tsx';
import { Dream } from '../types.ts';

const LinkResolutionDreamModal: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const modalContext = useContext(ModalContext);

    const [selectedDreamId, setSelectedDreamId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');

    if (!modalContext || !dreamContext || !toastContext) return null;
    
    const { modalState, closeModal } = modalContext;
    const { isOpen, onSave } = modalState.linkResolutionDream;
    const onClose = () => closeModal('linkResolutionDream');
    
    const { dreams } = dreamContext;
    const { addToast } = toastContext;

    const recentDreams = useMemo(() => {
        return [...dreams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);
    }, [dreams]);

    const handleSave = () => {
        if (!selectedDreamId) {
            addToast("Please select a dream.", "error");
            return;
        }
        onSave(selectedDreamId, notes);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-2xl p-8 space-y-6 flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-purple-300">Link Fulfilling Dream</h2>
                <p className="text-purple-300">Which dream fulfilled this step of your Odyssey?</p>

                <div className="flex-grow overflow-y-auto pr-2 space-y-2 max-h-[40vh]">
                    {recentDreams.map(dream => (
                        <button 
                            key={dream.id}
                            onClick={() => setSelectedDreamId(dream.id)}
                            className={`w-full text-left p-3 rounded-md transition-colors border-2 ${selectedDreamId === dream.id ? 'bg-purple-500/30 border-purple-400' : 'bg-black/20 border-transparent hover:border-purple-500/50'}`}
                        >
                            <p className="font-semibold text-white">{dream.title}</p>
                            <p className="text-sm text-purple-300">{dream.date}</p>
                        </button>
                    ))}
                </div>

                <div>
                    <label htmlFor="resolution-notes" className="block text-sm font-medium text-purple-200 mb-1">Resolution Notes (optional)</label>
                    <textarea
                        id="resolution-notes"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={3}
                        className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="e.g., In this dream, I found the key inside a music box, which represented..."
                    />
                </div>
                
                <div className="flex justify-end gap-4 pt-4 border-t border-purple-500/20">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Cancel</button>
                    <button type="button" onClick={handleSave} disabled={!selectedDreamId} className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:opacity-50">Complete Step</button>
                </div>
            </div>
        </div>
    );
};

export default LinkResolutionDreamModal;