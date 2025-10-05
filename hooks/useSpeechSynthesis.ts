import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synth = window.speechSynthesis;

    const speak = useCallback((text: string) => {
        if (!synth) {
            console.warn("Speech synthesis is not supported in this browser.");
            return;
        }
        if (synth.speaking) {
            synth.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        synth.speak(utterance);
    }, [synth]);

    const cancel = useCallback(() => {
        if (synth) {
            synth.cancel();
            setIsSpeaking(false);
        }
    }, [synth]);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (synth) {
                synth.cancel();
            }
        };
    }, [synth]);

    return { isSpeaking, speak, cancel };
};
