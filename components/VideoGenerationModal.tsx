
import React, { useState, useEffect, useContext } from 'react';
import { VideoIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { SettingsContext } from '../context/SettingsContext';
import { ModalContext } from '../context/ModalContext';
import { generateVideo } from '../services/geminiService';

const VideoGenerationModal: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const settingsContext = useContext(SettingsContext);
    const modalContext = useContext(ModalContext);
    
    const [progressMessages, setProgressMessages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!dreamContext || !toastContext || !settingsContext || !modalContext) return null;

    const { modalState, closeModal } = modalContext;
    const { isOpen } = modalState.videoGeneration;
    const onClose = () => {
        setIsGenerating(false);
        setProgressMessages([]);
        closeModal('videoGeneration');
    };

    useEffect(() => {
        if (isOpen && dreamContext.selectedDream && !isGenerating) {
            const { selectedDream, updateDream, triggerAction } = dreamContext;
            const { addToast } = toastContext;
            const { dataSaverMode } = settingsContext;

            const handleGenerateVideo = async () => {
                if (dataSaverMode) {
                    addToast("Video generation is disabled in Data Saver mode.", "info");
                    onClose();
                    return;
                }
                setIsGenerating(true);
                setProgressMessages([]);
        
                const onProgress = (message: string) => {
                    setProgressMessages(prev => [...prev, message]);
                };
        
                try {
                    const videoUrl = await generateVideo(selectedDream, onProgress);
                    updateDream(selectedDream.id, { videoUrl });
                    addToast('Dream video generated successfully!', 'success');
                    onProgress("Video generated successfully!");
                    triggerAction('GENERATE_VIDEO');
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to generate video.';
                    addToast(errorMessage, 'error');
                    onProgress(`Error: ${errorMessage}`);
                } finally {
                    setIsGenerating(false);
                }
            };
            handleGenerateVideo();
        }
    }, [isOpen, dreamContext, toastContext, settingsContext, isGenerating, onClose]);

    if (!isOpen) return null;

    const isFinished = !isGenerating && progressMessages.length > 0;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
                className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-lg p-8 space-y-6" 
                onClick={e => isFinished && onClose()}
            >
                <div className="text-center">
                    <VideoIcon className="h-12 w-12 mx-auto text-purple-400" />
                    <h2 className="text-2xl font-bold text-purple-300 mt-4">Generating Dream Video</h2>
                    <p className="text-purple-400 mt-1">This process may take a few minutes. Please be patient.</p>
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

export default VideoGenerationModal;
