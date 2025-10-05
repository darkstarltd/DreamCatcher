import React from 'react';
import { Modality } from "@google/genai";

export type View = 'journal' | 'dashboard' | 'calendar' | 'scape' | 'vault' | 'odyssey' | 'incubation' | 'somniloquy' | 'divination' | 'celestial' | 'guide' | 'oneirogen' | 'numerology' | 'audioscape' | 'psyche' | 'circle' | 'path' | 'echo' | 'horoscope' | 'series' | 'store' | 'settings';

export type ActionType = 'NEW_DREAM' | 'GENERATE_IMAGE' | 'GENERATE_VIDEO' | 'CONSULT_ORACLE' | 'COMPLETE_ODYSSEY_STEP' | 'COMPLETE_ODYSSEY' | 'SHARE_DREAM' | 'STATE_CHANGE' | 'INTERPRET_SYMBOL' | 'CONSULT_GUIDE' | 'UPGRADE_PLAN' | 'PURCHASE_ESSENCE';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    xp: number;
    check: (context: any) => boolean;
}


export interface CelestialContext {
    moonPhase: {
        phase: string;
        emoji: string;
    };
    sunSign: string;
    moonSign: string;
    mercurySign: string;
    venusSign: string;
    marsSign: string;
}

export interface InDepthHoroscope {
    period: 'today' | 'weekly' | 'monthly';
    sunSign: string;
    overallTheme: string;
    keyDreamSymbols: string[];
    emotionalLandscape: string;
    actionableAdvice: string;
}

export interface NumerologyReport {
    lifePath: { number: number; analysis: string; };
    expression: { number: number; analysis: string; };
    soulUrge: { number: number; analysis: string; };
    integratedSummary: string;
}

export interface Dream {
    id: string;
    date: string;
    title: string;
    description: string;
    mood: string;
    summary: string;
    tags: string[];
    isRecurring: boolean;
    lucidity: number;
    clarity: number;
    chatHistory: ChatMessage[];
    isAIGenerated?: boolean;
    imageUrl?: string | null;
    videoUrl?: string | null;
    audioUrl?: string | null;
    linkedDreamIds?: string[];
    isMemo?: boolean;
    sharedWith?: string[];
    celestialContext?: CelestialContext;
    celestialInterpretation?: string;
}

export interface ChatPart {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: ChatPart[];
}

export interface Totem {
    id: string;
    name: string;
    description: string;
    imagePrompt: string;
    imageUrl?: string;
    dreamIds: string[];
    detailedInterpretation?: string;
}

export interface SymbolEntry {
    symbol: string;
    interpretation: string;
    dreamIds: string[];
}

export interface IncubationSession {
    id: string;
    date: string;
    intention: string;
    keywords: string[];
    guidedScript: string;
    focusImagePrompt: string;
    focusImageUrl?: string;
    isComplete?: boolean;
    relatedDreamId?: string;
}

export interface SleepFragment {
    id: string;
    audioUrl: string;
    mimeType: string;
    transcription?: string;
    title?: string;
    theme?: string;
}

export interface SleepSession {
    id: string;
    startTime: number;
    endTime: number;
    fragments: SleepFragment[];
}

export interface OracleReading {
    cardName: string;
    cardType: 'Dream' | 'Totem';
    upright: string;
    reversed: string;
    guidance: string;
    imagePrompt: string;
}

export interface SavedOracleReading extends OracleReading {
    id: string;
    date: string;
    question: string;
}

export type SubscriptionTier = 'free' | 'premium';

export interface User {
    email: string;
    username: string;
    name: string;
    surname: string;
    dob: string;
    passwordHash?: string; // Optional for Google Sign-In users
    provider?: 'email' | 'google';
    subscriptionTier: SubscriptionTier;
    dreamEssence: number;
}

export interface LinkedProfile {
    id: string;
    username: string;
    relationship: string;
}

export interface OdysseyStep {
  id: number;
  title: string;
  description: string;
  incubationGoal: string;
  status: 'pending' | 'completed';
  resolutionDreamId?: string;
  resolutionNotes?: string;
}

export interface Odyssey {
  id: string;
  title: string;
  description: string;
  centralTotemId: string;
  steps: OdysseyStep[];
  status: 'active' | 'completed';
  completionSummary?: string;
}

