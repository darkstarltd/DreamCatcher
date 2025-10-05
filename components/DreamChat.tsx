import React, { useContext, useState, useRef, useEffect } from 'react';
import { DreamContext } from '../context/DreamContext';
import { SettingsContext } from '../context/SettingsContext';
import { ToastContext } from '../context/ToastContext';
import { generateChatResponseStream } from '../services/geminiService';
import { ChatMessage, ChatPart } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { SendIcon, PaperClipIcon, XIcon } from './icons';
import { CONVERSATION_STARTERS, AI_PERSONAS } from '../constants';

const DreamChat: React.FC = () => {
    const dreamContext = useContext(DreamContext);
    const settingsContext = useContext(SettingsContext);
    const toastContext = useContext(ToastContext);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [stagedImageUrl, setStagedImageUrl] = useState<string | null>(null);
    const [localHistory, setLocalHistory] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const { selectedDream } = dreamContext || {};

    useEffect(() => {
        setLocalHistory(selectedDream?.chatHistory || []);
        setStagedImageUrl(null);
    }, [selectedDream?.id, selectedDream?.chatHistory]);

    useEffect(() => {
        scrollToBottom();
    }, [localHistory]);


    if (!dreamContext || !settingsContext || !toastContext || !selectedDream) return null;

    const { updateDream, symbolLexicon } = dreamContext;
    const { addToast } = toastContext;
    const { aiPersona } = settingsContext;
    
    const persona = AI_PERSONAS.find(p => p.key === aiPersona) || AI_PERSONAS[0];

    const handleSendMessage = async () => {
        if ((!userInput.trim() && !stagedImageUrl) || isLoading) return;

        const newUserParts: ChatPart[] = [];
        if (stagedImageUrl) {
            const match = stagedImageUrl.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                newUserParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            } else {
                addToast("Invalid image format for chat.", "error");
                return;
            }
        }
        if (userInput.trim()) {
            newUserParts.push({ text: userInput.trim() });
        }

        if (newUserParts.length === 0) return;

        const newUserMessage: ChatMessage = { role: 'user', parts: newUserParts };
        const historyForAI = [...localHistory, newUserMessage];
        
        // Optimistic UI update using functional form
        setLocalHistory(prev => [...prev, newUserMessage, { role: 'model', parts: [{ text: '' }] }]);
        setUserInput('');
        setStagedImageUrl(null);
        setIsLoading(true);
        
        try {
            const stream = await generateChatResponseStream(selectedDream, historyForAI, persona.systemInstruction, symbolLexicon);
            
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                // Functional update to local state for streaming display
                setLocalHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: fullResponse }] };
                    return newHistory;
                });
            }
            
            // Final, atomic, functional update to global state
            const finalModelMessage: ChatMessage = { role: 'model', parts: [{ text: fullResponse }] };
            updateDream(selectedDream.id, (prevDream) => ({
                chatHistory: [...(prevDream.chatHistory || []), newUserMessage, finalModelMessage],
            }));

        } catch (error) {
            console.error("Failed to get chat response:", error);
            const errorMessage = "Sorry, I encountered an error. Please try again.";
            addToast("Failed to get chat response from AI.", 'error');
            const errorBotMessage: ChatMessage = { role: 'model', parts: [{ text: errorMessage }] };
            
            // Final, atomic update with error message
            updateDream(selectedDream.id, (prevDream) => ({ 
                chatHistory: [...(prevDream.chatHistory || []), newUserMessage, errorBotMessage] 
            }));

            // Sync local state on error too
            setLocalHistory(prev => [...prev.slice(0, -1), errorBotMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    };

    const handleStageImage = () => {
        if (selectedDream.imageUrl) {
            setStagedImageUrl(selectedDream.imageUrl);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Explore with {persona.name}</h3>
            <div className="bg-black/20 p-4 rounded-xl border border-purple-500/10 h-96 flex flex-col">
                <div className="flex-grow space-y-4 overflow-y-auto pr-2 -mr-2">
                    {localHistory.map((message, index) => (
                        <div key={index} className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl flex flex-col ${ message.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700/50 text-gray-200 rounded-bl-none' }`}>
                                {message.parts.map((part, partIndex) => 'inlineData' in part && part.inlineData && <img key={partIndex} src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} alt="Dream context" className="rounded-lg mb-2 max-h-48" />)}
                                {message.parts.map((part, partIndex) => {
                                    if ('text' in part && part.text) {
                                        return <p key={partIndex} className="text-sm whitespace-pre-wrap">{part.text}</p>;
                                    }
                                    // Handle loading placeholder
                                    const isLastMessage = index === localHistory.length - 1;
                                    if (isLoading && isLastMessage && message.role === 'model' && part.text === '') {
                                         return <div key="loader" className="flex items-center gap-2"><LoadingSpinner /><span className="text-sm">Thinking...</span></div>;
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    ))}
                     {localHistory.length === 0 && !isLoading && (
                        <div className="p-2 space-y-2 animate-fade-in">
                            <p className="text-xs text-purple-300 text-center">Or start with a suggestion:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {CONVERSATION_STARTERS.map((starter) => {
                                    const text = starter.replace('{mood}', selectedDream.mood || 'neutral');
                                    return <button key={text} onClick={() => setUserInput(text)} className="text-sm text-left p-2.5 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 rounded-lg transition-colors w-full">{text}</button>
                                })}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleFormSubmit} className="mt-4 pt-4 border-t border-purple-500/10 flex items-center gap-2">
                     <button type="button" onClick={handleStageImage} disabled={!selectedDream.imageUrl || !!stagedImageUrl || isLoading} title="Attach generated image" className="p-2 text-purple-200 hover:text-white transition-colors rounded-full hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"><PaperClipIcon className="h-5 w-5" /></button>
                    <div className="flex-grow relative">
                        {stagedImageUrl && (
                            <div className="absolute bottom-14 left-0 bg-gray-800/90 p-1 border border-purple-500/50 rounded-lg shadow-lg">
                                <img src={stagedImageUrl} alt="Staged for chat" className="h-16 w-16 object-cover rounded" />
                                <button type="button" onClick={() => setStagedImageUrl(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full text-white p-0.5"><XIcon className="h-4 w-4" /></button>
                            </div>
                        )}
                        <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder={stagedImageUrl ? "Describe the image or ask..." : "Ask about your dream..."} className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all" disabled={isLoading} />
                    </div>
                    <button type="submit" disabled={isLoading || (!userInput.trim() && !stagedImageUrl)} className="p-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors disabled:bg-gray-600/50 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)]"><SendIcon /></button>
                </form>
            </div>
        </div>
    );
};

export default DreamChat;