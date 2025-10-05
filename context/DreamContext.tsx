import React, { useState, useEffect, useCallback, createContext, ReactNode, useContext, useMemo } from 'react';
import { Dream, Totem, SymbolEntry, IncubationSession, SleepSession, SavedOracleReading, Odyssey, ActionType, Achievement, DreamSeries, StoredQuest, DreamContextType } from '../types';
import { ToastContext } from './ToastContext';
import { getCelestialContextForDate } from '../utils/celestial';
import { ACHIEVEMENTS, ACTION_XP } from '../utils/gamification';
import { generateDailyQuests, QUEST_POOL } from '../utils/quests';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calculateStreak, calculateLongestStreak } from '../utils/streaks';
import { generateImageForTotem } from '../services/geminiService';

const getTodaysDateKey = (): string => {
    const now = new Date();
    return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()).toISOString().split('T')[0];
}

export const DreamContext = createContext<DreamContextType | null>(null);

export const DreamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const toastContext = useContext(ToastContext);

    const [dreams, setDreams] = useLocalStorage<Dream[]>('dreams', []);
    const [totems, setTotems] = useLocalStorage<Totem[]>('totems', []);
    const [symbolLexicon, setSymbolLexicon] = useLocalStorage<SymbolEntry[]>('symbolLexicon', []);
    const [incubationSessions, setIncubationSessions] = useLocalStorage<IncubationSession[]>('incubationSessions', []);
    const [sleepSessions, setSleepSessions] = useLocalStorage<SleepSession[]>('sleepSessions', []);
    const [guideChatHistory, setGuideChatHistory] = useLocalStorage<any[]>('guideChatHistory', []);
    const [savedReadings, setSavedReadings] = useLocalStorage<SavedOracleReading[]>('savedReadings', []);
    const [odysseys, setOdysseys] = useLocalStorage<Odyssey[]>('odysseys', []);
    const [dreamSeries, setDreamSeries] = useLocalStorage<DreamSeries[]>('dreamSeries', []);
    
    // Gamification State
    const [userXP, setUserXP] = useLocalStorage<number>('userXP', 0);
    const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage<{ [key: string]: string }>('unlockedAchievements', {});
    const [dailyQuests, setDailyQuests] = useLocalStorage<StoredQuest[]>('dailyQuests', []);
    const [lastQuestDate, setLastQuestDate] = useLocalStorage<string>('lastQuestDate', '');
    
    const [selectedDream, setSelectedDream] = useState<Dream | null>(null);

    const currentStreak = useMemo(() => calculateStreak(dreams), [dreams]);
    const longestStreak = useMemo(() => calculateLongestStreak(dreams), [dreams]);
    
    // Daily Quest Generation
    useEffect(() => {
        const todayKey = getTodaysDateKey();
        if (lastQuestDate !== todayKey) {
            const newQuests = generateDailyQuests();
            setDailyQuests(newQuests);
            setLastQuestDate(todayKey);
        }
    }, [lastQuestDate, setDailyQuests, setLastQuestDate]);

    const runAchievementChecks = useCallback(() => {
        const contextForChecks = { dreams, totems, symbolLexicon, incubationSessions, sleepSessions, guideChatHistory, savedReadings, odysseys, dailyQuests };
        setUnlockedAchievements(prevUnlocked => {
            let newAchievementsFound = false;
            const newUnlocked = { ...prevUnlocked };

            for (const achievement of ACHIEVEMENTS) {
                if (!newUnlocked[achievement.id]) {
                    if (achievement.check(contextForChecks)) {
                        newUnlocked[achievement.id] = new Date().toISOString();
                        toastContext?.addToast(`Achievement Unlocked: ${achievement.name}`, 'achievement');
                        setUserXP(xp => xp + achievement.xp);
                        newAchievementsFound = true;
                    }
                }
            }
            return newAchievementsFound ? newUnlocked : prevUnlocked;
        });
    }, [
        dreams, totems, symbolLexicon, incubationSessions, sleepSessions, guideChatHistory,
        savedReadings, odysseys, dailyQuests,
        setUnlockedAchievements, toastContext, setUserXP
    ]);
    
    // Effect to check for state-based achievements when data changes
    useEffect(() => {
        runAchievementChecks();
    }, [runAchievementChecks]);

    const triggerAction = useCallback((action: ActionType, payload?: any) => {
        if (ACTION_XP[action]) {
            setUserXP(xp => xp + ACTION_XP[action]);
        }
        
        // Check for quest completion
        setDailyQuests(prevQuests => {
            let questsUpdated = false;
            // The `context` parameter for quest checks is currently unused by any quests in QUEST_POOL.
            // Passing an empty object is safe and drastically reduces dependencies for this callback,
            // improving performance and preventing potential re-render loops.
            const contextForChecks = {};
            const newQuests = prevQuests.map(quest => {
                if (quest.status === 'pending') {
                    const questDefinition = QUEST_POOL.find(q => q.id === quest.id);
                    if (questDefinition && questDefinition.check(action, payload, contextForChecks)) {
                        setUserXP(xp => xp + questDefinition.xp);
                        toastContext?.addToast(`Quest Complete: ${questDefinition.title} (+${questDefinition.xp} XP)`, 'achievement');
                        questsUpdated = true;
                        return { ...quest, status: 'completed' as const };
                    }
                }
                return quest;
            });
            return questsUpdated ? newQuests : prevQuests;
        });
    }, [setUserXP, setDailyQuests, toastContext]);

    // Effect to keep selectedDream synchronized with the main dreams list.
    // Handles initial selection and updates after an edit. Deletion is handled in deleteDream.
    useEffect(() => {
        // On initial load, or if selection is cleared, select the first dream.
        if (!selectedDream && dreams.length > 0) {
            setSelectedDream(dreams[0]);
            return;
        }

        // If a dream is selected, ensure it's in sync with the main dreams list.
        // This is crucial for when a dream is edited, as its object reference changes.
        if (selectedDream) {
            const currentVersionInList = dreams.find(d => d.id === selectedDream.id);
            if (currentVersionInList && currentVersionInList !== selectedDream) {
                setSelectedDream(currentVersionInList);
            }
        }
    }, [dreams, selectedDream]);


    const selectDream = (dream: Dream) => {
        setSelectedDream(dream);
    };

    const addDream = useCallback((dreamData: Omit<Dream, 'id' | 'date'>): Dream => {
        const today = new Date();
        const newDream: Dream = {
            id: `dream-${Date.now()}`,
            date: today.toISOString().split('T')[0],
            celestialContext: getCelestialContextForDate(today),
            ...dreamData,
        };
        setDreams(prev => [newDream, ...prev]);
        setSelectedDream(newDream);
        triggerAction('NEW_DREAM', newDream);
        return newDream;
    }, [setDreams, triggerAction]);

    const addMemo = useCallback((memoText: string): Dream => {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];

        const memoTitleWords = memoText.split(' ');
        const shortTitle = memoTitleWords.slice(0, 5).join(' ');
        const title = `Memo: ${shortTitle}${memoTitleWords.length > 5 ? '...' : ''}`;

        const newDream: Dream = {
            id: `dream-${Date.now()}`,
            date: dateString,
            title: title,
            description: memoText,
            summary: memoText.substring(0, 100),
            mood: 'Neutral',
            tags: ['memo'],
            isRecurring: false,
            lucidity: 0,
            clarity: 0,
            chatHistory: [],
            isMemo: true,
            celestialContext: getCelestialContextForDate(today),
        };
        setDreams(prev => [newDream, ...prev]);
        setSelectedDream(newDream);
        triggerAction('NEW_DREAM', newDream);
        return newDream;
    }, [setDreams, triggerAction]);

    const updateDream = useCallback((dreamId: string, updates: Partial<Omit<Dream, 'id'>> | ((prevDream: Dream) => Partial<Omit<Dream, 'id'>>)) => {
        setDreams(prevDreams => {
            return prevDreams.map(d => {
                if (d.id === dreamId) {
                    const newValues = typeof updates === 'function' ? updates(d) : updates;
                    return { ...d, ...newValues };
                }
                return d;
            });
        });
    }, [setDreams]);

    const deleteDream = useCallback((dreamId: string) => {
        const dreamIndex = dreams.findIndex(d => d.id === dreamId);
        if (dreamIndex === -1) return;
    
        const newDreams = dreams.filter(d => d.id !== dreamId);
    
        // If the deleted dream was the one selected, pick a new one intelligently.
        if (selectedDream?.id === dreamId) {
            if (newDreams.length === 0) {
                setSelectedDream(null);
            } else {
                // Select the dream at the same index, or the new last dream if it was the last one.
                const nextIndex = Math.min(dreamIndex, newDreams.length - 1);
                setSelectedDream(newDreams[nextIndex]);
            }
        }
        
        setDreams(newDreams);
    }, [dreams, selectedDream, setDreams, setSelectedDream]);

    const addSymbolToLexicon = useCallback((entry: Omit<SymbolEntry, 'dreamIds'> & { dreamIds?: string[] }) => {
        setSymbolLexicon(prev => {
            const existing = prev.find(e => e.symbol.toLowerCase() === entry.symbol.toLowerCase());
            if (existing) {
                return prev.map(e => e.symbol.toLowerCase() === entry.symbol.toLowerCase() ? { ...e, dreamIds: Array.from(new Set([...e.dreamIds, ...(entry.dreamIds || [])])) } : e);
            }
            return [...prev, { ...entry, dreamIds: entry.dreamIds || [] }];
        });
    }, [setSymbolLexicon]);
    
     const updateSymbolInLexicon = useCallback((symbol: string, newInterpretation: string) => {
        setSymbolLexicon(prev => prev.map(e => e.symbol.toLowerCase() === symbol.toLowerCase() ? { ...e, interpretation: newInterpretation } : e));
    }, [setSymbolLexicon]);

    const deleteSymbolFromLexicon = useCallback((symbol: string) => {
        setSymbolLexicon(prev => prev.filter(e => e.symbol.toLowerCase() !== symbol.toLowerCase()));
    }, [setSymbolLexicon]);
    
    const updateTotem = useCallback((totemId: string, updates: Partial<Omit<Totem, 'id'>>) => {
        setTotems(prev => prev.map(t => t.id === totemId ? { ...t, ...updates } : t));
    }, [setTotems]);

    const addIncubationSession = useCallback((sessionData: Omit<IncubationSession, 'id' | 'date'>): IncubationSession => {
        const newSession: IncubationSession = {
            id: `is-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            ...sessionData
        };
        setIncubationSessions(prev => [newSession, ...prev]);
        return newSession;
    }, [setIncubationSessions]);
    
    const updateIncubationSession = useCallback((sessionId: string, updates: Partial<Omit<IncubationSession, 'id'>>) => {
        setIncubationSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates } : s));
    }, [setIncubationSessions]);
    
    const addSleepSession = useCallback((session: SleepSession) => {
        setSleepSessions(prev => [session, ...prev]);
    }, [setSleepSessions]);

    const updateSleepSession = useCallback((sessionId: string, updates: Partial<Omit<SleepSession, 'id'>>) => {
        setSleepSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates } : s));
    }, [setSleepSessions]);
    
    const addSavedReading = useCallback((reading: Omit<SavedOracleReading, 'id' | 'date'>) => {
        const newReading: SavedOracleReading = {
            id: `read-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            ...reading,
        };
        setSavedReadings(prev => [newReading, ...prev]);
        triggerAction('CONSULT_ORACLE');
    }, [setSavedReadings, triggerAction]);

    const addOdyssey = useCallback((odysseyData: Omit<Odyssey, 'id'>) => {
        let finalOdysseyData = { ...odysseyData };
        if (finalOdysseyData.centralTotemId.startsWith('new-totem-')) {
            const newTotemName = finalOdysseyData.centralTotemId.replace('new-totem-', '').replace(/-/g, ' ');
            const newTotem: Totem = {
                id: `totem-${Date.now()}-${newTotemName.replace(/\s+/g, '-')}`,
                name: newTotemName,
                description: 'A guide that emerged from your subconscious to lead this Odyssey.',
                imagePrompt: `A mystical, symbolic representation of ${newTotemName}, a spiritual guide.`,
                dreamIds: [],
            };
            setTotems(prev => [newTotem, ...prev]);
            finalOdysseyData.centralTotemId = newTotem.id;

            // Generate image for the new totem in the background
            generateImageForTotem(newTotem.imagePrompt)
                .then(imageUrl => updateTotem(newTotem.id, { imageUrl }))
                .catch(err => {
                    console.error("Failed to generate image for new odyssey totem", err);
                    toastContext?.addToast(`Image generation failed for totem: ${newTotem.name}`, 'error');
                });
        }
        
        // Deactivate any existing active odyssey
        setOdysseys(prev => prev.map(o => o.status === 'active' ? { ...o, status: 'completed' } : o));

        const newOdyssey: Odyssey = {
            id: `ody-${Date.now()}`,
            ...finalOdysseyData,
        };
        setOdysseys(prev => [newOdyssey, ...prev]);
    }, [setOdysseys, setTotems, updateTotem, toastContext]);

    const updateOdyssey = useCallback((odysseyId: string, updates: Partial<Omit<Odyssey, 'id'>>) => {
        setOdysseys(prev => prev.map(o => o.id === odysseyId ? { ...o, ...updates } : o) as Odyssey[]);
    }, [setOdysseys]);

    return (
        <DreamContext.Provider value={{
            dreams, setDreams, addDream, updateDream, deleteDream,
            selectedDream, setSelectedDream, selectDream,
            symbolLexicon, addSymbolToLexicon, updateSymbolInLexicon, deleteSymbolFromLexicon,
            totems, setTotems, updateTotem,
            addMemo,
            incubationSessions, addIncubationSession, updateIncubationSession,
            sleepSessions, addSleepSession, updateSleepSession,
            guideChatHistory, setGuideChatHistory,
            savedReadings, addSavedReading,
            odysseys, addOdyssey, updateOdyssey,
            dreamSeries, setDreamSeries,
            userXP, unlockedAchievements, dailyQuests, triggerAction,
            currentStreak, longestStreak,
        }}>
            {children}
        </DreamContext.Provider>
    );
};