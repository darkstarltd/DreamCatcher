import React, { useState, useContext } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { ModalContext } from '../context/ModalContext';
import { editImage } from '../services/geminiService';
import { PhotoEditIcon, SparklesIcon } from './icons';

const EditImageModal: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const modalContext = useContext(ModalContext);

    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!modalContext) return null;
    const { modalState, closeModal } = modalContext;
    const { isOpen, dream } = modalState.editImage;
    const onClose = () => closeModal('editImage');

    if (!isOpen || !dreamContext || !toastContext || !dream || !dream.imageUrl) return null;
    
    const { updateDream } = dreamContext;
    const { addToast } = toastContext;

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter an editing instruction.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const match = dream.imageUrl!.match(/^data:(.+);base64,(.+)$/);
            if (!match) {
                throw new Error("Invalid image data URL format.");
            }
            const mimeType = match[1];
            const base64ImageData = match[2];

            const result = await editImage(base64ImageData, mimeType, prompt);
            updateDream(dream.id, { imageUrl: result.imageUrl });
            addToast(result.textResponse || 'Image edited successfully!', 'success');
            onClose();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to edit image.';
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-4xl p-8 space-y-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-purple-300 flex items-center gap-3">
                        <PhotoEditIcon />
                        Edit Dream Image
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-200">Current Image for "{dream.title}"</h3>
                        <img src={dream.imageUrl} alt={dream.title} className="rounded-lg w-full" />
                    </div>
                    <div className="space-y-4 flex flex-col">
                        <h3 className="text-lg font-semibold text-purple-200">How would you like to change it?</h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={5}
                            className="w-full flex-grow bg-gray-800 border border-purple-500/50 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="e.g., Add a second moon in the sky. Make the river glow. Change the style to anime."
                        />
                         {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
                        <div className="flex justify-end gap-4 pt-4">
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:bg-gray-600">
                                {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
                                {isLoading ? 'Generating...' : 'Apply Edit'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditImageModal;
