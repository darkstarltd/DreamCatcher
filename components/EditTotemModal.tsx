import React, { useState, useContext, FormEvent } from 'react';
import { DreamContext } from '../context/DreamContext.tsx';
import { ToastContext } from '../context/ToastContext.tsx';
import { Totem } from '../types.ts';

interface EditTotemModalProps {
    totem: Totem;
    onClose: () => void;
}

const EditTotemModal: React.FC<EditTotemModalProps> = ({ totem, onClose }) => {
    const context = useContext(DreamContext);
    const toastContext = useContext(ToastContext);

    const [name, setName] = useState(totem.name);
    const [description, setDescription] = useState(totem.description);
    const [imagePrompt, setImagePrompt] = useState(totem.imagePrompt);

    if (!context || !toastContext) return null;
    const { updateTotem } = context;
    const { addToast } = toastContext;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim() || !imagePrompt.trim()) {
            addToast('All fields must be filled out.', 'error');
            return;
        }
        
        updateTotem(totem.id, {
            name,
            description,
            imagePrompt,
        });

        addToast('Totem updated successfully!', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-2xl p-8 space-y-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-purple-300">Edit Totem</h2>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
                    <div>
                        <label htmlFor="totem-name" className="block text-sm font-medium text-purple-200 mb-1">Name</label>
                        <input
                            id="totem-name"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="totem-description" className="block text-sm font-medium text-purple-200 mb-1">Description</label>
                        <textarea
                            id="totem-description"
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="totem-prompt" className="block text-sm font-medium text-purple-200 mb-1">Image Prompt</label>
                        <textarea
                            id="totem-prompt"
                            rows={4}
                            value={imagePrompt}
                            onChange={e => setImagePrompt(e.target.value)}
                            className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            required
                        />
                         <p className="text-xs text-purple-400 mt-1">This prompt is used by the AI to generate the totem's image.</p>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTotemModal;