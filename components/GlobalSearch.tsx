import React, { useState, useEffect, useContext } from 'react';
import { DreamContext } from '../context/DreamContext';
import { Dream, Totem, SymbolEntry } from '../types.ts';
import { BookOpenIcon, CrystalBallIcon, CometIcon } from './icons';

interface SearchResults {
    dreams: Dream[];
    totems: Totem[];
    lexicon: SymbolEntry[];
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDream: (dream: Dream) => void;
    onSelectTotem: (totem: Totem) => void;
    onSelectLexicon: (entry: SymbolEntry) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onSelectDream, onSelectTotem, onSelectLexicon }) => {
    const context = useContext(DreamContext);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults>({ dreams: [], totems: [], lexicon: [] });

    if (!context) return null;

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setQuery('');
                setResults({ dreams: [], totems: [], lexicon: [] });
            }, 300);
            return;
        }

        const performSearch = () => {
            if (!query.trim()) {
                setResults({ dreams: [], totems: [], lexicon: [] });
                return;
            }

            const { dreams, totems, symbolLexicon } = context;
            const lowerQuery = query.toLowerCase();

            const filteredDreams = dreams.filter(d => d.title.toLowerCase().includes(lowerQuery) || d.description.toLowerCase().includes(lowerQuery) || d.tags.some(t => t.toLowerCase().includes(lowerQuery)));
            const filteredTotems = totems.filter(t => t.name.toLowerCase().includes(lowerQuery) || t.description.toLowerCase().includes(lowerQuery));
            const filteredLexicon = symbolLexicon.filter(l => l.symbol.toLowerCase().includes(lowerQuery) || l.interpretation.toLowerCase().includes(lowerQuery));

            setResults({
                dreams: filteredDreams.slice(0, 5),
                totems: filteredTotems.slice(0, 5),
                lexicon: filteredLexicon.slice(0, 5),
            });
        };

        const debounceTimer = setTimeout(performSearch, 200);
        return () => clearTimeout(debounceTimer);

    }, [query, isOpen, context]);

    if (!isOpen) return null;
    
    const totalResults = results.dreams.length + results.totems.length + results.lexicon.length;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center z-50 p-4 pt-[10vh] animate-modal-entry" onClick={onClose}>
            <div className="bg-gray-900/80 border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/20 w-full max-w-2xl h-fit max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-purple-500/10">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search your subconscious..."
                        className="w-full bg-transparent text-lg text-white placeholder-purple-200/70 focus:outline-none"
                        autoFocus
                    />
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {query && totalResults === 0 && <p className="text-purple-300 text-center">No results found.</p>}
                    
                    {results.dreams.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-purple-200 uppercase tracking-wider px-2">Dreams</h3>
                            {results.dreams.map(dream => (
                                <button key={dream.id} onClick={() => onSelectDream(dream)} className="w-full text-left p-3 rounded-lg hover:bg-purple-500/10 transition-colors flex items-center gap-4">
                                    {dream.isAIGenerated ? <CometIcon className="h-6 w-6 text-cyan-400 flex-shrink-0" /> : <BookOpenIcon className="h-6 w-6 flex-shrink-0" />}
                                    <div>
                                        <p className="text-white">{dream.title}</p>
                                        <p className="text-xs text-purple-300 line-clamp-1">{dream.summary}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {results.totems.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-purple-200 uppercase tracking-wider px-2">Totems</h3>
                            {results.totems.map(totem => (
                                <button key={totem.id} onClick={() => onSelectTotem(totem)} className="w-full text-left p-3 rounded-lg hover:bg-purple-500/10 transition-colors flex items-center gap-4">
                                    <CrystalBallIcon className="h-6 w-6 flex-shrink-0" />
                                    <div>
                                        <p className="text-white">{totem.name}</p>
                                        <p className="text-xs text-purple-300 line-clamp-1">{totem.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {results.lexicon.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-purple-200 uppercase tracking-wider px-2">Lexicon</h3>
                             {results.lexicon.map(entry => (
                                <button key={entry.symbol} onClick={() => onSelectLexicon(entry)} className="w-full text-left p-3 rounded-lg hover:bg-purple-500/10 transition-colors flex items-center gap-4">
                                     <BookOpenIcon className="h-6 w-6 flex-shrink-0" />
                                     <div>
                                        <p className="text-white">{entry.symbol}</p>
                                        <p className="text-xs text-purple-300 line-clamp-1">{entry.interpretation}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;