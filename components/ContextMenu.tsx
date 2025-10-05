import React, { useContext, useEffect, useRef } from 'react';
import { ContextMenuContext } from '../context/ContextMenuContext';

const ContextMenu: React.FC = () => {
    const context = useContext(ContextMenuContext);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                context?.hideContextMenu();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                context?.hideContextMenu();
            }
        };

        if (context?.contextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [context]);

    if (!context || !context.contextMenu) {
        return null;
    }

    const { x, y, menuItems } = context.contextMenu;
    
    // Adjust position to prevent going off-screen
    const menuStyle: React.CSSProperties = {
        position: 'fixed',
        top: y,
        left: x,
        transform: 'translate(5px, 5px)', // Offset from cursor
    };
    
    // A more robust check might be needed here based on menu width/height
    if(window.innerHeight - y < 150) { // crude check for vertical overflow
        menuStyle.top = y - 150;
    }
     if(window.innerWidth - x < 150) { // crude check for horizontal overflow
        menuStyle.left = x - 150;
    }

    return (
        <div
            ref={menuRef}
            style={menuStyle}
            className="z-[100] bg-gray-900/80 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-2xl p-2 w-48 context-menu"
            onClick={context.hideContextMenu} // Close menu on item click
        >
            {menuItems}
        </div>
    );
};

export default ContextMenu;