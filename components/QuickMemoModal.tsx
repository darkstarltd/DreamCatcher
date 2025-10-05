import React, { useState, useContext, FormEvent } from 'react';
import { DreamContext } from '../context/DreamContext.tsx';
import { ToastContext } from '../context/ToastContext.tsx';
import { ModalContext } from '../context/ModalContext.tsx';

const QuickMemoModal: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const modalContext = useContext(ModalContext);
    const [memoText, setMemoText] = useState('');

    if (!dreamContext || !toastContext || !modalContext) return null;
    const { addMemo } = dreamContext;
    const { addToast } = toastContext;
    const { closeModal } = modalContext;
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (memoText.trim()) {
            addMemo(memoText.trim());
            addToast('Quick Memo saved!', 'success');
            closeModal('quickMemo');
        } else {
             addToast('Memo cannot be empty.', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => closeModal('quickMemo')}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-lg p-8 space-y-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-purple-300">Quick Dream Memo</h2>
                <p className="text-purple-300 text-sm">Jot down key details before they fade. You can flesh out the full dream later.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <textarea
                        value={memoText}
                        onChange={e => setMemoText(e.target.value)}
                        rows={6}
                        className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        required
                        placeholder="e.g., Flying over a glass city, talking squirrel, feeling of being late..."
                        autoFocus
                    />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => closeModal('quickMemo')} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors">Save Memo</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickMemoModal;