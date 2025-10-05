import React, { useContext, useState, useEffect, useRef, FormEvent } from 'react';
import { DreamContext } from '../context/DreamContext.tsx';
import { SettingsContext } from '../context/SettingsContext.tsx';
import { AI_PERSONAS, COMMON_SYMBOLS } from '../constants.ts';
import { ChatMessage } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import { SendIcon, BookOpenIcon, CompassIcon, ExternalLinkIcon, SearchIcon, ArrowLeftIcon } from './icons';
import { generateGuideResponseStream, getSymbolpediaInterpretation, generateImageForSymbol } from '../services/geminiService.ts';

const ChatWithGuide: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const settingsContext = useContext(SettingsContext);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [dreamContext?.guideChatHistory]);
    
    if (!dreamContext || !settingsContext) return null;

    const { guideChatHistory, setGuideChatHistory, dreams, triggerAction } = dreamContext;
    const { aiPersona } = settingsContext;
    const persona = AI_PERSONAS.find(p => p.key === aiPersona) || AI_PERSONAS[0];

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: userInput.trim() }] };
        
        const dreamContextText = `User's Full Dream Journal for context: ${JSON.stringify(dreams.map(d => ({ title: d.title, date: d.date, summary: d.summary, tags: d.tags, mood: d.mood })))}`;
        const userMessageWithContext: ChatMessage = {
            role: 'user',
            parts: [
                { text: userInput.trim() },
                { text: `\n\n---CONTEXT---\n${dreamContextText}` }
            ]
        };

        setGuideChatHistory(prev => [...prev, newUserMessage]);
        triggerAction('CONSULT_GUIDE');
        setUserInput('');
        setIsLoading(true);

        try {
            const historyWithContext = [...guideChatHistory, userMessageWithContext];
            const stream = await generateGuideResponseStream(historyWithContext, persona);
            
            let fullResponse = '';
            setGuideChatHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setGuideChatHistory(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage?.role === 'model') {
                        const updatedLastMessage = { ...lastMessage, parts: [{ text: fullResponse }] };
                        return [...prev.slice(0, -1), updatedLastMessage];
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("Failed to get guide response:", error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I encountered an error. Please try again." }] };
            setGuideChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex-1 bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-purple-500/20 shadow-xl flex flex-col">
            <p className="text-center text-purple-300 mb-4 text-sm">Chatting with {persona.name}</p>
            <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                {guideChatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-purple-700' : 'bg-gray-700'}`}>
                            <p className="text-white whitespace-pre-wrap">{msg.parts.map(p => 'text' in p ? p.text : '').join('')}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-700 text-gray-200">
                            <LoadingSpinner />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="mt-4 flex items-center gap-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={`Ask ${persona.name}...`}
                    className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !userInput.trim()} className="p-2 bg-purple-600 rounded-md disabled:bg-gray-600">
                    <SendIcon />
                </button>
            </form>
        </div>
    );
};

const Symbolpedia: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [result, setResult] = useState<{ interpretation: string; sources: { uri: string; title: string }[]; imageUrl: string; } | null>(null);

    const handleSearch = async (symbol: string) => {
        if (!symbol.trim()) return;

        setSelectedSymbol(symbol);
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const [interpretationData, imageUrl] = await Promise.all([
                getSymbolpediaInterpretation(symbol),
                generateImageForSymbol(symbol)
            ]);
            setResult({ ...interpretationData, imageUrl });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get interpretation.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleBack = () => {
        setSelectedSymbol(null);
        setResult(null);
        setError(null);
        setQuery('');
    };

    if (selectedSymbol) {
        return (
            <div className="flex-1 bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-purple-500/20 shadow-xl flex flex-col animate-fade-in">
                <button onClick={handleBack} className="flex items-center gap-2 text-purple-300 hover:text-white mb-4">
                    <ArrowLeftIcon /> Back to Symbolpedia
                </button>
                <div className="flex-grow overflow-y-auto pr-2">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-purple-300">
                            <LoadingSpinner />
                            <p className="mt-4">Interpreting {selectedSymbol}...</p>
                        </div>
                    )}
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">
                            <p className="font-bold">Interpretation Failed</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {result && (
                        <div className="space-y-4">
                            <h3 className="text-3xl font-bold text-white">{selectedSymbol}</h3>
                             <img src={result.imageUrl} alt={`Art for ${selectedSymbol}`} className="w-full h-64 object-cover rounded-lg border-2 border-purple-500/20" />
                            <div className="prose prose-invert max-w-none prose-p:text-gray-300">
                                <p>{result.interpretation}</p>
                                {result.sources && result.sources.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-purple-300">Sources:</h4>
                                        <ul className="list-none p-0 space-y-2">
                                            {result.sources.map((source, index) => (
                                                <li key={index} className="not-prose">
                                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-200"><ExternalLinkIcon className="h-4 w-4" /> <span className="truncate">{source.title}</span></a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex-1 bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-purple-500/20 shadow-xl flex flex-col">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a dream symbol (e.g., water, teeth)..."
                    className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <button type="submit" className="p-2 bg-purple-600 rounded-md"><SearchIcon /></button>
            </form>

            <div className="flex-grow overflow-y-auto pr-2">
                <p className="text-sm text-purple-300 mb-3">Or browse common symbols:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {COMMON_SYMBOLS.map(symbol => (
                        <button key={symbol} onClick={() => handleSearch(symbol)} className="p-4 bg-black/20 border border-purple-500/10 rounded-lg text-white hover:bg-purple-900/40 hover:border-purple-500/50 transition-all text-center font-semibold">
                            {symbol}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


const Guide: React.FC = () => {
    const [view, setView] = useState<'chat' | 'symbolpedia'>('chat');
    
    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-purple-300">Guide</h2>
                <p className="text-purple-300">Your personal guide for your dreaming journey.</p>
            </div>

            <div className="flex border-b border-purple-500/20 mb-4">
                <button 
                    onClick={() => setView('chat')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${view === 'chat' ? 'border-b-2 border-purple-400 text-white' : 'text-purple-300 hover:text-white'}`}
                >
                    <CompassIcon className="h-4 w-4" /> Chat with Guide
                </button>
                 <button 
                    onClick={() => setView('symbolpedia')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${view === 'symbolpedia' ? 'border-b-2 border-purple-400 text-white' : 'text-purple-300 hover:text-white'}`}
                >
                    <BookOpenIcon className="h-4 w-4" /> Symbolpedia
                </button>
            </div>
            
            {view === 'chat' && <ChatWithGuide />}
            {view === 'symbolpedia' && <Symbolpedia />}
        </div>
    );
};

export default Guide;