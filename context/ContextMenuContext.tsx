import React, { createContext, useState, useCallback, ReactNode } from 'react';

interface ContextMenuState {
    x: number;
    y: number;
    menuItems: ReactNode;
}

interface ContextMenuContextType {
    contextMenu: ContextMenuState | null;
    showContextMenu: (x: number, y: number, menuItems: ReactNode) => void;
    hideContextMenu: () => void;
}

export const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export const ContextMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    const showContextMenu = useCallback((x: number, y: number, menuItems: ReactNode) => {
        setContextMenu({ x, y, menuItems });
    }, []);

    const hideContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    return (
        <ContextMenuContext.Provider value={{ contextMenu, showContextMenu, hideContextMenu }}>
            {children}
        </ContextMenuContext.Provider>
    );
};