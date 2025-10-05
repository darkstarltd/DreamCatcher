import { Quest, ActionType, Dream, StoredQuest } from '../types';

const getTodaysDateKey = (): string => {
    // We use UTC date to avoid timezone issues with quest resets
    const now = new Date();
    return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()).toISOString().split('T')[0];
}

export const QUEST_POOL: Quest[] = [
    {
        id: 'record_dream',
        title: 'Daily Journaling',
        description: 'Record at least one new dream.',
        xp: 20,
        check: (action: ActionType) => action === 'NEW_DREAM'
    },
    {
        id: 'generate_image',
        title: 'Visualizer',
        description: 'Generate an AI image for any dream.',
        xp: 15,
        check: (action: ActionType) => action === 'GENERATE_IMAGE'
    },
    {
        id: 'interpret_symbol',
        title: 'Symbol Seeker',
        description: 'Use the AI to interpret a symbol.',
        xp: 15,
        check: (action: ActionType) => action === 'INTERPRET_SYMBOL'
    },
    {
        id: 'consult_guide',
        title: 'Seek Guidance',
        description: 'Ask a question to your AI guide.',
        xp: 10,
        check: (action: ActionType) => action === 'CONSULT_GUIDE'
    },
    {
        id: 'high_clarity',
        title: 'Crystal Clear',
        description: 'Record a dream with a clarity score of 4 or more.',
        xp: 20,
        check: (action, payload) => {
            if (action !== 'NEW_DREAM') return false;
            const dream = payload as Dream;
            return dream.clarity >= 4;
        }
    },
    {
        id: 'high_lucidity',
        title: 'Conscious Explorer',
        description: 'Record a dream with a lucidity score of 4 or more.',
        xp: 25,
        check: (action, payload) => {
            if (action !== 'NEW_DREAM') return false;
            const dream = payload as Dream;
            return dream.lucidity >= 4;
        }
    },
];

export const generateDailyQuests = (): StoredQuest[] => {
    const shuffled = [...QUEST_POOL].sort(() => 0.5 - Math.random());
    const selectedQuests = shuffled.slice(0, 3); // Get 3 random quests
    return selectedQuests.map(quest => ({
        id: quest.id,
        status: 'pending',
    }));
};