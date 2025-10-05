import React, { useContext } from 'react';
import { ModalContext } from '../context/ModalContext';
import { PlusIcon } from './icons';

const Welcome: React.FC = () => {
    const modalContext = useContext(ModalContext);
    if (!modalContext) return null;
    const { openModal } = modalContext;

    return (
        <div className="bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/10 shadow-2xl shadow-purple-500/10 flex flex-col items-center justify-center text-center h-full space-y-6">
            <h2 className="text-5xl font-bold text-shadow text-white" style={{textShadow: '0 0 20px rgba(192, 132, 252, 0.6)'}}>
                Your Journey Awaits
            </h2>
            <p className="text-xl text-purple-200 max-w-2xl">
                Your subconscious is a vast landscape of symbols and stories. Begin charting it now.
            </p>
            <button
                onClick={() => openModal('newDream')}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 transition-all duration-300 text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.6)] transform hover:scale-105 text-lg"
            >
                <PlusIcon />
                Record Your First Dream
            </button>
        </div>
    );
};

export default Welcome;