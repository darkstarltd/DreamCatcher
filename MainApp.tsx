import React, { useState, useContext, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import DreamList from './components/DreamList';
import DreamDetail from './components/DreamDetail';
import Welcome from './components/Welcome';
import NewDreamModal from './components/NewDreamModal';
import EditDreamModal from './components/EditDreamModal';
import Settings from './components/Settings';
import AboutModal from './components/AboutModal';
import Onboarding from './components/Onboarding';
import ToastContainer from './components/ToastContainer';
import ContextMenu from './components/ContextMenu';
import Dashboard from './components/Dashboard';
import Vault from './components/Vault';
import Incubation from './components/Incubation';
import Somniloquy from './components/Somniloquy';
import Divination from './components/Divination';
import Guide from './components/Guide';
import DreamScape from './components/DreamScape';
import AudioScape from './components/AudioScape';
import QuickMemoModal from './components/QuickMemoModal';
import GlobalSearch from './components/GlobalSearch';
import Odyssey from './components/Odyssey';
import Oneirogen from './components/Oneirogen';
import Celestial from './components/Celestial';
import Horoscope from './components/Horoscope';
import Numerology from './components/Numerology';
import PsycheProfiler from './components/PsycheProfiler';
import DreamCircle from './components/DreamCircle';
import Path from './components/Path';
import EchoChamber from './components/EchoChamber';
import UpgradeModal from './components/UpgradeModal';
import Calendar from './components/Calendar';
import Series from './components/Series';
import Store from './components/Store';
import SymbolInterpretationModal from './components/SymbolInterpretationModal';
import EditImageModal from './components/EditImageModal';
import LinkDreamsModal from './components/LinkDreamsModal';
import DreamWeb from './components/DreamWeb';
import ConnectionSuggestionsModal from './components/ConnectionSuggestionsModal';
import DreamWeaveModal from './components/DreamWeaveModal';
import ShareDreamModal from './components/ShareDreamModal';
import VideoGenerationModal from './components/VideoGenerationModal';
import GenerateImageModal from './components/GenerateImageModal';
import MindMapModal from './components/MindMapModal';
import SynthesisReportModal from './components/SynthesisReportModal';
import TotemDetailModal from './components/TotemDetailModal';
import SymbolEditModal from './components/SymbolEditModal';
import IncubationSetupModal from './components/IncubationSetupModal';
import IncubationSessionModal from './components/IncubationSessionModal';
import SleepSessionModal from './components/SleepSessionModal';
import SessionDetailModal from './components/SessionDetailModal';
import LinkResolutionDreamModal from './components/LinkResolutionDreamModal';
import ReadingDetailModal from './components/ReadingDetailModal';
import EditTotemModal from './components/EditTotemModal';
import DreamComparisonModal from './components/DreamComparisonModal';
import RemixDreamModal from './components/RemixDreamModal';
import UpgradePromptModal from './components/UpgradePromptModal';
import DreamChat from './components/DreamChat';

import { DreamContext } from './context/DreamContext';
import { SettingsContext } from './context/SettingsContext';
import { AuthContext } from './context/AuthContext';
import { ModalContext } from './context/ModalContext';
import { Dream, View, Totem, SymbolEntry } from './types';
import FloatingActionButton from './components/FloatingActionButton';

const MainApp: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const settingsContext = useContext(SettingsContext);
    const authContext = useContext(AuthContext);
    const modalContext = useContext(ModalContext);

    const [view, setView] = useState<View>('journal');
    const [initialVaultSelection, setInitialVaultSelection] = useState<{ type: 'totem' | 'lexicon', id: string } | null>(null);
    const [showDetailMobile, setShowDetailMobile] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    
    if (!dreamContext || !settingsContext || !authContext || !modalContext) {
        return <div>Loading contexts...</div>;
    }
    const { dreams, selectedDream, selectDream, setSelectedDream } = dreamContext;
    const { hasCompletedOnboarding, setHasCompletedOnboarding, disableAIFeatures } = settingsContext;
    const { logout, currentUser } = authContext;
    const { modalState, openModal, closeModal } = modalContext;
    
    const handleDreamSelect = (dream: Dream) => {
        setView('journal');
        selectDream(dream);
        setShowDetailMobile(true);
    };

    useEffect(() => {
        if (!selectedDream) {
            setShowDetailMobile(false);
        }
    }, [selectedDream]);

    useEffect(() => {
        setInitialVaultSelection(null);
        const aiViews: View[] = ['oneirogen', 'guide', 'divination', 'incubation', 'somniloquy', 'odyssey', 'horoscope', 'numerology', 'audioscape', 'psyche', 'echo', 'series'];
        if (disableAIFeatures && aiViews.includes(view)) {
            setView('journal');
        }
    }, [disableAIFeatures, view]);


    const renderView = () => {
        if (dreams.length === 0 && view === 'journal') return <Welcome />;

        switch (view) {
            case 'journal':
                return selectedDream
                    ? <DreamDetail onBack={() => setSelectedDream(null)} />
                    : <div className="flex-1 items-center justify-center text-purple-300 hidden md:flex">Select a dream to view details.</div>;
            case 'dashboard': return <Dashboard onSetView={setView} onDreamSelect={handleDreamSelect} />;
            case 'calendar': return <Calendar onDreamSelect={handleDreamSelect} />;
            case 'path': return <Path />;
            case 'vault': return <Vault onDreamSelect={handleDreamSelect} initialSelection={initialVaultSelection}/>;
            case 'circle': return <DreamCircle onDreamSelect={handleDreamSelect} />;
            case 'psyche': return <PsycheProfiler />;
            case 'scape': return <DreamScape onNodeDoubleClick={handleDreamSelect} />;
            case 'audioscape': return <AudioScape onDreamSelect={handleDreamSelect} />;
            case 'incubation': return <Incubation onDreamSelect={handleDreamSelect} />;
            case 'somniloquy': return <Somniloquy onDreamSelect={handleDreamSelect} />;
            case 'divination': return <Divination />;
            case 'guide': return <Guide />;
            case 'odyssey': return <Odyssey />;
            case 'oneirogen': return <Oneirogen onDreamCreated={handleDreamSelect} />;
            case 'celestial': return <Celestial />;
            case 'horoscope': return <Horoscope />;
            case 'numerology': return <Numerology />;
            case 'echo': return <EchoChamber />;
            case 'series': return <Series onDreamSelect={handleDreamSelect} />;
            case 'store': return <Store />;
            case 'settings': return <Settings />;
            default: return null;
        }
    };

    return (
        <>
            {!hasCompletedOnboarding && currentUser?.email !== 'guest@dreamcatcher.app' && (
                <Onboarding onFinish={() => setHasCompletedOnboarding(true)} />
            )}

            <div className="flex h-screen w-screen overflow-hidden">
                 {isMobileNavOpen && (
                    <div 
                        onClick={() => setIsMobileNavOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden sidebar-overlay"
                    />
                )}
                <Sidebar
                    currentView={view}
                    onSetView={(v) => { setView(v); setIsMobileNavOpen(false); }}
                    onLogout={logout}
                    isMobileOpen={isMobileNavOpen}
                    onCloseMobileNav={() => setIsMobileNavOpen(false)}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <MobileNav onOpenNav={() => setIsMobileNavOpen(true)} currentView={view} />
                    <main className="flex-1 p-2 md:p-4 flex gap-4 overflow-hidden">
                        <div className={`w-full md:w-1/3 flex-shrink-0 h-full ${showDetailMobile && view === 'journal' ? 'hidden' : 'block'} md:block`}>
                            {dreams.length > 0 ? (
                                <DreamList
                                    dreams={dreams}
                                    selectedDream={selectedDream}
                                    onSelectDream={(dream) => {
                                        selectDream(dream);
                                        setShowDetailMobile(true);
                                    }}
                                />
                            ) : (view !== 'journal' && view !== 'calendar' && <div className="h-full bg-black/20 rounded-2xl flex items-center justify-center text-purple-400">No dreams recorded.</div>)}
                        </div>

                        <div className={`flex-1 h-full overflow-y-auto ${!showDetailMobile && view === 'journal' ? 'hidden' : 'block'} md:block`}>
                            {renderView()}
                        </div>
                    </main>
                </div>
            </div>

            {/* Centralized Modal Rendering */}
            {modalState.newDream.isOpen && <NewDreamModal />}
            {modalState.quickMemo.isOpen && <QuickMemoModal />}
            {modalState.about.isOpen && <AboutModal />}
            {modalState.upgrade.isOpen && <UpgradeModal />}
            {modalState.search.isOpen && <GlobalSearch 
                isOpen={true} 
                onClose={() => closeModal('search')}
                onSelectDream={(dream) => { handleDreamSelect(dream); closeModal('search'); }}
                onSelectTotem={(totem: Totem) => {
                    setInitialVaultSelection({ type: 'totem', id: totem.id });
                    setView('vault');
                    closeModal('search');
                }}
                onSelectLexicon={(entry: SymbolEntry) => { 
                    setInitialVaultSelection({ type: 'lexicon', id: entry.symbol });
                    setView('vault'); 
                    closeModal('search'); 
                }}
            />}
            {modalState.editDream.isOpen && <EditDreamModal dream={modalState.editDream.dream} onClose={() => closeModal('editDream')} />}
            {modalState.symbolInterpretation.isOpen && <SymbolInterpretationModal />}
            {modalState.editImage.isOpen && <EditImageModal />}
            {modalState.linkDreams.isOpen && <LinkDreamsModal isOpen={true} onClose={() => closeModal('linkDreams')} currentDream={modalState.linkDreams.dream} />}
            {modalState.dreamWeb.isOpen && <DreamWeb isOpen={true} onClose={() => closeModal('dreamWeb')} currentDream={modalState.dreamWeb.dream} onNodeClick={(dream) => { closeModal('dreamWeb'); selectDream(dream); }} />}
            {modalState.connectionSuggestions.isOpen && <ConnectionSuggestionsModal />}
            {modalState.dreamWeave.isOpen && <DreamWeaveModal isOpen={true} onClose={() => closeModal('dreamWeave')} seriesDreams={modalState.dreamWeave.seriesDreams} onDreamSelect={(dream) => { closeModal('dreamWeave'); selectDream(dream); }} />}
            {modalState.shareDream.isOpen && <ShareDreamModal isOpen={true} onClose={() => closeModal('shareDream')} dream={modalState.shareDream.dream} />}
            {modalState.videoGeneration.isOpen && <VideoGenerationModal />}
            {modalState.generateImage.isOpen && <GenerateImageModal />}
            {modalState.dreamComparison.isOpen && <DreamComparisonModal />}
            {modalState.remixDream.isOpen && <RemixDreamModal isOpen={true} onClose={() => closeModal('remixDream')} originalDream={modalState.remixDream.dream} />}
            {modalState.mindMap.isOpen && <MindMapModal 
                    isOpen={true} 
                    onClose={() => closeModal('mindMap')} 
                    dream={modalState.mindMap.dream} 
                    onInterpretSymbol={(symbol) => {
                        openModal('symbolInterpretation', { symbol, dream: modalState.mindMap.dream! });
                    }} 
                />}
            {modalState.synthesisReport.isOpen && <SynthesisReportModal isOpen={true} onClose={() => closeModal('synthesisReport')} />}
            {modalState.totemDetail.isOpen && <TotemDetailModal isOpen={true} onClose={() => closeModal('totemDetail')} totem={modalState.totemDetail.totem} onDreamSelect={(dream) => { closeModal('totemDetail'); handleDreamSelect(dream); }} />}
            {modalState.symbolEdit.isOpen && <SymbolEditModal isOpen={true} onClose={() => closeModal('symbolEdit')} symbolEntry={modalState.symbolEdit.symbolEntry} />}
            {modalState.incubationSetup.isOpen && <IncubationSetupModal onClose={() => closeModal('incubationSetup')} onGuideGenerated={(session) => openModal('incubationSession', { session })}/>}
            {modalState.incubationSession.isOpen && <IncubationSessionModal session={modalState.incubationSession.session} onClose={() => closeModal('incubationSession')} />}
            {modalState.sleepSession.isOpen && <SleepSessionModal onClose={() => closeModal('sleepSession')} />}
            {modalState.sessionDetail.isOpen && <SessionDetailModal session={modalState.sessionDetail.session} onClose={() => closeModal('sessionDetail')} onDreamSelect={handleDreamSelect} />}
            {modalState.linkResolutionDream.isOpen && <LinkResolutionDreamModal />}
            {modalState.readingDetail.isOpen && <ReadingDetailModal reading={modalState.readingDetail.reading} onClose={() => closeModal('readingDetail')} />}
            {modalState.editTotem.isOpen && <EditTotemModal totem={modalState.editTotem.totem} onClose={() => closeModal('editTotem')} />}
            {modalState.upgradePrompt.isOpen && <UpgradePromptModal />}
            
            <ContextMenu />
            <ToastContainer />
            <FloatingActionButton />
        </>
    );
};

export default MainApp;