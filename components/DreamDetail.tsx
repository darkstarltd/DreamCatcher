

import React, { useContext, useState, useEffect } from 'react';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { SettingsContext } from '../context/SettingsContext';
import { ModalContext } from '../context/ModalContext';
import { getCelestialInfluence } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { MOODS } from '../constants';
import { SparklesIcon, ImageIcon, TrashIcon, EditIcon, LinkIcon, SearchIcon, WeaveIcon, UploadIcon, SpeakerOffIcon, SpeakerOnIcon, CometIcon, VideoIcon, ArrowLeftIcon, MindMapIcon, AudioWaveIcon, CompareIcon, ShuffleIcon } from './icons';
import DreamChat from './DreamChat';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { Dream } from '../types';

interface DreamDetailProps {
    onBack: () => void;
}

const DreamDetail: React.FC<DreamDetailProps> = ({ onBack }) => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const settingsContext = useContext(SettingsContext);
    const modalContext = useContext(ModalContext);
    
    const [isGeneratingCelestial, setIsGeneratingCelestial] = useState(false);
    const [mediaView, setMediaView] = useState<'image' | 'video'>('image');

    const { isSpeaking, speak, cancel } = useSpeechSynthesis();
    
    if (!dreamContext || !toastContext || !settingsContext || !modalContext) return null;

    const { selectedDream, deleteDream, selectDream, updateDream } = dreamContext;
    const { openModal } = modalContext;

    React.useEffect(() => {
        if (selectedDream?.videoUrl) {
            setMediaView('video');
        } else {
            setMediaView('image');
        }
    }, [selectedDream]);

    if (!selectedDream) return null;

    const { addToast } = toastContext;
    const { dreamSigns, disableAIFeatures, dataSaverMode } = settingsContext;
    const mood = MOODS.find(m => m.label === selectedDream.mood) || MOODS[7];
    
    const handleGenerateCelestial = async () => {
        if (!selectedDream.celestialContext) return;
        setIsGeneratingCelestial(true);
        try {
            const result = await getCelestialInfluence(selectedDream.celestialContext);
            updateDream(selectedDream.id, { celestialInterpretation: result });
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to get celestial interpretation.", "error");
        } finally {
            setIsGeneratingCelestial(false);
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the dream "${selectedDream.title}"?`)) {
            deleteDream(selectedDream.id);
            addToast('Dream deleted.', 'info');
        }
    };

    const handleReadAloud = () => {
        if (isSpeaking) {
            cancel();
        } else {
            speak(`${selectedDream.title}. ${selectedDream.description}`);
        }
    };

    const linkedDreams = dreamContext.dreams.filter(d => selectedDream.linkedDreamIds?.includes(d.id));
    const seriesDreams = [selectedDream, ...linkedDreams];

    const hasImage = !!selectedDream.imageUrl;
    const hasVideo = !!selectedDream.videoUrl;

    return (
        <div className="bg-black/20 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-purple-500/10 shadow-2xl shadow-purple-500/10 h-full flex flex-col space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex-shrink-0">
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                        <button onClick={onBack} className="p-2 text-purple-200 hover:text-white hover:bg-purple-500/10 rounded-full transition-colors md:hidden" title="Back to list">
                            <ArrowLeftIcon />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl md:text-4xl p-2 rounded-full" style={{ backgroundColor: `${mood.color}20` }}>{mood.emoji}</span>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedDream.title}</h2>
                            </div>
                            <p className="text-sm text-purple-300 mt-1 md:ml-14">{selectedDream.date}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={handleReadAloud} className="p-2 text-purple-200 hover:text-white hover:bg-purple-500/10 rounded-full transition-colors" title={isSpeaking ? "Stop Reading" : "Read Aloud"}>
                            {isSpeaking ? <SpeakerOnIcon className="animate-pulse" /> : <SpeakerOffIcon />}
                        </button>
                        <button onClick={() => openModal('shareDream', { dream: selectedDream })} className="p-2 text-purple-200 hover:text-white hover:bg-purple-500/10 rounded-full transition-colors" title="Share Dream"><UploadIcon /></button>
                        <button onClick={() => openModal('editDream', { dream: selectedDream })} className="p-2 text-purple-200 hover:text-white hover:bg-purple-500/10 rounded-full transition-colors" title="Edit Dream"><EditIcon /></button>
                        <button onClick={handleDelete} className="p-2 text-red-400 hover:text-white hover:bg-red-500/10 rounded-full transition-colors" title="Delete Dream"><TrashIcon /></button>
                    </div>
                </div>
            </div>
            
            {/* Main Content Grid */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-y-auto pr-2 md:pr-4 -mr-2 md:-mr-4">
                {/* Left Column: Overview */}
                <div className="lg:col-span-3 space-y-4">
                    {(!disableAIFeatures || hasImage || hasVideo) && (
                         <div className="bg-black/30 rounded-lg border border-purple-500/10">
                            {hasImage && hasVideo && (
                                <div className="flex border-b border-purple-500/20">
                                    <button onClick={() => setMediaView('image')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${mediaView === 'image' ? 'border-b-2 border-cyan-400 text-white' : 'text-purple-300 hover:text-white'}`}>
                                        <ImageIcon className="h-4 w-4" /> Image
                                    </button>
                                    <button onClick={() => setMediaView('video')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${mediaView === 'video' ? 'border-b-2 border-cyan-400 text-white' : 'text-purple-300 hover:text-white'}`}>
                                        <VideoIcon className="h-4 w-4" /> Video
                                    </button>
                                </div>
                            )}
                            <div className="relative group aspect-video flex items-center justify-center overflow-hidden">
                                {(mediaView === 'image' || !hasVideo) && (
                                    <>
                                        {hasImage ? <img src={selectedDream.imageUrl} alt={selectedDream.title} className="w-full h-full object-cover" /> : <p className="text-purple-400 text-center px-4">No image generated.</p>}
                                        {!disableAIFeatures && (
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <button onClick={() => openModal('generateImage', { dream: selectedDream })} disabled={dataSaverMode} className="flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                                                    <ImageIcon /> {hasImage ? 'Regenerate' : 'Generate Image'}
                                                </button>
                                                {hasImage && <button onClick={() => openModal('editImage', { dream: selectedDream })} className="flex items-center gap-2 text-sm bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg transition-colors"><EditIcon /> Edit</button>}
                                            </div>
                                        )}
                                    </>
                                )}
                                {mediaView === 'video' && hasVideo && (
                                    <>
                                        <video src={selectedDream.videoUrl} controls className="w-full h-full rounded-b-lg bg-black" />
                                         {!disableAIFeatures && (
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <button onClick={() => openModal('videoGeneration')} disabled={dataSaverMode} className="flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                                                    <VideoIcon /> Regenerate Video
                                                </button>
                                            </div>
                                         )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    <div>
                        <p className="text-gray-300 whitespace-pre-wrap">{selectedDream.description}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {selectedDream.tags.map(tag => {
                                const isDreamSign = dreamSigns.has(tag);
                                return (
                                    <button key={tag} onClick={() => !disableAIFeatures && openModal('symbolInterpretation', { symbol: tag, dream: selectedDream })} disabled={disableAIFeatures} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${isDreamSign ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20' : 'bg-purple-500/10 border-purple-500/30 text-purple-200 hover:bg-purple-500/20'} disabled:opacity-50`}>
                                        {isDreamSign && <SparklesIcon className="h-3 w-3" />}
                                        {tag}
                                        {!disableAIFeatures && <SearchIcon className="h-3 w-3 opacity-50" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {selectedDream.audioUrl && (
                        <div className="p-4 bg-black/30 rounded-lg border border-purple-500/10">
                            <h4 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2"><AudioWaveIcon className="h-5 w-5" /> Associated Audio Memo</h4>
                            <audio controls src={selectedDream.audioUrl} className="w-full" />
                        </div>
                    )}
                    {selectedDream.celestialContext && (
                        <div className="p-4 bg-black/30 rounded-lg border border-purple-500/10">
                            <h4 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2"><CometIcon /> Celestial Context</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs text-purple-300">
                                <div>{selectedDream.celestialContext.moonPhase.emoji}<br/>{selectedDream.celestialContext.moonPhase.phase}</div>
                                <div>☀️<br/>{selectedDream.celestialContext.sunSign}</div>
                                <div>🌙<br/>{selectedDream.celestialContext.moonSign}</div>
                                <div>☿<br/>{selectedDream.celestialContext.mercurySign}</div>
                                <div>♀<br/>{selectedDream.celestialContext.venusSign}</div>
                                <div>♂<br/>{selectedDream.celestialContext.marsSign}</div>
                            </div>
                            {!disableAIFeatures && (
                                <div className="mt-3">
                                    {selectedDream.celestialInterpretation ? (
                                        <blockquote className="text-sm text-gray-300 italic border-l-2 border-cyan-400/50 pl-2">{selectedDream.celestialInterpretation}</blockquote>
                                    ) : (
                                        <button onClick={handleGenerateCelestial} disabled={isGeneratingCelestial} className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white disabled:opacity-50">
                                            {isGeneratingCelestial ? <LoadingSpinner/> : <SparklesIcon/>} Get Astrological Interpretation
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* Right Column: Analysis */}
                <div className="lg:col-span-2 space-y-4">
                    {!disableAIFeatures && (
                        <>
                            <DreamChat />
                            <div className="p-4 bg-black/30 rounded-lg border border-purple-500/10">
                                <h4 className="text-lg font-semibold text-purple-200 mb-3">Analysis Tools</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => openModal('mindMap', { dream: selectedDream })} className="flex items-center gap-1.5 text-xs bg-indigo-800/50 hover:bg-indigo-800/80 text-indigo-200 px-3 py-1.5 rounded-md transition-colors"><MindMapIcon className="h-4 w-4" /> View Mind Map</button>
                                    <button onClick={() => openModal('dreamComparison', { dream: selectedDream })} className="flex items-center gap-1.5 text-xs bg-teal-800/50 hover:bg-teal-800/80 text-teal-200 px-3 py-1.5 rounded-md transition-colors"><CompareIcon className="h-4 w-4" /> Compare Dream</button>
                                    <button onClick={() => openModal('remixDream', { dream: selectedDream })} className="flex items-center gap-1.5 text-xs bg-orange-800/50 hover:bg-orange-800/80 text-orange-200 px-3 py-1.5 rounded-md transition-colors"><ShuffleIcon className="h-4 w-4" /> Remix Dream</button>
                                </div>
                            </div>
                            <div className="p-4 bg-black/30 rounded-lg border border-purple-500/10">
                                <h4 className="text-lg font-semibold text-purple-200 mb-3">Dream Series</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => openModal('linkDreams', { dream: selectedDream })} className="flex items-center gap-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-md transition-colors"><LinkIcon /> Manage Links</button>
                                    <button onClick={() => openModal('connectionSuggestions', { dream: selectedDream })} className="flex items-center gap-1.5 text-xs bg-purple-800/50 hover:bg-purple-800/80 text-purple-200 px-3 py-1.5 rounded-md transition-colors"><SparklesIcon /> AI Suggestions</button>
                                    {(selectedDream.linkedDreamIds?.length || 0) > 0 && <button onClick={() => openModal('dreamWeb', { dream: selectedDream })} className="flex items-center gap-1.5 text-xs bg-cyan-800/50 hover:bg-cyan-800/80 text-cyan-200 px-3 py-1.5 rounded-md transition-colors">View Web</button>}
                                    {(selectedDream.linkedDreamIds?.length || 0) > 0 && <button onClick={() => openModal('dreamWeave', { seriesDreams })} className="flex items-center gap-1.5 text-xs bg-pink-800/50 hover:bg-pink-800/80 text-pink-200 px-3 py-1.5 rounded-md transition-colors"><WeaveIcon className="h-3 w-3" /> Weave Series</button>}
                                </div>
                                {linkedDreams.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                        {linkedDreams.map(dream => <button key={dream.id} onClick={() => selectDream(dream)} className="text-sm text-purple-300 hover:text-white block w-full text-left p-1 rounded hover:bg-purple-500/10">&rarr; {dream.title}</button>)}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DreamDetail;