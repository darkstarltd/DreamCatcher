import React, { useContext, useState, useEffect } from 'react';
import { Totem, Dream } from '../types.ts';
import { DreamContext } from '../context/DreamContext.tsx';
import { ToastContext } from '../context/ToastContext.tsx';
import { ModalContext } from '../context/ModalContext.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';
import { LinkIcon, SparklesIcon, XIcon, PencilIcon } from './icons/index.tsx';
import { getTotemDetails, generateImageForTotem } from '../services/geminiService.ts';

interface TotemDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    totem: Totem;
    onDreamSelect: (dream: Dream) => void;
}

const TotemDetailModal: React.FC<TotemDetailModalProps> = ({ isOpen, onClose, totem, onDreamSelect }) => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const modalContext = useContext(ModalContext);
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    useEffect(() => {
        // Fetch detailed interpretation when modal opens for the first time
        if (isOpen && !totem.detailedInterpretation) {
            handleGetDetails();
        }
    }, [isOpen, totem]);

    if (!isOpen || !dreamContext || !toastContext || !modalContext) return null;
    
    const { dreams, updateTotem } = dreamContext;
    const { addToast } = toastContext;
    const { openModal } = modalContext;

    const relevantDreams = dreams.filter(d => totem.dreamIds.includes(d.id));

    const handleGetDetails = async () => {
        setIsInterpreting(true);
        try {
            const interpretation = await getTotemDetails(totem.name, relevantDreams);
            updateTotem(totem.id, { detailedInterpretation: interpretation });
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to get details.", "error");
        } finally {
            setIsInterpreting(false);
        }
    };

    const handleRegenerateImage = async () => {
        setIsGeneratingImage(true);
        try {
            const imageUrl = await generateImageForTotem(totem.imagePrompt);
            updateTotem(totem.id, { imageUrl });
            addToast("Totem image regenerated.", "success");
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to regenerate image.", "error");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleDreamClick = (dream: Dream) => {
        onClose();
        onDreamSelect(dream);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-4xl max-h-[90vh] p-8 flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-purple-300">{totem.name}</h2>
                            <p className="text-purple-400 italic mt-1">{totem.description}</p>
                        </div>
                        <div className="flex items-center">
                            <button onClick={() => openModal('editTotem', { totem })} className="text-gray-400 hover:text-purple-300 transition-colors p-2 rounded-full hover:bg-purple-500/10" aria-label="Edit totem">
                                <PencilIcon />
                            </button>
                            <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon /></button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-2">
                        <div className="space-y-4">
                            <div className="aspect-square w-full bg-black/20 rounded-lg border border-purple-500/10 overflow-hidden">
                                {totem.imageUrl && !isGeneratingImage ? (
                                    <img src={totem.imageUrl} alt={totem.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-purple-400">
                                        <LoadingSpinner />
                                    </div>
                                )}
                            </div>
                            <button onClick={handleRegenerateImage} disabled={isGeneratingImage} className="w-full flex items-center justify-center gap-2 text-sm text-purple-300 hover:text-white bg-purple-800/50 hover:bg-purple-800/80 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50">
                                {isGeneratingImage ? <LoadingSpinner /> : <SparklesIcon className="h-4 w-4" />}
                                Regenerate Image
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-semibold text-purple-200">AI Interpretation</h3>
                                    <button onClick={handleGetDetails} disabled={isInterpreting} className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-white disabled:opacity-50">
                                        {isInterpreting && <LoadingSpinner />}
                                        Refresh
                                    </button>
                                </div>
                                <div className="prose prose-invert max-w-none prose-p:text-gray-300 p-4 bg-black/20 rounded-lg border border-purple-500/10 min-h-[150px]">
                                    {isInterpreting && !totem.detailedInterpretation ? <p>Interpreting...</p> : <p className="whitespace-pre-wrap">{totem.detailedInterpretation || ""}</p>}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-purple-200 mb-2">Dream Appearances ({relevantDreams.length})</h3>
                                <div className="space-y-2">
                                    {relevantDreams.map(dream => (
                                        <button 
                                            key={dream.id} 
                                            onClick={() => handleDreamClick(dream)}
                                            className="w-full text-left p-2 rounded-md bg-purple-900/40 hover:bg-purple-900/70 transition-colors border border-purple-500/20"
                                        >
                                            <p className="font-semibold text-white flex items-center gap-2"><LinkIcon className="h-4 w-4 text-purple-300"/>{dream.title}</p>
                                            <p className="text-xs text-purple-300 ml-6">{dream.date}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TotemDetailModal;