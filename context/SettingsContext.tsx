import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { LinkedProfile } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SettingsContextType {
    dreamSigns: Set<string>;
    addDreamSign: (sign: string) => void;
    removeDreamSign: (sign: string) => void;
    autoGenerate: boolean;
    setAutoGenerate: React.Dispatch<React.SetStateAction<boolean>>;
    hasCompletedOnboarding: boolean;
    setHasCompletedOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
    userGoal: string;
    setUserGoal: React.Dispatch<React.SetStateAction<string>>;
    aiPersona: string;
    setAiPersona: React.Dispatch<React.SetStateAction<string>>;
    linkedProfiles: LinkedProfile[];
    addLinkedProfile: (profile: Omit<LinkedProfile, 'id'>) => void;
    removeLinkedProfile: (profileId: string) => void;
    disableAIFeatures: boolean;
    setDisableAIFeatures: React.Dispatch<React.SetStateAction<boolean>>;
    dataSaverMode: boolean;
    setDataSaverMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [signs, setSigns] = useLocalStorage<string[]>('dreamSigns', []);
    const dreamSigns = new Set(signs);

    const [autoGenerate, setAutoGenerate] = useLocalStorage<boolean>('autoGenerate', false);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage<boolean>('hasCompletedOnboarding', false);
    const [userGoal, setUserGoal] = useLocalStorage<string>('userGoal', '');
    const [aiPersona, setAiPersona] = useLocalStorage<string>('aiPersona', 'psychoanalyst');
    const [linkedProfiles, setLinkedProfiles] = useLocalStorage<LinkedProfile[]>('linkedProfiles', []);
    const [disableAIFeatures, setDisableAIFeatures] = useLocalStorage<boolean>('disableAIFeatures', false);
    const [dataSaverMode, setDataSaverMode] = useLocalStorage<boolean>('dataSaverMode', false);

    const addDreamSign = useCallback((sign: string) => {
        setSigns(prev => Array.from(new Set([...prev, sign])));
    }, [setSigns]);

    const removeDreamSign = useCallback((sign: string) => {
        setSigns(prev => prev.filter(s => s !== sign));
    }, [setSigns]);

    const addLinkedProfile = useCallback((profile: Omit<LinkedProfile, 'id'>) => {
        const newProfile = { ...profile, id: `profile-${Date.now()}` };
        setLinkedProfiles(prev => [...prev, newProfile]);
    }, [setLinkedProfiles]);

    const removeLinkedProfile = useCallback((profileId: string) => {
        setLinkedProfiles(prev => prev.filter(p => p.id !== profileId));
    }, [setLinkedProfiles]);

    return (
        <SettingsContext.Provider value={{
            dreamSigns, addDreamSign, removeDreamSign,
            autoGenerate, setAutoGenerate,
            hasCompletedOnboarding, setHasCompletedOnboarding,
            userGoal, setUserGoal,
            aiPersona, setAiPersona,
            linkedProfiles, addLinkedProfile, removeLinkedProfile,
            disableAIFeatures, setDisableAIFeatures,
            dataSaverMode, setDataSaverMode,
        }}>
            {children}
        </SettingsContext.Provider>
    );
};