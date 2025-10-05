import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import { ModalContext } from '../context/ModalContext';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';
import { ClipboardIcon, SearchIcon, InformationCircleIcon, ArrowUpCircleIcon, LockClosedIcon, SettingsIcon, EllipsisHorizontalIcon, ArrowLeftOnRectangleIcon } from './icons';

interface SidebarProps {
    currentView: View;
    onSetView: (view: View) => void;
    onLogout: () => void;
    isMobileOpen: boolean;
    onCloseMobileNav: () => void;
}

const getInitials = (name?: string, surname?: string) => {
    const first = name ? name.charAt(0) : '';
    const second = surname ? surname.charAt(0) : '';
    return `${first}${second}`.toUpperCase() || 'G';
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onSetView, onLogout, isMobileOpen, onCloseMobileNav }) => {
    const authContext = useContext(AuthContext);
    const settingsContext = useContext(SettingsContext);
    const modalContext = useContext(ModalContext);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
                userMenuButtonRef.current && !userMenuButtonRef.current.contains(event.target as Node)
            ) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!settingsContext || !modalContext || !authContext) return null;
    const { disableAIFeatures } = settingsContext;
    const { openModal } = modalContext;
    const { currentUser } = authContext;
    
    const isGuest = currentUser?.email === 'guest@dreamcatcher.app';
    const isPremium = currentUser?.subscriptionTier === 'premium';

    const filteredNavItems = NAV_ITEMS.filter(item => !item.isAI || !disableAIFeatures);

    const handleNavClick = (view: View, isLocked: boolean, label: string) => {
        if (isLocked) {
            openModal('upgradePrompt', { featureName: label, onUpgrade: () => {
                onSetView('store');
                onCloseMobileNav();
            }});
        } else {
            onSetView(view);
            onCloseMobileNav();
        }
    };

    return (
        <aside className={`w-64 bg-black/30 backdrop-blur-md p-4 flex flex-col border-r border-purple-500/10 fixed inset-y-0 left-0 z-50 transform md:static md:flex md:translate-x-0 mobile-sidebar ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center gap-2 mb-8 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400" />
                <div>
                    <h1 className="font-bold text-xl text-white">Dream Catcher</h1>
                    <p className="text-xs text-purple-300 truncate">AI Dream Journal</p>
                </div>
            </div>

            <nav className="flex-grow space-y-2 overflow-y-auto pr-2 -mr-2">
                {filteredNavItems.map((item) => {
                    const isLocked = item.isPremium && !isPremium;
                    return (
                        <button
                            key={item.view}
                            onClick={() => handleNavClick(item.view, isLocked, item.label)}
                            className={`relative w-full flex items-center justify-between gap-3 p-2.5 rounded-lg transition-colors text-sm group ${
                                currentView === item.view
                                    ? 'bg-purple-600 text-white font-semibold'
                                    : 'text-gray-300 hover:bg-purple-500/10 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span 
                                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 bg-cyan-400 rounded-r-full transition-all duration-300 group-hover:h-6 ${currentView === item.view ? 'h-8' : ''}`}
                                ></span>
                                <item.icon className="h-5 w-5 z-10" />
                                <span className="z-10">{item.label}</span>
                            </div>
                            {isLocked && <LockClosedIcon className="h-4 w-4 text-purple-400" />}
                        </button>
                    )
                })}
            </nav>

            <div className="space-y-2 mt-4 flex-shrink-0">
                 <button
                    onClick={() => { openModal('quickMemo'); onCloseMobileNav(); }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-sm text-gray-300 hover:bg-purple-500/10 hover:text-white"
                >
                    <ClipboardIcon className="h-5 w-5" /> Quick Memo
                </button>
                <button
                    onClick={() => { openModal('search'); onCloseMobileNav(); }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-sm text-gray-300 hover:bg-purple-500/10 hover:text-white"
                >
                    <SearchIcon className="h-5 w-5" /> Global Search
                </button>
            </div>

            <div className="mt-4 pt-4 border-t border-purple-500/10">
                {isGuest && (
                    <button
                        onClick={() => { openModal('upgrade'); onCloseMobileNav(); }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-sm text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 font-semibold shadow-lg mb-2"
                    >
                        <ArrowUpCircleIcon className="h-5 w-5" />
                        Upgrade Account
                    </button>
                )}
                 <div className="relative">
                    {isUserMenuOpen && (
                        <div ref={userMenuRef} className="absolute bottom-full left-0 right-0 mb-2 w-full bg-gray-900/80 backdrop-blur-md border border-purple-500/20 rounded-lg shadow-2xl p-2 animate-fade-in">
                           <button onClick={() => { onSetView('settings'); setIsUserMenuOpen(false); onCloseMobileNav(); }} className="w-full flex items-center gap-3 p-2 rounded-md transition-colors text-sm text-gray-300 hover:bg-purple-500/10 hover:text-white"><SettingsIcon className="h-5 w-5" /> Settings</button>
                           <button onClick={() => { openModal('about'); setIsUserMenuOpen(false); onCloseMobileNav(); }} className="w-full flex items-center gap-3 p-2 rounded-md transition-colors text-sm text-gray-300 hover:bg-purple-500/10 hover:text-white"><InformationCircleIcon className="h-5 w-5" /> About & Info</button>
                           <button onClick={() => { onLogout(); setIsUserMenuOpen(false); onCloseMobileNav(); }} className="w-full flex items-center gap-3 p-2 rounded-md transition-colors text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"><ArrowLeftOnRectangleIcon className="h-5 w-5" /> {isGuest ? 'Exit Session' : 'Logout'}</button>
                        </div>
                    )}
                    <button
                        ref={userMenuButtonRef}
                        onClick={() => setIsUserMenuOpen(o => !o)}
                        className="w-full flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-purple-500/10 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                {getInitials(currentUser?.name, currentUser?.surname)}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-white truncate">{currentUser?.username}</p>
                                {!isGuest && <p className={`text-xs capitalize ${isPremium ? 'text-cyan-400' : 'text-gray-400'}`}>{currentUser?.subscriptionTier}</p>}
                            </div>
                        </div>
                        <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;