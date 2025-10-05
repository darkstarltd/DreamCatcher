import React, { useState, useContext, FormEvent } from 'react';
import { AuthContext } from '../context/AuthContext.tsx';
import { ModalContext } from '../context/ModalContext.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';
import { ArrowUpCircleIcon } from './icons';

const UpgradeModal: React.FC = () => {
    const authContext = useContext(AuthContext);
    const modalContext = useContext(ModalContext);

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [dob, setDob] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    if (!authContext || !modalContext) return null;
    const { closeModal } = modalContext;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await authContext.upgradeGuestAccount?.({ email, username, password, name, surname, dob });
            closeModal('upgrade');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upgrade failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-modal-entry" onClick={() => closeModal('upgrade')}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-lg p-8 space-y-6" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <ArrowUpCircleIcon className="h-12 w-12 mx-auto text-purple-400" />
                    <h2 className="text-3xl font-bold text-white mt-4">Upgrade Your Account</h2>
                    <p className="text-purple-300 mt-2">Create a permanent account to save your dream journal and sync across devices.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="upgrade-name" className="block text-sm font-medium text-purple-200 mb-1">Name</label>
                            <input type="text" id="upgrade-name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white" required />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="upgrade-surname" className="block text-sm font-medium text-purple-200 mb-1">Surname</label>
                            <input type="text" id="upgrade-surname" value={surname} onChange={e => setSurname(e.target.value)} className="w-full bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="upgrade-dob" className="block text-sm font-medium text-purple-200 mb-1">Date of Birth</label>
                        <input type="date" id="upgrade-dob" value={dob} onChange={e => setDob(e.target.value)} className="w-full bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white" required />
                    </div>
                    <div>
                        <label htmlFor="upgrade-username" className="block text-sm font-medium text-purple-200 mb-1">Username</label>
                        <input type="text" id="upgrade-username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white" required />
                    </div>
                    <div>
                        <label htmlFor="upgrade-email" className="block text-sm font-medium text-purple-200 mb-1">Email</label>
                        <input type="email" id="upgrade-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white" required />
                    </div>
                    <div>
                        <label htmlFor="upgrade-password" className="block text-sm font-medium text-purple-200 mb-1">Password</label>
                        <input type="password" id="upgrade-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white" required />
                    </div>
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => closeModal('upgrade')} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Cancel</button>
                        <button type="submit" disabled={isLoading} className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors flex items-center gap-2">
                             {isLoading ? <LoadingSpinner /> : 'Upgrade & Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default UpgradeModal;
