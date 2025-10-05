import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { XIcon } from './icons';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon: React.ReactElement;
    isLoading: boolean;
    loadingText: string;
    error: string | null;
    children: React.ReactNode;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, title, icon, isLoading, loadingText, error, children }) => {
    if (!isOpen) return null;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-purple-300">
                    <LoadingSpinner />
                    <p className="mt-4">{loadingText}</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-300 rounded-lg">
                    <p className="font-bold">Analysis Failed</p>
                    <p>{error}</p>
                </div>
            );
        }
        return children;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900/80 border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/20 w-full max-w-2xl p-8" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                     <div className="flex items-center gap-3">
                        <span className="text-purple-300">{React.cloneElement(icon as React.ReactElement<any>, { className: "h-8 w-8" })}</span>
                        <h2 className="text-3xl font-bold text-white">{title}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon /></button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto pr-4 -mr-4">
                    {renderContent()}
                </div>
                
                <div className="flex justify-end pt-6 mt-6 border-t border-purple-500/10">
                    <button onClick={onClose} className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]">Close</button>
                </div>
            </div>
        </div>
    );
};

// To allow it to be imported as PatternAnalysisModal still
export default AnalysisModal;