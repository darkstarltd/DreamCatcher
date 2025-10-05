import React, { useContext } from 'react';
import { ModalContext } from '../context/ModalContext';
import { XIcon, SparklesIcon } from './icons';

const UpgradePromptModal: React.FC = () => {
    const modalContext = useContext(ModalContext);

    if (!modalContext) return null;
    const { modalState, closeModal } = modalContext;
    const { isOpen, featureName, onUpgrade } = modalState.upgradePrompt;

    const handleUpgradeClick = () => {
        onUpgrade();
        closeModal('upgradePrompt');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-modal-entry" onClick={() => closeModal('upgradePrompt')}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-md p-8 space-y-6 text-center" onClick={e => e.stopPropagation()}>
                <SparklesIcon className="h-12 w-12 mx-auto text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Unlock Premium Feature</h2>
                <p className="text-purple-300">
                    The <span className="font-bold text-white">{featureName}</span> feature is available for Lucid Navigator subscribers.
                </p>
                <p className="text-sm text-purple-400">Upgrade your plan to get unlimited access to all AI tools, advanced analytics, and more.</p>
                <div className="flex justify-center gap-4 pt-4">
                    <button onClick={() => closeModal('upgradePrompt')} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Maybe Later</button>
                    <button onClick={handleUpgradeClick} className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors">
                        View Plans
                    </button>
                </div>
            </div>
        </div>
    );
};
export default UpgradePromptModal;
