import { AudioScapeParams } from '../types';

export const getAudioScapeParams = (mood: string, tags: string[]): AudioScapeParams => {
    const defaultParams: Omit<AudioScapeParams, 'mood'> = {
        baseFrequency: 100, // G2
        lfoRate: 0.2,
        filterType: 'lowpass',
        filterFrequency: 500,
        hasRain: false,
        hasHeartbeat: false,
    };

    switch (mood) {
        case 'Joyful':
            defaultParams.baseFrequency = 110; // A2
            defaultParams.lfoRate = 0.5;
            defaultParams.filterFrequency = 2000;
            break;
        case 'Peaceful':
            defaultParams.baseFrequency = 82.41; // E2
            defaultParams.lfoRate = 0.1;
            defaultParams.filterFrequency = 800;
            break;
        case 'Anxious':
            defaultParams.baseFrequency = 185; // F#3
            defaultParams.lfoRate = 1.5;
            defaultParams.filterFrequency = 1200;
            defaultParams.hasHeartbeat = true;
            break;
        case 'Sad':
            defaultParams.baseFrequency = 73.42; // D2
            defaultParams.lfoRate = 0.08;
            defaultParams.filterFrequency = 300;
            defaultParams.hasRain = true;
            break;
        case 'Bizarre':
            defaultParams.baseFrequency = 155.56; // D#3
            defaultParams.lfoRate = 5;
            defaultParams.filterType = 'bandpass';
            defaultParams.filterFrequency = 2000;
            break;
        case 'Scary':
            defaultParams.baseFrequency = 61.74; // B1
            defaultParams.lfoRate = 0.5;
            defaultParams.filterFrequency = 250;
            defaultParams.hasHeartbeat = true;
            break;
        case 'Exciting':
            defaultParams.baseFrequency = 130.81; // C3
            defaultParams.lfoRate = 2.0;
            defaultParams.filterFrequency = 1500;
            break;
        default: // Neutral
            break;
    }

    if (tags.some(tag => ['rain', 'water', 'storm', 'ocean', 'crying'].includes(tag.toLowerCase()))) {
        defaultParams.hasRain = true;
    }

    return { mood, ...defaultParams };
};
