import React, { useState, useContext, FormEvent, useRef, FC } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { vfs } from '../services/virtualFs';
import { AI_PERSONAS, APP_VERSION } from '../constants';
import { TrashIcon, UserCircleIcon, SparklesIcon, DatabaseIcon } from './icons';

type SettingsView = 'profile' | 'ai' | 'data';

const Settings: FC = () => {
    const settingsContext = useContext(SettingsContext);
    const authContext = useContext(AuthContext);
    const toastContext = useContext(ToastContext);
    
    const [view, setView] = useState<SettingsView>('profile');
    const [name, setName] = useState(authContext?.currentUser?.name || '');
    const [surname, setSurname] = useState(authContext?.currentUser?.surname || '');
    const [dob, setDob] = useState(authContext?.currentUser?.dob || '');
    const [deleteConfirm, setDeleteConfirm] = useState('');

    const importInputRef = useRef<HTMLInputElement>(null);

    if (!settingsContext || !authContext || !toastContext) return null;

    const {
        aiPersona, setAiPersona, userGoal, setUserGoal,
        disableAIFeatures, setDisableAIFeatures, dataSaverMode, setDataSaverMode,
    } = settingsContext;
    const { currentUser, updateUserProfile, deleteAccount, logout } = authContext;
    const { addToast } = toastContext;

    const isGuest = currentUser?.email === 'guest@dreamcatcher.app';
    const isGoogleUser = currentUser?.provider === 'google';

    const handleProfileUpdate = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await updateUserProfile({ name, surname, dob });
            addToast('Profile updated successfully!', 'success');
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to update profile.", "error");
        }
    };
    
    const handleExport = () => {
        const jsonString = vfs.exportUserData();
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.download = `dream_catcher_backup_${currentUser?.username}_${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addToast('Data export started!', 'success');
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm('WARNING: This will overwrite all your current journal data for this user. This action cannot be undone. Are you sure?')) {
            if (event.target) event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const result = e.target?.result;
                if (typeof result !== 'string') throw new Error('Failed to read file.');
                
                await vfs.importUserData(result);
                
                // Trigger a global state update event for hooks
                window.localStorage.setItem('vfs-update', Date.now().toString());

                addToast('Import successful! The app will now reload.', 'success');
                setTimeout(() => window.location.reload(), 1500);

            } catch (err) {
                addToast(err instanceof Error ? err.message : 'Failed to import data.', 'error');
            } finally {
                 if(event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== currentUser?.username) {
            addToast('Username does not match. Account deletion cancelled.', 'error');
            return;
        }
        if (window.confirm('This is your final warning. Are you absolutely sure you want to delete your account and all associated data? This action is irreversible.')) {
            try {
                await deleteAccount();
                addToast('Account deleted successfully.', 'success');
            } catch (error) {
                addToast(error instanceof Error ? error.message : "Failed to delete account.", "error");
            }
        }
    };

    const NavButton: FC<{ targetView: SettingsView; icon: React.ReactNode; label: string }> = ({ targetView, icon, label }) => (
        <button
            onClick={() => setView(targetView)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${view === targetView ? 'bg-purple-600/50 text-white' : 'hover:bg-purple-500/10 text-purple-200'}`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );

    const Toggle: FC<{checked: boolean, onChange: (checked: boolean) => void, label: string, description: string}> = ({ checked, onChange, label, description }) => (
         <label className="flex items-center justify-between cursor-pointer">
            <div>
                <span className="font-medium text-purple-200">{label}</span>
                <p className="text-xs text-purple-400">{description}</p>
            </div>
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <div className="block bg-gray-600/50 w-10 h-6 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4 bg-cyan-400' : ''}`}></div>
            </div>
        </label>
    );
    
    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col md:flex-row gap-8 p-4 animate-fade-in">
            <aside className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
                <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
                <nav className="space-y-2">
                    <NavButton targetView="profile" icon={<UserCircleIcon />} label="Profile" />
                    <NavButton targetView="ai" icon={<SparklesIcon />} label="AI & Privacy" />
                    <NavButton targetView="data" icon={<DatabaseIcon />} label="Data Management" />
                </nav>
            </aside>
            <main className="flex-1 bg-black/20 p-6 rounded-2xl border border-purple-500/10">
                {view === 'profile' && (
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-xl font-bold text-white">Your Profile</h3>
                        {isGuest ? (
                            <p className="text-purple-300">Profile editing is disabled for guest accounts. Please upgrade to a full account to save your details.</p>
                        ) : (
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-purple-200 mb-1">Email</label>
                                    <p className="text-gray-300">{currentUser?.email}</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-1">Name</label>
                                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="surname" className="block text-sm font-medium text-purple-200 mb-1">Surname</label>
                                        <input id="surname" type="text" value={surname} onChange={e => setSurname(e.target.value)} className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="dob" className="block text-sm font-medium text-purple-200 mb-1">Date of Birth</label>
                                    <input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white" />
                                </div>
                                <div className="pt-2">
                                    <button type="submit" className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors">Save Profile</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
                {view === 'ai' && (
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-xl font-bold text-white">AI & Privacy</h3>
                        <Toggle 
                            label="Disable All AI Features"
                            description="For a classic, private journaling experience without AI."
                            checked={disableAIFeatures}
                            onChange={setDisableAIFeatures}
                        />
                         <Toggle 
                            label="Data Saver Mode"
                            description="Prevents generation of images and other data-heavy content."
                            checked={dataSaverMode}
                            onChange={setDataSaverMode}
                        />
                        {!disableAIFeatures && (
                            <>
                                <div>
                                    <label htmlFor="user-goal" className="block text-sm font-medium text-purple-200 mb-1">My Primary Goal</label>
                                    <input id="user-goal" type="text" value={userGoal} onChange={(e) => setUserGoal(e.target.value)} className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white" placeholder="e.g., Achieve lucidity, creative inspiration..."/>
                                </div>
                                <div>
                                    <label htmlFor="ai-persona" className="block text-sm font-medium text-purple-200 mb-1">AI Chat Persona</label>
                                    <select id="ai-persona" value={aiPersona} onChange={(e) => setAiPersona(e.target.value)} className="w-full bg-gray-800 border border-purple-500/50 rounded-md px-3 py-2 text-white">
                                        {AI_PERSONAS.map(p => <option key={p.key} value={p.key}>{p.name}</option>)}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                )}
                {view === 'data' && (
                     <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-white">Data Management</h3>
                            <div className="mt-4 p-4 bg-black/20 rounded-lg border border-purple-500/10 space-y-3">
                                <p className="text-sm text-purple-300">Export your entire journal to a JSON file for backup, or import data from a file.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button onClick={handleExport} className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Export Journal</button>
                                    <button onClick={() => importInputRef.current?.click()} className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Import Journal</button>
                                    <input type="file" ref={importInputRef} onChange={handleImport} accept=".json" className="hidden" />
                                </div>
                            </div>
                        </div>
                        {!isGuest && (
                             <div>
                                <h3 className="text-xl font-bold text-red-400">Danger Zone</h3>
                                <div className="mt-4 p-4 bg-red-900/20 rounded-lg border border-red-500/30 space-y-4">
                                     <p className="text-sm text-red-300">
                                        Deleting your account will permanently erase all your dreams, totems, and other data. This action is irreversible.
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={`Type "${currentUser?.username}" to confirm`} className="flex-grow bg-gray-800 border border-red-500/50 rounded-md px-3 py-2 text-white" />
                                        <button onClick={handleDeleteAccount} disabled={deleteConfirm !== currentUser?.username} className="py-2 px-4 bg-red-600 hover:bg-red-500 rounded-md font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
                                            <TrashIcon /> Delete My Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Settings;