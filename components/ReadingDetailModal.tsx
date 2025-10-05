import React from 'react';
import { SavedOracleReading } from '../types';
import { XIcon } from './icons';

interface ReadingDetailModalProps {
    reading: SavedOracleReading;
    onClose: () => void;
}

const ReadingDetailModal: React.FC<ReadingDetailModalProps> = ({ reading, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-2xl max-h-[90vh] p-8 flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-shrink-0">
                    <div className="flex justify-between items-start mb-1">
                        <h2 className="text-3xl font-bold text-purple-300">Oracle Reading</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon /></button>
                    </div>
                    <p className="text-purple-400">
                        Reading from {reading.date}
                    </p>
                    <blockquote className="mt-2 text-lg text-white italic border-l-4 border-purple-500/50 pl-4">
                        "{reading.question}"
                    </blockquote>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 mt-6">
                    <div className="p-4 bg-black/20 rounded-lg border border-purple-500/20">
                        <p className="text-xs text-purple-300 uppercase tracking-widest">{reading.cardType}</p>
                        <h3 className="text-2xl font-bold text-white">{reading.cardName}</h3>
                        <div className="mt-4 space-y-3 text-sm text-gray-300">
                            <div>
                                <h4 className="font-semibold text-purple-300">Upright:</h4>
                                <p>{reading.upright}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-purple-300">Reversed:</h4>
                                <p>{reading.reversed}</p>
                            </div>
                            <div className="p-3 bg-yellow-500/10 border-l-4 border-yellow-500/50">
                                <h4 className="font-semibold text-yellow-200">Guidance:</h4>
                                <p className="text-yellow-300">{reading.guidance}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 flex-shrink-0">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ReadingDetailModal;