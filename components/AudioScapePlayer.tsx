import React, { useState, useEffect, useRef } from 'react';
import { AudioScapeParams } from '../types';
import { SpeakerOnIcon, SpeakerOffIcon } from './icons';

interface AudioScapePlayerProps {
    params: AudioScapeParams;
}

const AudioScapePlayer: React.FC<AudioScapePlayerProps> = ({ params }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const nodesRef = useRef<any[]>([]);

    const stopAudio = () => {
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            nodesRef.current.forEach(node => {
                if (node.stop) node.stop();
                if(node.disconnect) node.disconnect();
            });
            nodesRef.current = [];
            audioContextRef.current.close().then(() => {
                audioContextRef.current = null;
            });
        }
        setIsPlaying(false);
    };
    
    const playAudio = async () => {
        if (isPlaying) return;
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Resume context if it was suspended by browser autoplay policy
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        audioContextRef.current = audioContext;

        const mainGain = audioContext.createGain();
        mainGain.gain.setValueAtTime(0, audioContext.currentTime);
        mainGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 2); // Fade in
        mainGain.connect(audioContext.destination);
        nodesRef.current.push(mainGain);

        // Drone Oscillator
        const drone = audioContext.createOscillator();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(params.baseFrequency, audioContext.currentTime);
        
        // LFO for drone frequency
        const lfo = audioContext.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(params.lfoRate, audioContext.currentTime);
        const lfoGain = audioContext.createGain();
        lfoGain.gain.setValueAtTime(5, audioContext.currentTime); // LFO depth
        lfo.connect(lfoGain);
        lfoGain.connect(drone.frequency);
        
        // Filter
        const filter = audioContext.createBiquadFilter();
        filter.type = params.filterType;
        filter.frequency.setValueAtTime(params.filterFrequency, audioContext.currentTime);
        
        drone.connect(filter);
        filter.connect(mainGain);

        lfo.start();
        drone.start();
        nodesRef.current.push(lfo, lfoGain, drone, filter);

        // Rain sound
        if (params.hasRain) {
            const rainBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 2, audioContext.sampleRate);
            for (let channel = 0; channel < 2; channel++) {
                const nowBuffering = rainBuffer.getChannelData(channel);
                for (let i = 0; i < rainBuffer.length; i++) {
                    nowBuffering[i] = Math.random() * 2 - 1;
                }
            }
            const rainSource = audioContext.createBufferSource();
            rainSource.buffer = rainBuffer;
            rainSource.loop = true;
            const rainFilter = audioContext.createBiquadFilter();
            rainFilter.type = 'highpass';
            rainFilter.frequency.value = 1000;
            const rainGain = audioContext.createGain();
            rainGain.gain.value = 0.1;
            rainSource.connect(rainFilter).connect(rainGain).connect(mainGain);
            rainSource.start();
            nodesRef.current.push(rainSource, rainFilter, rainGain);
        }

        // Heartbeat sound
        if (params.hasHeartbeat) {
             const heartbeat = () => {
                if(!audioContextRef.current || audioContextRef.current.state === 'closed') return;
                const source = audioContextRef.current.createOscillator();
                const gain = audioContextRef.current.createGain();
                source.type = 'sine';
                source.frequency.setValueAtTime(50, audioContextRef.current.currentTime);
                gain.gain.setValueAtTime(1, audioContextRef.current.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.5);
                source.connect(gain).connect(mainGain);
                source.start();
                source.stop(audioContextRef.current.currentTime + 0.5);
            };
            const interval = setInterval(heartbeat, 1000);
            const intervalNode = { stop: () => clearInterval(interval), disconnect: () => {} };
            nodesRef.current.push(intervalNode);
        }

        setIsPlaying(true);
    };

    const toggleAudio = () => {
        if (isPlaying) {
            stopAudio();
        } else {
            playAudio();
        }
    };
    
    useEffect(() => {
        // Stop current sound and play new one if params change while playing
        if (isPlaying) {
            stopAudio();
            // A short delay to allow context to close properly before reopening
            setTimeout(() => playAudio(), 100);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    useEffect(() => {
        // Cleanup on unmount
        return () => stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="bg-black/20 p-4 rounded-lg border border-purple-500/10 flex items-center justify-between">
            <span className="text-sm text-purple-300 ml-2">Mood: <span className="capitalize font-semibold">{params.mood}</span></span>
            <button
                onClick={toggleAudio}
                className="p-4 rounded-full bg-purple-600/50 hover:bg-purple-600/80 transition-colors text-white"
            >
                {isPlaying ? <SpeakerOnIcon className="h-6 w-6" /> : <SpeakerOffIcon className="h-6 w-6" />}
            </button>
        </div>
    );
};

export default AudioScapePlayer;
