import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { Dream, SymbolEntry, Totem, OdysseyStep, IncubationSession, SleepSession, SavedOracleReading } from '../types';

type ModalType = 
    | 'newDream' 
    | 'editDream' 
    | 'quickMemo' 
    | 'settings' 
    | 'search' 
    | 'symbolInterpretation'
    | 'editImage'
    | 'linkDreams'
    | 'dreamWeb'
    | 'connectionSuggestions'
    | 'dreamWeave'
    | 'shareDream'
    | 'videoGeneration'
    | 'mindMap'
    | 'synthesisReport'
    | 'totemDetail'
    | 'editTotem'
    | 'symbolEdit'
    | 'about'
    | 'upgrade'
    | 'incubationSetup'
    | 'incubationSession'
    | 'sleepSession'
    | 'sessionDetail'
    | 'linkResolutionDream'
    | 'readingDetail'
    | 'generateImage'
    | 'dreamComparison'
    | 'remixDream'
    | 'upgradePrompt';

interface ModalPayloads {
    editDream: { dream: Dream };
    shareDream: { dream: Dream };
    symbolInterpretation: { symbol: string, dream: Dream };
    editImage: { dream: Dream };
    linkDreams: { dream: Dream };
    dreamWeb: { dream: Dream };
    connectionSuggestions: { dream: Dream };
    dreamWeave: { seriesDreams: Dream[] };
    mindMap: { dream: Dream };
    totemDetail: { totem: Totem };
    editTotem: { totem: Totem };
    symbolEdit: { symbolEntry: SymbolEntry | null };
    incubationSession: { session: IncubationSession };
    sessionDetail: { session: SleepSession };
    linkResolutionDream: { onSave: (dreamId: string, notes: string) => void };
    readingDetail: { reading: SavedOracleReading };
    generateImage: { dream: Dream };
    dreamComparison: { dream: Dream };
    remixDream: { dream: Dream };
    upgradePrompt: { featureName: string; onUpgrade: () => void; };
}

type ModalState = {
    [K in ModalType]: K extends keyof ModalPayloads 
        ? { isOpen: boolean } & ModalPayloads[K]
        : { isOpen: boolean };
};

const initialModalState: ModalState = {
    newDream: { isOpen: false },
    quickMemo: { isOpen: false },
    settings: { isOpen: false },
    search: { isOpen: false },
    about: { isOpen: false },
    upgrade: { isOpen: false },
    videoGeneration: { isOpen: false },
    synthesisReport: { isOpen: false },
    incubationSetup: { isOpen: false },
    sleepSession: { isOpen: false },
    editDream: { isOpen: false, dream: null! },
    symbolInterpretation: { isOpen: false, symbol: '', dream: null! },
    editImage: { isOpen: false, dream: null! },
    linkDreams: { isOpen: false, dream: null! },
    dreamWeb: { isOpen: false, dream: null! },
    connectionSuggestions: { isOpen: false, dream: null! },
    dreamWeave: { isOpen: false, seriesDreams: [] },
    shareDream: { isOpen: false, dream: null! },
    mindMap: { isOpen: false, dream: null! },
    totemDetail: { isOpen: false, totem: null! },
    editTotem: { isOpen: false, totem: null! },
    symbolEdit: { isOpen: false, symbolEntry: null },
    incubationSession: { isOpen: false, session: null! },
    sessionDetail: { isOpen: false, session: null! },
    linkResolutionDream: { isOpen: false, onSave: () => {} },
    readingDetail: { isOpen: false, reading: null! },
    generateImage: { isOpen: false, dream: null! },
    dreamComparison: { isOpen: false, dream: null! },
    remixDream: { isOpen: false, dream: null! },
    upgradePrompt: { isOpen: false, featureName: '', onUpgrade: () => {} },
};


interface ModalContextType {
    modalState: ModalState;
    openModal: <K extends ModalType>(type: K, payload?: K extends keyof ModalPayloads ? ModalPayloads[K] : never) => void;
    closeModal: (type: ModalType) => void;
}

export const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modalState, setModalState] = useState<ModalState>(initialModalState);

    const openModal = useCallback(<K extends ModalType>(type: K, payload?: K extends keyof ModalPayloads ? ModalPayloads[K] : never) => {
        setModalState(prev => ({
            ...prev,
            [type]: { ...prev[type], isOpen: true, ...payload },
        }));
    }, []);

    const closeModal = useCallback((type: ModalType) => {
        setModalState(prev => ({
            ...prev,
            // Reset to initial state for that modal type to clear data
            [type]: { ...initialModalState[type], isOpen: false } as any,
        }));
    }, []);

    return (
        <ModalContext.Provider value={{ modalState, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};