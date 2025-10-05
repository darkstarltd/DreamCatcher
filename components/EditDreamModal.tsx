import React, { useState, useContext, FormEvent } from 'react';
import { DreamContext } from '../context/DreamContext.tsx';
import { SettingsContext } from '../context/SettingsContext.tsx';
import { ToastContext } from '../context/ToastContext.tsx';
import { Dream } from '../types.ts';
import { MOODS } from '../constants.ts';
import { StarRatingInput } from './NewDreamModal.tsx';

interface EditDreamModalProps {
    dream: Dream;
    onClose: () => void;
}

const EditDreamModal: React.FC<EditDreamModalProps> = ({ dream, onClose }) => {
    const context = useContext(DreamContext);
    const settingsContext = useContext(SettingsContext);
    const toastContext = useContext(ToastContext);

    const [title, setTitle] = useState(dream.title);
    const [description, setDescription] = useState(dream.description);
    const [mood, setMood] = useState(dream.mood);
    const [tags, setTags] = useState(dream.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [isRecurring, setIsRecurring] = useState(dream.isRecurring);
    const [lucidity, setLucidity] = useState(dream.lucidity);
    const [clarity, setClarity] = useState(dream.clarity);
    const [sharedWith, setSharedWith] = useState<Set<string>>(new Set(dream.sharedWith || []));

    if (!context || !toastContext || !settingsContext) return null;
    const { updateDream } = context;
    const { linkedProfiles } = settingsContext;
    const { addToast } = toastContext;

    const handleTagInputChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (title && description) {
            updateDream(dream.id, {
                title,
                description,
                mood,
                tags,
                isRecurring,
                lucidity,
                clarity,
                sharedWith: Array.from(sharedWith),
            });
            addToast('Dream updated successfully!', 'success');
            onClose();
        } else {
            addToast('Title and description cannot be empty.', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-2xl p-8 space-y-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-purple-300">Edit Dream</h2>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
                    <div className="flex items-start gap-4">
                        <div className="flex-grow">
                             <label htmlFor="edit-title" className="block text-sm font-medium text-purple-200 mb-1">Title</label>
                             <input type="text" id="edit-title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none" required />
                        </div>
                         <div className="pt-7">
                             <label htmlFor="edit-is-recurring" className="flex items-center cursor-pointer">
                                <span className="mr-3 text-sm font-medium text-purple-200 whitespace-nowrap">Recurring</span>
                                <div className="relative">
                                    <input type="checkbox" id="edit-is-recurring" className="sr-only" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                                    <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isRecurring ? 'transform translate-x-4 bg-purple-400' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div>
                         <label htmlFor="edit-description" className="block text-sm font-medium text-purple-200 mb-1">Description</label>
                         <textarea id="edit-description" value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none" required />
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <label className="text-sm font-medium text-purple-200 w-20">Lucidity</label>
                            <StarRatingInput rating={lucidity} setRating={setLucidity} />
                        </div>
                         <div className="flex items-center">
                            <label className="text-sm font-medium text-purple-200 w-20">Clarity</label>
                            <StarRatingInput rating={clarity} setRating={setClarity} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">Primary Mood</label>
                        <div className="flex flex-wrap gap-2">
                            {MOODS.map(({label, emoji}) => (
                                <button key={label} type="button" onClick={() => setMood(label)} className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 flex items-center gap-2 border ${mood === label ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-800 border-gray-700 hover:border-purple-500'}`}>
                                    <span>{emoji}</span> {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                         <label htmlFor="edit-tags" className="block text-sm font-medium text-purple-200 mb-1">Tags</label>
                         <div className="flex flex-wrap gap-2 p-2 bg-gray-800 border border-purple-500/50 rounded-md min-h-[42px]">
                            {tags.map(tag => (
                                <div key={tag} className="bg-purple-800/70 text-purple-100 text-sm font-medium pl-3 pr-1 py-1 rounded-full flex items-center gap-1">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="text-purple-200 hover:text-white">&times;</button>
                                </div>
                            ))}
                             <input id="edit-tags" type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagInputChange} placeholder={tags.length === 0 ? "Add tags..." : ""} className="bg-transparent focus:outline-none text-white flex-grow" />
                         </div>
                    </div>
                     {linkedProfiles.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-2">Share With</label>
                            <div className="space-y-2">
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
                        </div>
                    )}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDreamModal;