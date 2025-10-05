import React, { useState, useContext, useMemo, FC } from 'react';
import { DreamContext } from '../context/DreamContext.tsx';
import { ToastContext } from '../context/ToastContext.tsx';
import { ModalContext } from '../context/ModalContext.tsx';
import { Dream, Totem, OdysseyStep } from '../types.ts';
import { generateOdyssey, generateOdysseyCompletion } from '../services/geminiService.ts';
import { PathIcon, SparklesIcon, CheckIcon, LinkIcon } from './icons/index.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';

const Odyssey: FC = () => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const modalContext = useContext(ModalContext);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    if (!dreamContext || !toastContext || !modalContext) return null;

    const { dreams, totems, odysseys, addOdyssey, updateOdyssey, triggerAction } = dreamContext;
    const { addToast } = toastContext;
    const { openModal, closeModal } = modalContext;
    
    const activeOdyssey = useMemo(() => odysseys.find(o => o.status === 'active'), [odysseys]);

    const handleGenerateOdyssey = async () => {
        setIsGenerating(true);
        try {
            const odysseyData = await generateOdyssey(dreams, totems);
            addOdyssey(odysseyData);
            addToast("Your new Odyssey has begun!", "success");
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to generate Odyssey.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLinkResolution = (stepToLink: OdysseyStep) => (dreamId: string, notes: string) => {
        if (!activeOdyssey) return;

        const updatedSteps = activeOdyssey.steps.map(step =>
            step.id === stepToLink.id
                ? { ...step, status: 'completed' as const, resolutionDreamId: dreamId, resolutionNotes: notes }
                : step
        );

        updateOdyssey(activeOdyssey.id, { steps: updatedSteps });
        triggerAction('COMPLETE_ODYSSEY_STEP');
        closeModal('linkResolutionDream');
        addToast("Quest step completed!", "success");
    };

    const handleCompleteOdyssey = async () => {
        if (!activeOdyssey) return;
        setIsCompleting(true);
        try {
            const summary = await generateOdysseyCompletion(activeOdyssey, dreams);
            updateOdyssey(activeOdyssey.id, { status: 'completed', completionSummary: summary });
            triggerAction('COMPLETE_ODYSSEY');
            addToast("Odyssey complete! Well done, dreamer.", "success");
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to generate completion summary.", "error");
            // Still mark as complete even if summary fails
            updateOdyssey(activeOdyssey.id, { status: 'completed' });
            triggerAction('COMPLETE_ODYSSEY');
        } finally {
            setIsCompleting(false);
        }
    };

    if (activeOdyssey) {
        const guideTotem = totems.find(t => t.id === activeOdyssey.centralTotemId);
        const allStepsComplete = activeOdyssey.steps.every(s => s.status === 'completed');

        return (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg border border-purple-500/10">
                    {guideTotem?.imageUrl && (
                        <img src={guideTotem.imageUrl} alt={guideTotem.name} className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30" />
                    )}
                    <div>
                        <p className="text-purple-300">Your Current Odyssey</p>
                        <h2 className="text-3xl font-bold text-white">{activeOdyssey.title}</h2>
                        <p className="text-purple-300 mt-1">{activeOdyssey.description}</p>
                        {guideTotem && <p className="text-sm text-yellow-300 mt-2">Your guide is the totem: <span className="font-bold">{guideTotem.name}</span></p>}
                    </div>
                </div>

                <div className="space-y-4">
                    {activeOdyssey.steps.map((step, index) => {
                        const isUnlocked = index === 0 || activeOdyssey.steps[index - 1]?.status === 'completed';
                        const resolutionDream = dreams.find(d => d.id === step.resolutionDreamId);
                        return (
                             <div key={step.id} className={`p-4 rounded-lg border transition-all duration-500 ${isUnlocked ? 'bg-black/20 border-purple-500/20' : 'bg-gray-900/50 border-gray-700/50 opacity-70'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${step.status === 'completed' ? 'bg-green-600' : isUnlocked ? 'bg-purple-600' : 'bg-gray-600'}`}>
                                        {step.status === 'completed' ? <CheckIcon className="h-5 w-5" /> : step.id + 1}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>{step.title}</h3>
                                        <p className={`text-sm ${isUnlocked ? 'text-purple-300' : 'text-gray-500'}`}>{step.description}</p>
                                        
                                        {step.status === 'pending' && isUnlocked && (
                                            <div className="mt-3 p-3 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-md">
                                                <p className="text-xs font-semibold text-yellow-200">Incubation Goal:</p>
                                                <p className="text-sm text-yellow-300 italic">"{step.incubationGoal}"</p>
                                                <button onClick={() => openModal('linkResolutionDream', { onSave: handleLinkResolution(step) })} className="mt-2 text-xs py-1 px-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-md">Link Fulfilling Dream</button>
                                            </div>
                                        )}
                                        {step.status === 'completed' && resolutionDream && (
                                            <div className="mt-3 space-y-2">
                                                <button onClick={() => {}} className="flex items-center gap-1.5 text-sm bg-green-900/40 text-green-200 px-2 py-1 rounded-full border border-green-500/20">
                                                    <LinkIcon className="h-3 w-3" />Fulfilled by: {resolutionDream.title}
                                                </button>
                                                {step.resolutionNotes && <blockquote className="text-sm text-gray-300 italic border-l-2 border-gray-500 pl-2">"{step.resolutionNotes}"</blockquote>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                
                {allStepsComplete && (
                    <div className="p-6 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg text-center space-y-4">
                        <h3 className="text-2xl font-bold text-white">Odyssey Complete!</h3>
                        {activeOdyssey.completionSummary ? (
                            <p className="text-purple-100">{activeOdyssey.completionSummary}</p>
                        ) : (
                             <button onClick={handleCompleteOdyssey} disabled={isCompleting} className="flex items-center justify-center gap-2 mx-auto py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-md font-semibold transition-colors">
                                {isCompleting ? <LoadingSpinner /> : <SparklesIcon />}
                                Get Final Summary
                            </button>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="text-center py-16 bg-black/20 rounded-2xl border border-purple-500/10 space-y-4">
            <PathIcon className="h-16 w-16 mx-auto text-purple-500/30" />
            <h2 className="text-2xl font-bold text-white">Embark on a Dream Odyssey</h2>
            <p className="text-purple-300 max-w-xl mx-auto">Let the AI analyze your journal and create a personalized quest to explore the deepest parts of your subconscious mind.</p>
            <button
                onClick={handleGenerateOdyssey}
                disabled={isGenerating || dreams.length < 15}
                title={dreams.length < 15 ? "You need at least 15 dreams to start an Odyssey" : "Start a new Odyssey"}
                className="flex items-center justify-center gap-2 mx-auto py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:opacity-50"
            >
                {isGenerating ? <LoadingSpinner /> : <SparklesIcon />}
                {isGenerating ? 'Generating...' : 'Embark on a New Odyssey'}
            </button>
        </div>
    );
};

export default Odyssey;