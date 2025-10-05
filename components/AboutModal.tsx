import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';
import { APP_VERSION, APP_VERSION_HISTORY } from '../constants';
import { InformationCircleIcon, XIcon } from './icons';

const AboutModal: React.FC = () => {
    const authContext = useContext(AuthContext);
    const modalContext = useContext(ModalContext);

    if (!modalContext) return null;
    const { closeModal } = modalContext;

    const username = authContext?.currentUser?.username || 'Guest';

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-modal-entry" onClick={() => closeModal('about')}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
                <button onClick={() => closeModal('about')} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <XIcon />
                </button>
                
                <div className="text-center">
                    <InformationCircleIcon className="h-12 w-12 mx-auto text-purple-400" />
                    <h2 className="text-3xl font-bold text-white mt-4">Dream Catcher</h2>
                    <p className="text-purple-300">Version {APP_VERSION}</p>
                </div>

                <div className="my-6 text-center text-gray-300 space-y-2">
                    <p>Made with &lt;3 by</p>
                    <p className="font-semibold text-lg">Sovereign Entities & Darkstar Realities</p>
                </div>
                
                <div className="my-4 text-left text-sm max-h-40 overflow-y-auto pr-2">
                    <h3 className="font-bold text-purple-200 mb-2">Version History</h3>
                    {APP_VERSION_HISTORY.map(item => (
                        <div key={item.version} className="mb-3">
                            <p className="font-semibold text-white">{item.version} ({item.date})</p>
                            <ul className="list-disc list-inside text-gray-400 pl-2">
                                {item.changes.map((change, index) => <li key={index}>{change}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="text-xs text-center text-purple-400 p-3 bg-black/20 rounded-md border border-purple-500/10">
                    <p>Registered to: <span className="font-bold text-purple-200">{username}</span></p>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
