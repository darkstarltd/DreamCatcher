

import React, { useContext, useState, useEffect } from 'react';
import { DreamContext } from '../context/DreamContext';
import { ToastContext } from '../context/ToastContext';
import { ContextMenuContext } from '../context/ContextMenuContext';
import { ModalContext } from '../context/ModalContext';
import { discoverTotems, generateImageForTotem } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { CrystalBallIcon, LinkIcon, PencilIcon, TrashIcon, PlusIcon, BookOpenIcon } from './icons';
import { Dream, Totem, SymbolEntry } from '../types';
import TotemCard from './TotemCard';

interface VaultProps {
    onDreamSelect: (dream: Dream) => void;
    initialSelection?: { type: 'totem' | 'lexicon', id: string } | null;
}

type VaultView = 'totems' | 'lexicon';

type DiscoveredTotem = Omit<Totem, 'id' | 'imageUrl' | 'detailedInterpretation'>;

const Vault: React.FC<VaultProps> = ({ onDreamSelect, initialSelection }) => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const modalContext = useContext(ModalContext);
    const contextMenu = useContext(ContextMenuContext);
    
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<VaultView>('totems');
    
    if (!dreamContext || !toastContext || !modalContext || !contextMenu) return null;
    
    const { dreams, totems, setTotems, updateTotem, symbolLexicon, deleteSymbolFromLexicon } = dreamContext;
    const { addToast } = toastContext;
    const { openModal } = modalContext;
    const { showContextMenu } = contextMenu;

    useEffect(() => {
        if (initialSelection) {
            if (initialSelection.type === 'totem') {
                const totemToSelect = totems.find(t => t.id === initialSelection.id);
                if (totemToSelect) {
                    setCurrentView('totems');
                    openModal('totemDetail', { totem: totemToSelect });
                }
            } else if (initialSelection.type === 'lexicon') {
                setCurrentView('lexicon');
                setTimeout(() => {
                    const element = document.getElementById(`lexicon-entry-${initialSelection.id}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('animate-pulse', 'bg-purple-500/20');
                        setTimeout(() => element.classList.remove('animate-pulse', 'bg-purple-500/20'), 2000);
                    }
                }, 100);
            }
        }
    }, [initialSelection, totems, openModal]);

    const handleDiscoverTotems = async () => {
        setIsDiscovering(true);
        setError(null);
        try {
            // FIX: Removed unsafe cast. The type is inferred from the service function's signature.
            const discoveredResult = await discoverTotems(dreams);
            
            if (!Array.isArray(discoveredResult)) {
                throw new Error("The AI returned data in an unexpected format.");
            }
            
            const isDiscoveredTotem = (item: unknown): item is DiscoveredTotem => {
                if (typeof item !== 'object' || item === null) {
                    return false;
                }
                const record = item as Record<string, any>;
                if (
                    typeof record.name !== 'string' ||
                    typeof record.description !== 'string' ||
                    typeof record.imagePrompt !== 'string' ||
                    !Array.isArray(record.dreamIds)
                ) {
                    return false;
                }
                
                return record.dreamIds.every((id: unknown) => typeof id === 'string');
            };

            const existingTotemsMap = new Map(totems.map(t => [t.name.toLowerCase(), t]));
            const newTotems: Totem[] = [];
            let malformedCount = 0;

            for (const item of discoveredResult) {
                if (isDiscoveredTotem(item)) {
                    const existing = existingTotemsMap.get(item.name.toLowerCase());
                    if (existing) {
                        const updatedDreamIds = Array.from(new Set([...existing.dreamIds, ...item.dreamIds]));
                        updateTotem(existing.id, { dreamIds: updatedDreamIds, description: item.description, imagePrompt: item.imagePrompt });
                    } else {
                        newTotems.push({
                            ...item,
                            id: `${Date.now()}-${item.name.replace(/\s+/g, '-')}`,
                        });
                    }
                } else {
                    malformedCount++;
                }
            }
            
            if (malformedCount > 0) {
                addToast(`${malformedCount} totem items from AI were malformed and filtered out.`, 'info');
            }

            if (newTotems.length > 0) {
                setTotems(prev => [...prev, ...newTotems]);
                addToast(`Discovered ${newTotems.length} new totems!`, 'success');
    
                // Generate images for new totems in the background
                for (const newTotem of newTotems) {
                    generateImageForTotem(newTotem.imagePrompt)
                        .then(imageUrl => updateTotem(newTotem.id, { imageUrl }))
                        .catch(imgError => {
                            console.error(`Failed to generate image for totem "${newTotem.name}":`, imgError);
                            addToast(`Image generation failed for totem: ${newTotem.name}`, 'error');
                        });
                }
            } else if (malformedCount === 0 && discoveredResult.length > 0) {
                 addToast('No new totems were discovered this time.', 'info');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to discover totems.";
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsDiscovering(false);
        }
    };
    
    const handleDeleteSymbol = (symbol: string) => {
        if (window.confirm(`Are you sure you want to delete the symbol "${symbol}" from your lexicon?`)) {
            deleteSymbolFromLexicon(symbol);
            addToast(`"${symbol}" removed from lexicon.`, 'info');
        }
    };

    const handleLexiconContextMenu = (e: React.MouseEvent, entry: SymbolEntry) => {
        e.preventDefault();
        const menuItems = (
            <>
                <button onClick={() => openModal('symbolEdit', { symbolEntry: entry })} className="flex items-center gap-2 w-full text-left p-2 text-sm rounded-md hover:bg-purple-500/20">
                    <PencilIcon className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => handleDeleteSymbol(entry.symbol)} className="flex items-center gap-2 w-full text-left p-2 text-sm rounded-md text-red-400 hover:bg-red-500/20">
                    <TrashIcon className="h-4 w-4" /> Delete
                </button>
            </>
        );
        showContextMenu(e.clientX, e.clientY, menuItems);
    };

    const sortedLexicon = [...symbolLexicon].sort((a, b) => a.symbol.localeCompare(b.symbol));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-3xl font-bold text-white">Symbolism Hub</h2>
                {currentView === 'totems' ? (
                     <button
                        onClick={handleDiscoverTotems}
                        disabled={isDiscovering || dreams.length < 3}
                        title={dreams.length < 3 ? "You need at least 3 dreams to discover totems" : "Discover new totems"}
                        className="flex items-center gap-2 text-sm text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    >
                        {isDiscovering ? <LoadingSpinner /> : <CrystalBallIcon className="h-5 w-5" />}
                        {isDiscovering ? "Discovering..." : "Discover Totems"}
                    </button>
                ) : (
                    <button
                        onClick={() => openModal('symbolEdit', { symbolEntry: null })}
                        className="flex items-center gap-2 text-sm text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    >
                       <PlusIcon className="h-5 w-5" />
                       Add New Symbol
                    </button>
                )}
            </div>
            
             <div className="flex border-b border-purple-500/20">
                <button 
                    onClick={() => setCurrentView('totems')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${currentView === 'totems' ? 'border-b-2 border-cyan-400 text-white' : 'text-purple-200 hover:text-white'}`}
                >
                    <CrystalBallIcon /> Dream Totems
                </button>
                 <button 
                    onClick={() => setCurrentView('lexicon')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${currentView === 'lexicon' ? 'border-b-2 border-cyan-400 text-white' : 'text-purple-200 hover:text-white'}`}
                >
                    <BookOpenIcon /> Symbol Lexicon
                </button>
            </div>


            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-300 rounded-lg">
                    <p className="font-bold">Discovery Failed</p>
                    <p>{error}</p>
                </div>
            )}
            
            {currentView === 'totems' && (
                <>
                    {totems.length === 0 && !isDiscovering && (
                        <div className="text-center py-16 bg-black/20 rounded-2xl border border-purple-500/10">
                            <CrystalBallIcon className="h-16 w-16 mx-auto text-purple-500/30" />
                            <h3 className="mt-4 text-xl font-semibold text-white">Your Totem Vault is Empty</h3>
                            <p className="mt-2 text-purple-300">Discover recurring symbols by analyzing your journal.</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {totems.map(totem => (
                            <TotemCard key={totem.id} totem={totem} onSelect={() => openModal('totemDetail', { totem })} />
                        ))}
                    </div>
                </>
            )}
            
            {currentView === 'lexicon' && (
                <div className="space-y-4">
                    {sortedLexicon.length === 0 ? (
                         <div className="text-center py-16 bg-black/20 rounded-2xl border border-purple-500/10">
                            <BookOpenIcon className="h-16 w-16 mx-auto text-purple-500/30" />
                            <h3 className="mt-4 text-xl font-semibold text-white">Your Lexicon is Empty</h3>
                            <p className="mt-2 text-purple-300">Save interpretations to build your personal dictionary.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedLexicon.map(entry => (
                                <div key={entry.symbol} id={`lexicon-entry-${entry.symbol}`} onContextMenu={(e) => handleLexiconContextMenu(e, entry)} className="p-4 bg-black/20 rounded-xl border border-purple-500/10 group transition-colors duration-300">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-xl text-purple-200">{entry.symbol}</h4>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal('symbolEdit', { symbolEntry: entry })} className="p-1.5 text-purple-300 hover:text-white hover:bg-purple-500/10 rounded-md"><PencilIcon className="h-4 w-4" /></button>
                                            <button onClick={() => handleDeleteSymbol(entry.symbol)} className="p-1.5 text-red-400 hover:text-white hover:bg-red-500/10 rounded-md"><TrashIcon className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 italic mt-1">"{entry.interpretation}"</p>
                                    <div className="mt-3 pt-3 border-t border-purple-500/10">
                                        <p className="text-xs font-semibold text-purple-400 mb-2">Appears in:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {entry.dreamIds.length > 0 ? dreams.filter(d => entry.dreamIds.includes(d.id)).map(dream => (<button key={dream.id} onClick={() => onDreamSelect(dream)} className="flex items-center gap-1.5 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 px-2 py-1 rounded-full transition-colors border border-purple-500/20"><LinkIcon className="h-3 w-3" />{dream.title}</button>)) : <span className="text-xs text-purple-400 italic">Not yet linked to a dream.</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Vault;