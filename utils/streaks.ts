import { Dream } from '../types';

export const calculateStreak = (dreams: Dream[]): number => {
    if (dreams.length === 0) {
        return 0;
    }

    // Use Date.UTC to parse dates for timezone safety, avoiding `new Date(string)` issues.
    const uniqueTimestamps = new Set(dreams.map(d => {
        const [y, m, day] = d.date.split('-').map(Number);
        return Date.UTC(y, m - 1, day);
    }));

    if (uniqueTimestamps.size === 0) {
        return 0;
    }
    
    const sortedTimestamps = Array.from(uniqueTimestamps).sort((a, b) => b - a);

    const today = new Date();
    const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const yesterdayUTC = todayUTC - (24 * 60 * 60 * 1000);

    const lastDreamUTC = sortedTimestamps[0];
    
    // Check if the most recent dream is from today or yesterday (in UTC)
    if (lastDreamUTC !== todayUTC && lastDreamUTC !== yesterdayUTC) {
        return 0; // Streak is broken if the last entry wasn't today or yesterday
    }
    
    let streak = 1;
    if (sortedTimestamps.length < 2) {
        return streak;
    }
    
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Iterate through the sorted timestamps to find the length of the consecutive day sequence.
    for (let i = 0; i < sortedTimestamps.length - 1; i++) {
        const currentTs = sortedTimestamps[i];
        const nextTs = sortedTimestamps[i + 1];

        if (currentTs - nextTs === oneDay) {
            streak++;
        } else {
            // As soon as a non-consecutive day is found, the streak is broken.
            break;
        }
    }

    return streak;
};

export const calculateLongestStreak = (dreams: Dream[]): number => {
    if (dreams.length < 2) {
        return dreams.length;
    }

    const uniqueTimestamps = new Set(dreams.map(d => {
        const [y, m, day] = d.date.split('-').map(Number);
        return Date.UTC(y, m - 1, day);
    }));

    if (uniqueTimestamps.size < 2) {
        return uniqueTimestamps.size;
    }

    const sortedTimestamps = Array.from(uniqueTimestamps).sort((a, b) => a - b);
    
    let longestStreak = 1;
    let currentStreak = 1;
    const oneDay = 24 * 60 * 60 * 1000;

    for (let i = 1; i < sortedTimestamps.length; i++) {
        if (sortedTimestamps[i] - sortedTimestamps[i - 1] === oneDay) {
            currentStreak++;
        } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
        }
    }

    return Math.max(longestStreak, currentStreak);
};