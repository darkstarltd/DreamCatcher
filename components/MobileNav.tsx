import React from 'react';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';
import { MenuIcon } from './icons';

interface MobileNavProps {
    currentView: View;
    onOpenNav: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onOpenNav }) => {
    const currentNavItem = NAV_ITEMS.find(item => item.view === currentView);
    const title = currentNavItem ? currentNavItem.label : 'Dream Journal';

    return (
        <header className="md:hidden flex-shrink-0 flex items-center justify-between p-2 bg-black/20 border-b border-purple-500/10">
            <button
                onClick={onOpenNav}
                className="p-2 text-purple-200 hover:text-white"
                aria-label="Open navigation menu"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-white">{title}</h1>
            <div className="w-10"></div> {/* Spacer */}
        </header>
    );
};

export default MobileNav;