import React, { useState, useEffect, useContext } from 'react';
import { ImageIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { SettingsContext } from '../context/SettingsContext';
import { ModalContext } from '../context/ModalContext';
import { generateImage } from '../services/geminiService';

const GenerateImageModal: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const settingsContext = useContext(SettingsContext);
    const modalContext = useContext(ModalContext);
    
    const [progressMessages, setProgressMessages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!dreamContext || !toastContext || !settingsContext || !modalContext) return null;

    const { modalState, closeModal } = modalContext;
    const { isOpen, dream } = modalState.generateImage;
    const onClose = () => {
        setIsGenerating(false);
        setProgressMessages([]);
        closeModal('generateImage');
    };

    useEffect(() => {
        if (isOpen && dream && !isGenerating) {
            const { updateDream, triggerAction } = dreamContext;
            const { addToast } = toastContext;
            const { dataSaverMode } = settingsContext;

            const handleGenerate = async () => {
                if (dataSaverMode) {
                    addToast("Image generation is disabled in Data Saver mode.", "info");
                    onClose();
                    return;
                }
                setIsGenerating(true);
                setProgressMessages(['Crafting a prompt for the image generator...']);
        
                try {
                    const prompt = `A dream about: ${dream.title}. ${dream.description}. Mood is ${dream.mood}. Tags: ${dream.tags.join(', ')}.`;
                    const imageUrl = await generateImage(prompt, 'surrealism', dataSaverMode);
                    updateDream(dream.id, { imageUrl });
                    addToast('Dream image generated successfully!', 'success');
                    setProgressMessages(prev => [...prev, 'Image generated successfully!']);
                    triggerAction('GENERATE_IMAGE');
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image.';
                    addToast(errorMessage, 'error');
                    setProgressMessages(prev => [...prev, `Error: ${errorMessage}`]);
                } finally {
                    setIsGenerating(false);
                }
            };
            handleGenerate();
        }
    }, [isOpen, dream, isGenerating, dreamContext, toastContext, settingsContext, onClose]);

    if (!isOpen) return null;

    const isFinished = !isGenerating && progressMessages.length > 0;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
                className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-lg p-8 space-y-6" 
                onClick={e => isFinished && onClose()}
            >
                <div className="text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-purple-400" />
                    <h2 className="text-2xl font-bold text-purple-300 mt-4">Generating Dream Image</h2>
                    <p className="text-purple-400 mt-1">The AI is visualizing your dream...</p>
                </div>
                
                <div className="max-h-60 overflow-y-auto bg-black/20 p-4 rounded-lg border border-purple-500/10 space-y-2 text-sm">
                    {progressMessages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-2 ${msg.includes("Error:") ? 'text-red-400' : 'text-gray-300'}`}>
                           <span className="flex-shrink-0 mt-1">
                             {index === progressMessages.length - 1 && isGenerating ? <LoadingSpinner /> : '●'}
                           </span>
                           <span>{msg}</span>
                        </div>
                    ))}
                </div>
                
                {isFinished && (
                    <div className="flex justify-end pt-4">
                        <button onClick={onClose} className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors">Close</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateImageModal;