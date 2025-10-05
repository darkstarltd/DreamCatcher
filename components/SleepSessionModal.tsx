import React, { useState, useEffect, useRef, useContext } from 'react';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { SleepFragment, SleepSession } from '../types';
import { MicrophoneIcon } from './icons';

interface SleepSessionModalProps {
    onClose: () => void;
}

// Volume threshold for triggering a recording (can be adjusted)
const VOLUME_THRESHOLD = -40; // in dB
const RECORDING_DURATION_MS = 15000; // 15 seconds

const SleepSessionModal: React.FC<SleepSessionModalProps> = ({ onClose }) => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);

    const [status, setStatus] = useState('Initializing...');
    const [error, setError] = useState('');
    const [isRecordingFragment, setIsRecordingFragment] = useState(false);
    const [isListeningStarted, setIsListeningStarted] = useState(false);
    
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const sessionRef = useRef<SleepSession>({
        id: `ss-${Date.now()}`,
        startTime: Date.now(),
        endTime: 0,
        fragments: [],
    });

    if (!dreamContext || !toastContext) return null;
    const { addSleepSession } = dreamContext;
    const { addToast } = toastContext;

    const cleanup = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        streamRef.current?.getTracks().forEach(track => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        mediaRecorderRef.current = null;
    };

    const stopSession = () => {
        cleanup();
        sessionRef.current.endTime = Date.now();
        if(sessionRef.current.fragments.length > 0) {
            addSleepSession(sessionRef.current);
            addToast(`Sleep session saved with ${sessionRef.current.fragments.length} fragments.`, 'success');
        } else {
            addToast('Sleep session ended. No audio fragments were captured.', 'info');
        }
        onClose();
    };

    const startRecordingFragment = () => {
        if (!mediaRecorderRef.current || isRecordingFragment || mediaRecorderRef.current.state === 'recording') return;

        setIsRecordingFragment(true);
        const audioChunks: Blob[] = [];
        
        mediaRecorderRef.current.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        
        mediaRecorderRef.current.onstop = () => {
            setIsRecordingFragment(false);
            if (audioChunks.length === 0) return;
            const audioBlob = new Blob(audioChunks, { type: mediaRecorderRef.current?.mimeType });
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const newFragment: SleepFragment = {
                    id: `frag-${Date.now()}`,
                    audioUrl: base64String,
                    mimeType: audioBlob.type,
                };
                sessionRef.current.fragments.push(newFragment);
            };
            reader.readAsDataURL(audioBlob);
        };

        mediaRecorderRef.current.start();
        setTimeout(() => {
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        }, RECORDING_DURATION_MS);
    };
    
    const handleStartListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            analyser.minDecibels = -90;
            analyser.maxDecibels = -10;
            analyser.smoothingTimeConstant = 0.85;
            source.connect(analyser);
            analyserRef.current = analyser;

            mediaRecorderRef.current = new MediaRecorder(stream);
            
            setStatus('Listening for sounds...');
            setIsListeningStarted(true);

            const monitor = () => {
                if (!analyserRef.current) return;
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                const dB = 20 * Math.log10(average / 255);

                if (dB > VOLUME_THRESHOLD) {
                     startRecordingFragment();
                }
                animationFrameRef.current = requestAnimationFrame(monitor);
            };
            monitor();

        } catch (err) {
            console.error("Error setting up audio:", err);
            setError('Microphone access denied. Please check browser permissions and refresh.');
            setStatus('Error');
            setIsListeningStarted(true); // Show error state in main view
        }
    };
    
    useEffect(() => {
        // Cleanup on unmount
        return () => cleanup();
    }, []);

    const renderContent = () => {
        if (!isListeningStarted) {
            return (
                <>
                    <h2 className="text-3xl font-bold text-purple-300">Ready to Listen</h2>
                    <MicrophoneIcon className="h-16 w-16 mx-auto text-purple-400" />
                    <p className="text-purple-300">Click the button below to activate the microphone and start monitoring for sleep sounds.</p>
                     <button
                        onClick={handleStartListening}
                        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors"
                    >
                        Start Listening
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                    >
                        Cancel
                    </button>
                </>
            );
        }
        
        return (
            <>
                <h2 className="text-3xl font-bold text-purple-300">Sleep Session in Progress</h2>
                <div className="w-24 h-24 mx-auto rounded-full bg-purple-900/50 flex items-center justify-center border-4 border-purple-500/30">
                    <div className={`w-16 h-16 rounded-full transition-colors duration-300 ${isRecordingFragment ? 'bg-red-500 animate-pulse' : 'bg-purple-600'}`}></div>
                </div>
                <div className="h-10">
                    {error ? (
                        <p className="text-red-400">{error}</p>
                    ) : (
                        <div>
                            <p className="text-xl text-white">{status}</p>
                            <p className="text-purple-300">{isRecordingFragment ? "Fragment recording..." : "Listening..."}</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={stopSession}
                    className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold transition-colors"
                >
                    Stop Session
                </button>
            </>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-lg p-8 text-center space-y-6">
               {renderContent()}
            </div>
        </div>
    );
};

export default SleepSessionModal;