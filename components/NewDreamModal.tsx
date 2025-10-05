import React, { useState, useContext, FormEvent, useEffect, useRef } from 'react';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { ModalContext } from '../context/ModalContext';
import { analyzeDreamForMetadata, suggestDreamTitle, analyzeAudioMemo } from '../services/geminiService';
import { MOODS } from '../constants';
import { SparklesIcon, MicrophoneIcon, StarIcon, WandIcon, AudioWaveIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

// This is a browser-specific interface.
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

// Interfaces for Speech Recognition API events to avoid using 'any'
interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}
interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    readonly [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

// Interface for the SpeechRecognition object itself
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start: () => void;
    stop: () => void;
}


export const StarRatingInput: React.FC<{
    rating: number;
    setRating: (rating: number) => void;
    max?: number;
    disabled?: boolean;
}> = ({ rating, setRating, max = 5, disabled = false }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(max)].map((_, i) => {
                const starValue = i + 1;
                return (
                    <button
                        type="button"
                        key={starValue}
                        onClick={() => !disabled && setRating(starValue)}
                        onMouseEnter={() => !disabled && setHoverRating(starValue)}
                        className={`p-1 ${disabled ? 'cursor-not-allowed' : ''}`}
                        disabled={disabled}
                    >
                        <StarIcon
                            className={`h-6 w-6 transition-all duration-150 ${
                                (hoverRating || rating) >= starValue
                                    ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.7)]'
                                    : 'text-gray-600'
                            }`}
                        />
                    </button>
                );
            })}
        </div>
    );
};


