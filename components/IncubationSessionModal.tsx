import React, { useState, useEffect, useContext, useRef } from 'react';
import { DreamContext } from '../context/DreamContext.tsx';
import { SettingsContext } from '../context/SettingsContext.tsx';
import { IncubationSession } from '../types.ts';
import { generateImage } from '../services/geminiService.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import { SpeakerOnIcon, SpeakerOffIcon } from './icons/index.tsx';

interface IncubationSessionModalProps {
    session: IncubationSession;
    onClose: () => void;
}

const IncubationSessionModal: React.FC<IncubationSessionModalProps> = ({ session, onClose }) => {
    const dreamContext = useContext(DreamContext);
    const settingsContext = useContext(SettingsContext);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (!dreamContext || !settingsContext) return;
        const { updateIncubationSession } = dreamContext;
        const { dataSaverMode } = settingsContext;

        const generateFocusImage = async () => {
            if (session.focusImageUrl) {
                setIsLoadingImage(false);
                return;
            }
            try {
                const imageUrl = await generateImage(session.focusImagePrompt, "Surrealism", dataSaverMode);
                updateIncubationSession(session.id, { focusImageUrl: imageUrl });
            } catch (error) {
                console.error("Failed to generate focus image:", error);
            } finally {
                setIsLoadingImage(false);
            }
        };

        generateFocusImage();

        return () => {
            // Cleanup speech synthesis on unmount
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        };
    }, [session.id, session.focusImageUrl, session.focusImagePrompt, dreamContext, settingsContext]);
    
    if (!dreamContext || !settingsContext) return null;
    const { updateIncubationSession, incubationSessions } = dreamContext;
    const currentSessionState = incubationSessions.find(s => s.id === session.id);

    const handlePlayAudio = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(session.guidedScript);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            utteranceRef.current = null;
        };
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };
    
    const handleFinish = () => {
        updateIncubationSession(session.id, { isComplete: true });
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-lg flex items-center justify-center z-[60] p-4 animate-fade-in">
            <div className="absolute inset-0 bg-grid-purple-500/[0.03] animate-pulse"></div>
            <div className="w-full max-w-3xl text-center space-y-6">
                <h2 className="text-3xl font-bold text-purple-200">Prepare for Your Dream</h2>
                <p className="text-lg text-purple-300">"{session.intention}"</p>
                
                <div className="aspect-video w-full bg-black/30 rounded-lg border border-purple-500/20 flex items-center justify-center overflow-hidden">
                    {isLoadingImage ? (
                        <div className="text-purple-300 flex flex-col items-center gap-2">
                            <LoadingSpinner />
                            <span>Generating focus image...</span>
                        </div>
                    ) : (
                        <img src={currentSessionState?.focusImageUrl} alt="Focus Image" className="w-full h-full object-cover" />
                    )}
                </div>

                <div className="max-h-48 overflow-y-auto bg-black/20 p-4 rounded-lg text-left">
                    <p className="text-gray-300 whitespace-pre-wrap">{session.guidedScript}</p>
                </div>

                <div className="flex justify-center items-center gap-6">
                    <button
                        onClick={handlePlayAudio}
                        className="p-4 rounded-full bg-purple-600/50 hover:bg-purple-600/80 transition-colors text-white"
                        aria-label={isSpeaking ? "Stop guide" : "Play guide"}
                    >
                        {isSpeaking ? <SpeakerOnIcon className="h-8 w-8 animate-pulse" /> : <SpeakerOffIcon className="h-8 w-8" />}
                    </button>
                    <button
                        onClick={handleFinish}
                        className="py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold transition-colors"
                    >
                        Finish Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncubationSessionModal;