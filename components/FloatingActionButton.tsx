import React, { useState, useContext } from 'react';
import { PlusIcon, ClipboardIcon, EditIcon } from './icons';
import { ModalContext } from '../context/ModalContext';

const FloatingActionButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const modalContext = useContext(ModalContext);

    if (!modalContext) return null;
    const { openModal } = modalContext;

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3 md:hidden">
            {/* Sub-actions */}
            <div
                className={`flex flex-col items-center gap-3 transition-all duration-300 ease-in-out ${
                    isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
            >
                <div className="group relative">
                    <button
                        onClick={() => { openModal('quickMemo'); setIsOpen(false); }}
                        className="w-12 h-12 bg-cyan-600 hover:bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg"
                    >
                        <ClipboardIcon className="h-6 w-6" />
                    </button>
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        Quick Memo
                    </span>
                </div>
                 <div className="group relative">
                    <button
                        onClick={() => { openModal('newDream'); setIsOpen(false); }}
                        className="w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg"
                    >
                        <EditIcon className="h-6 w-6" />
                    </button>
                     <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        New Dream
                    </span>
                </div>
            </div>

            {/* Main button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-full flex items-center justify-center text-white shadow-xl transform transition-transform duration-300 hover:scale-110"
            >
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
                    <PlusIcon className="h-8 w-8" />
                </div>
            </button>
        </div>
    );
};

export default FloatingActionButton;