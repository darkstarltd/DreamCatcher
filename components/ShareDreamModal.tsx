import React, { useContext, useState } from 'react';
import { Dream } from '../types.ts';
import { ToastContext } from '../context/ToastContext.tsx';
import { SettingsContext } from '../context/SettingsContext.tsx';
import { DreamContext } from '../context/DreamContext.tsx';
import { UploadIcon, ImageIcon, ClipboardIcon, CheckIcon } from './icons/index.tsx';

interface ShareDreamModalProps {
    isOpen: boolean;
    onClose: () => void;
    dream: Dream;
}

const ShareDreamModal: React.FC<ShareDreamModalProps> = ({ isOpen, onClose, dream }) => {
    const toastContext = useContext(ToastContext);
    const settingsContext = useContext(SettingsContext);
    const dreamContext = useContext(DreamContext);
    
    const [sharedWith, setSharedWith] = useState<Set<string>>(new Set(dream.sharedWith || []));

    if (!isOpen || !toastContext || !settingsContext || !dreamContext) return null;
    const { addToast } = toastContext;
    const { linkedProfiles } = settingsContext;
    const { updateDream, triggerAction } = dreamContext;

    const handleDownloadImage = () => {
        if (!dream.imageUrl) return;
        const link = document.createElement('a');
        link.href = dream.imageUrl;
        // Sanitize title for filename
        const fileName = `${dream.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_dream.png`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast("Image download started!", "success");
    };

    const handleCopyText = () => {
        const textToCopy = `Title: ${dream.title}\nDate: ${dream.date}\n\n${dream.description}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            addToast("Dream text copied to clipboard!", "success");
        }, (err) => {
            console.error('Could not copy text: ', err);
            addToast("Failed to copy text.", "error");
        });
    };
    
    const handleShareToggle = (profileId: string) => {
        const newSet = new Set(sharedWith);
        if (newSet.has(profileId)) {
            newSet.delete(profileId);
        } else {
            newSet.add(profileId);
        }
        setSharedWith(newSet);
    };

    const handleUpdateSharing = () => {
        const newSharedIds = Array.from(sharedWith);
        // Only trigger action if we are sharing for the first time or adding more people
        if (newSharedIds.length > (dream.sharedWith?.length || 0)) {
            triggerAction('SHARE_DREAM');
        }
        updateDream(dream.id, { sharedWith: newSharedIds });
        addToast("Sharing settings updated!", "success");
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-lg p-8 space-y-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-purple-300 flex items-center gap-3">
                        <UploadIcon />
                        Share Dream
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="p-4 bg-black/20 rounded-lg border border-purple-500/10">
                    <h3 className="font-bold text-xl text-white">{dream.title}</h3>
                    <p className="text-sm text-purple-300">{dream.date}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={handleDownloadImage}
                        disabled={!dream.imageUrl}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!dream.imageUrl ? "No image available to download" : "Download Image"}
                    >
                        <ImageIcon />
                        Download Image
                    </button>
                    <button
                        onClick={handleCopyText}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold transition-colors"
                    >
                        <ClipboardIcon />
                        Copy Text
                    </button>
                </div>

                {linkedProfiles.length > 0 && (
                    <div className="pt-4 border-t border-purple-500/20 space-y-3">
                        <h3 className="text-lg font-semibold text-purple-200">Share with your Circle</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {linkedProfiles.map(profile => (
                                <label key={profile.id} className="flex items-center p-2 rounded-md hover:bg-purple-900/30 transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={sharedWith.has(profile.id)}
                                        onChange={() => handleShareToggle(profile.id)}
                                        className="h-5 w-5 rounded bg-gray-700 border-purple-500 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="ml-3 text-white">{profile.username} <span className="text-xs text-purple-300">({profile.relationship})</span></span>
                                </label>
                            ))}
                        </div>
                         <button
                            onClick={handleUpdateSharing}
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors"
                        >
                           <CheckIcon /> Update Sharing
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareDreamModal;