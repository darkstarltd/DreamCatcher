import { Achievement } from '../types';
import { calculateStreak } from './streaks';
import { BookOpenIcon, ChartBarIcon, CrystalBallIcon, PathIcon, ImageIcon, UsersIcon, EyeIcon } from '../components/icons';

export const ACTION_XP: { [key: string]: number } = {
    NEW_DREAM: 10,
    GENERATE_IMAGE: 20,
    GENERATE_VIDEO: 50,
    CONSULT_ORACLE: 15,
    COMPLETE_ODYSSEY_STEP: 25,
    COMPLETE_ODYSSEY: 100,
    SHARE_DREAM: 15,
};

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_dream',
        name: 'First Steps',
        description: 'Record your very first dream.',
        icon: BookOpenIcon,
        xp: 25,
        check: (context) => context.dreams.length >= 1,
    },
    {
        id: 'journal_10',
        name: 'Novice Journalist',
        description: 'Record 10 dreams in your journal.',
        icon: BookOpenIcon,
        xp: 50,
        check: (context) => context.dreams.length >= 10,
    },
    {
        id: 'journal_50',
        name: 'Adept Journalist',
        description: 'Record 50 dreams in your journal.',
        icon: BookOpenIcon,
        xp: 100,
        check: (context) => context.dreams.length >= 50,
    },
    {
        id: 'streak_7',
        name: 'Consistent Dreamer',
        description: 'Achieve a 7-day journaling streak.',
        icon: ChartBarIcon,
        xp: 75,
        check: (context) => calculateStreak(context.dreams) >= 7,
    },
    {
        id: 'first_totem',
        name: 'Totem Awakened',
        description: 'Discover your first dream totem.',
        icon: CrystalBallIcon,
        xp: 50,
        check: (context) => context.totems.length > 0,
    },
     {
        id: 'first_image',
        name: 'Dream Weaver',
        description: 'Generate your first AI dream image.',
        icon: ImageIcon,
        xp: 20,
        check: (context) => context.dreams.some((d: any) => d.imageUrl),
    },
     {
        id: 'first_odyssey',
        name: 'The Journey Begins',
        description: 'Embark on your first Dream Odyssey.',
        icon: PathIcon,
        xp: 40,
        check: (context) => context.odysseys.length > 0,
    },
    {
        id: 'odyssey_complete',
        name: 'Odyssey Complete',
        description: 'Complete a full Dream Odyssey.',
        icon: PathIcon,
        xp: 150,
        check: (context) => context.odysseys.some((o: any) => o.status === 'completed'),
    },
    {
        id: 'oracle_consult',
        name: 'Seeker of Truth',
        description: 'Consult the Oracle for the first time.',
        icon: EyeIcon,
        xp: 15,
        check: (context) => context.savedReadings.length > 0,
    },
     {
        id: 'share_dream',
        name: 'Circle Initiated',
        description: 'Share a dream with your Dream Circle.',
        icon: UsersIcon,
        xp: 20,
        check: (context) => context.dreams.some((d: any) => d.sharedWith && d.sharedWith.length > 0),
    },
];

export const XP_THRESHOLDS = [0, 100, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000];

export const DREAMER_TITLES = [
    { level: 1, title: 'Novice Dreamer' },
    { level: 2, title: 'Dream Explorer' },
    { level: 3, title: 'Oneironaut' },
    { level: 5, title: 'Symbol Seeker' },
    { level: 7, title: 'Lucid Architect' },
    { level: 10, title: 'Master of the Subconscious' },
];

export const calculateLevel = (xp: number) => {
    let level = 1;
    for (let i = 1; i < XP_THRESHOLDS.length; i++) {
        if (xp >= XP_THRESHOLDS[i]) {
            level = i + 1;
        } else {
            break;
        }
    }
    const currentLevelXP = XP_THRESHOLDS[level - 1];
    const nextLevelXP = XP_THRESHOLDS[level] || Infinity;
    const progress = nextLevelXP === Infinity ? 100 : Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
    
    return { level, progress, currentLevelXP, nextLevelXP };
};

export const getDreamerTitle = (level: number) => {
    let title = 'Dreamer';
    for (const t of [...DREAMER_TITLES].reverse()) {
        if (level >= t.level) {
            title = t.title;
            break;
        }
    }
    return title;
};
