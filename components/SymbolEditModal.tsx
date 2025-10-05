import React, { useState, useContext, useEffect, FormEvent } from 'react';
import { DreamContext } from '../context/DreamContext.tsx';
import { ToastContext } from '../context/ToastContext.tsx';
import { SymbolEntry } from '../types.ts';

interface SymbolEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    symbolEntry: SymbolEntry | null;
}

const SymbolEditModal: React.FC<SymbolEditModalProps> = ({ isOpen, onClose, symbolEntry }) => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);

    const [symbol, setSymbol] = useState('');
    const [interpretation, setInterpretation] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (symbolEntry) {
            setSymbol(symbolEntry.symbol);
            setInterpretation(symbolEntry.interpretation);
            setIsEditing(true);
        } else {
            setSymbol('');
            setInterpretation('');
            setIsEditing(false);
        }
    }, [symbolEntry, isOpen]);

    if (!isOpen || !dreamContext || !toastContext) return null;
    const { addSymbolToLexicon, updateSymbolInLexicon, symbolLexicon } = dreamContext;
    const { addToast } = toastContext;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!symbol.trim() || !interpretation.trim()) {
            addToast("Symbol and interpretation cannot be empty.", "error");
            return;
        }

        const symbolExists = symbolLexicon.some(entry => 
            entry.symbol.toLowerCase() === symbol.trim().toLowerCase()
        );

        if (!isEditing && symbolExists) {
            addToast("This symbol already exists in your lexicon. You can edit the existing entry.", "error");
            return;
        }

        if (isEditing) {
            updateSymbolInLexicon(symbol, interpretation);
            addToast(`Updated interpretation for "${symbol}".`, 'success');
        } else {
            addSymbolToLexicon({ symbol: symbol.trim(), interpretation });
            addToast(`Added "${symbol}" to your lexicon.`, 'success');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-lg p-8 space-y-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-purple-300">{isEditing ? 'Edit Symbol' : 'Add New Symbol'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="symbol-name" className="block text-sm font-medium text-purple-200 mb-1">Symbol</label>
                        <input
                            type="text"
                            id="symbol-name"
                            value={symbol}
                            onChange={e => setSymbol(e.target.value)}
                            className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-700"
                            placeholder="e.g., A white rabbit"
                            required
                            disabled={isEditing}
                        />
                    </div>
                     <div>
                        <label htmlFor="interpretation" className="block text-sm font-medium text-purple-200 mb-1">Your Personal Interpretation</label>
                        <textarea
                            id="interpretation"
                            value={interpretation}
                            onChange={e => setInterpretation(e.target.value)}
                            rows={5}
                            className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="e.g., For me, this represents curiosity and following an unknown path."
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors">
                            {isEditing ? 'Save Changes' : 'Add to Lexicon'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SymbolEditModal;