export interface SynthesisReport {
    executiveSummary: string;
    keyThemes: { theme: string; analysis: string; relevantDreamIds: string[] }[];
    moodAnalysis: string;
    symbolicDeepDive: { symbol: string; interpretation: string; relevantDreamIds: string[] }[];
    connectionToGoal: string;
    actionableInsights: string[];
}


export interface AudioScapeParams {
    mood: string;
    baseFrequency: number;
    lfoRate: number;
    filterType: BiquadFilterType;
    filterFrequency: number;
    hasRain: boolean;
    hasHeartbeat: boolean;
}

export interface PersonalityProfile {
    type: string;
    analysis: string;
    keyTraits: string[];
    growthArea: string;
}

export interface SpiritGuide {
    name: string;
    description: string;
    symbolism: string;
    message: string;
    imagePrompt: string;
}

export interface CognitivePuzzle {
    question: string;
    options: string[];
    answer: string;
}

export interface CognitiveAssessmentResult {
    score: number;
    analysis: string;
    title: string;
}

export interface DreamSeries {
    seriesId: string;
    title: string;
    themeSummary: string;
    dreamIds: string[];
}

export interface DreamSeriesAnalysis {
    narrativeSummary: string;
    evolvingThemes: string[];
    predictedContinuation: string;
}

export interface DreamEcho {
    original: string;
    echoes: string[];
}

export interface DreamComparisonReport {
    sharedSymbols: string[];
    contrastingThemes: { dreamA: string; dreamB: string; };
    narrativeConnection: string;
    overallSynthesis: string;
}

export interface StoredQuest {
    id: string;
    status: 'pending' | 'completed';
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    xp: number;
    check: (action: ActionType, payload: any, context: any) => boolean;
}

// Added for DreamContext
export interface DreamContextType {
    dreams: Dream[];
    setDreams: React.Dispatch<React.SetStateAction<Dream[]>>;
    addDream: (dreamData: Omit<Dream, 'id' | 'date'>) => Dream;
    updateDream: (dreamId: string, updates: Partial<Omit<Dream, 'id'>> | ((prevDream: Dream) => Partial<Omit<Dream, 'id'>>)) => void;
    deleteDream: (dreamId: string) => void;
    selectedDream: Dream | null;
    setSelectedDream: React.Dispatch<React.SetStateAction<Dream | null>>;
    selectDream: (dream: Dream) => void;
    symbolLexicon: SymbolEntry[];
    addSymbolToLexicon: (entry: Omit<SymbolEntry, 'dreamIds'> & { dreamIds?: string[] }) => void;
    updateSymbolInLexicon: (symbol: string, newInterpretation: string) => void;
    deleteSymbolFromLexicon: (symbol: string) => void;
    totems: Totem[];
    setTotems: React.Dispatch<React.SetStateAction<Totem[]>>;
    updateTotem: (totemId: string, updates: Partial<Omit<Totem, 'id'>>) => void;
    addMemo: (memoText: string) => Dream;
    incubationSessions: IncubationSession[];
    addIncubationSession: (sessionData: Omit<IncubationSession, 'id' | 'date'>) => IncubationSession;
    updateIncubationSession: (sessionId: string, updates: Partial<Omit<IncubationSession, 'id'>>) => void;
    sleepSessions: SleepSession[];
    addSleepSession: (session: SleepSession) => void;
    updateSleepSession: (sessionId: string, updates: Partial<Omit<SleepSession, 'id'>>) => void;
    guideChatHistory: any[];
    setGuideChatHistory: React.Dispatch<React.SetStateAction<any[]>>;
    savedReadings: SavedOracleReading[];
    addSavedReading: (reading: Omit<SavedOracleReading, 'id' | 'date'>) => void;
    odysseys: Odyssey[];
    addOdyssey: (odysseyData: Omit<Odyssey, 'id'>) => void;
    updateOdyssey: (odysseyId: string, updates: Partial<Omit<Odyssey, 'id'>>) => void;
    dreamSeries: DreamSeries[];
    setDreamSeries: React.Dispatch<React.SetStateAction<DreamSeries[]>>;
    userXP: number;
    unlockedAchievements: { [key: string]: string };
    dailyQuests: StoredQuest[];
    triggerAction: (action: ActionType, payload?: any) => void;
    currentStreak: number;
    longestStreak: number;
}