const NewDreamModal: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const modalContext = useContext(ModalContext);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mood, setMood] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [summary, setSummary] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [lucidity, setLucidity] = useState(0);
    const [clarity, setClarity] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
    const [error, setError] = useState('');
    const [isAnalyzingMemo, setIsAnalyzingMemo] = useState(false);

    // State for speech-to-text
    const [isListening, setIsListening] = useState(false);
    const [speechError, setSpeechError] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // State for audio memo recording
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingError, setRecordingError] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    if (!dreamContext || !toastContext || !modalContext) return null;
    const { addDream, symbolLexicon } = dreamContext;
    const { addToast } = toastContext;
    const { closeModal } = modalContext;

    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            setSpeechError("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition: SpeechRecognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                setSpeechError(event.error);
            }
             setIsListening(false);
        };
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            
            if (finalTranscript.trim()) {
                const formattedTranscript = finalTranscript.charAt(0).toUpperCase() + finalTranscript.slice(1) + '. ';
                setDescription(prev => (prev ? prev.trim() + ' ' : '') + formattedTranscript);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setSpeechError('');
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Could not start speech recognition", e);
                setSpeechError("Could not start recording. Please try again.");
            }
        }
    };

    const handleToggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            setRecordingError('');
            setAudioUrl(null);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setAudioUrl(reader.result as string);
                    };
                    reader.readAsDataURL(audioBlob);
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                setRecordingError('Microphone access denied. Please check your browser permissions.');
            }
        }
    };
    
    const handleAnalyzeMemo = async () => {
        if (!audioUrl) return;

        setIsAnalyzingMemo(true);
        setError('');

        try {
            const match = audioUrl.match(/^data:(.+);base64,(.+)$/);
            if (!match) {
                throw new Error("Invalid audio data URL format.");
            }
            const mimeType = match[1];
            const base64Data = match[2];

            const result = await analyzeAudioMemo(base64Data, mimeType);
            
            setDescription(prev => prev ? `${prev.trim()} ${result.transcription}` : result.transcription);
            setMood(result.mood);
            addToast("Audio memo analyzed and transcribed!", 'success');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to analyze audio memo.';
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsAnalyzingMemo(false);
        }
    };

    const handleSuggestTitle = async () => {
        if (!description) return;
        setIsSuggestingTitle(true);
        setError('');
        try {
            const suggestedTitle = await suggestDreamTitle(description);
            setTitle(suggestedTitle);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to suggest title.');
        } finally {
            setIsSuggestingTitle(false);
        }
    };

    const handleAnalyze = async () => {
        if (!description) {
            setError('Please enter a description to analyze.');
            return;
        }
        setIsAnalyzing(true);
        setError('');
        try {
            const result = await analyzeDreamForMetadata(title, description, symbolLexicon);
            setMood(result.mood);
            setTags(result.tags);
            setSummary(result.summary);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleTagInputChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (title && description) {
            addDream({ title, description, mood: mood || 'Bizarre', tags, isRecurring, summary, lucidity, clarity, chatHistory: [], audioUrl: audioUrl || undefined });
            addToast('Dream saved successfully!', 'success');
            closeModal('newDream');
        } else {
             addToast('Please fill out a title and description.', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-modal-entry" onClick={() => closeModal('newDream')}>
            <div className="bg-gray-900/80 border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/20 w-full max-w-2xl p-6 md:p-8" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Record a New Dream</h2>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 md:pr-4 -mr-2 md:-mr-4">
                    <div className="flex items-start gap-4">
                        <div className="flex-grow">
                            <label htmlFor="title" className="block text-sm font-medium text-purple-200 mb-1">Title</label>
                            <div className="flex">
                                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-900/50 border border-purple-500/30 rounded-l-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all" required />
                                <button type="button" onClick={handleSuggestTitle} disabled={!description || isSuggestingTitle} className="px-3 py-2 bg-purple-500/20 border-y border-r border-purple-500/30 rounded-r-lg text-purple-200 hover:bg-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed" title="Suggest Title">{isSuggestingTitle ? <LoadingSpinner /> : <WandIcon />}</button>
                            </div>
                        </div>
                        <div className="pt-7">
                             <label htmlFor="is-recurring" className="flex items-center cursor-pointer">
                                <span className="mr-3 text-sm font-medium text-purple-200 whitespace-nowrap">Recurring</span>
                                <div className="relative"><input type="checkbox" id="is-recurring" className="sr-only" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} /><div className="block bg-gray-600/50 w-10 h-6 rounded-full"></div><div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isRecurring ? 'transform translate-x-4 bg-cyan-400' : ''}`}></div></div>
                            </label>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1"><label htmlFor="description" className="block text-sm font-medium text-purple-200">Description</label>
                            <button type="button" onClick={handleAnalyze} disabled={isAnalyzing || !description} className="flex items-center gap-1.5 text-sm text-purple-200 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{isAnalyzing ? <LoadingSpinner /> : <SparklesIcon />}Analyze</button>
                        </div>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all" required placeholder={isListening ? 'Listening...' : 'Type or record your dream here...'}/>
                         {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
                    </div>

                    <div className="p-3 bg-black/20 rounded-lg border border-purple-500/10 space-y-3">
                        <div className="flex items-center justify-around">
                             <button type="button" onClick={handleToggleRecording} className={`flex items-center gap-1.5 text-sm transition-colors ${isRecording ? 'text-red-400 hover:text-red-300' : 'text-purple-200 hover:text-white'}`}><AudioWaveIcon className={isRecording ? 'animate-pulse text-red-400' : ''} />{isRecording ? 'Stop Memo' : 'Record Memo'}</button>
                            <button type="button" onClick={toggleListening} disabled={!!speechError && !isListening} className={`flex items-center gap-1.5 text-sm transition-colors ${isListening ? 'text-red-400 hover:text-red-300' : 'text-purple-200 hover:text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}><MicrophoneIcon className={isListening ? 'animate-pulse text-red-400' : ''} />{isListening ? 'Stop' : 'Transcribe'}</button>
                        </div>
                        {speechError && <p className="text-xs text-red-400 text-center">{`Speech Error: ${speechError}`}</p>}
                        {recordingError && <p className="text-xs text-red-400 text-center">{recordingError}</p>}
                        {audioUrl && (
                            <div className="mt-2 space-y-2 animate-fade-in"><audio controls src={audioUrl} className="w-full" /><button type="button" onClick={handleAnalyzeMemo} disabled={isAnalyzingMemo} className="w-full flex items-center justify-center gap-2 text-sm text-purple-200 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50">{isAnalyzingMemo ? <LoadingSpinner /> : <SparklesIcon />}{isAnalyzingMemo ? 'Analyzing Memo...' : 'Analyze Memo with AI'}</button></div>
                        )}
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-purple-200">Lucidity</label><StarRatingInput rating={lucidity} setRating={setLucidity} /></div>
                        <div><label className="text-sm font-medium text-purple-200">Clarity</label><StarRatingInput rating={clarity} setRating={setClarity} /></div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">Primary Mood</label>
                        <div className="flex flex-wrap gap-2">
                            {MOODS.map(({label, emoji}) => (<button key={label} type="button" onClick={() => setMood(label)} className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 flex items-center gap-2 border ${mood === label ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-800/50 border-gray-700 hover:border-purple-500'}`}><span>{emoji}</span> {label}</button>))}
                        </div>
                    </div>
                    <div>
                         <label htmlFor="tags" className="block text-sm font-medium text-purple-200 mb-1">Tags</label>
                         <div className="flex flex-wrap gap-2 p-2 bg-gray-900/50 border border-purple-500/30 rounded-lg min-h-[42px]">
                            {tags.map(tag => (<div key={tag} className="bg-purple-500/20 text-purple-200 text-sm font-medium pl-3 pr-1 py-1 rounded-full flex items-center gap-1">{tag}<button type="button" onClick={() => removeTag(tag)} className="text-purple-200 hover:text-white">&times;</button></div>))}
                             <input id="tags" type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagInputChange} placeholder={tags.length === 0 ? "Add tags and press Enter..." : ""} className="bg-transparent focus:outline-none text-white flex-grow p-1"/>
                         </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => closeModal('newDream')} className="py-2 px-4 bg-gray-700/50 hover:bg-gray-700/80 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors shadow-[0_0_15px_rgba(168,85,247,0.5)]">Save Dream</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewDreamModal;