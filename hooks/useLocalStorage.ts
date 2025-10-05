import React, { useState, useCallback, useEffect } from 'react';
import { vfs } from '../services/virtualFs';

// This hook now acts as a reactive layer on top of the VFS.
export const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    // The state is initialized by reading from the VFS.
    // The VFS must be initialized with a userId before this hook is used.
    const [storedValue, setStoredValue] = useState<T>(() => {
        return vfs.get(key, initialValue);
    });

    const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback((value) => {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Update React state
        setStoredValue(valueToStore);
        
        // Persist to storage via VFS
        vfs.set(key, valueToStore);
    }, [key, storedValue]);
    
    // This effect handles cases where data might change externally (e.g., after import)
    // and the component needs to re-sync.
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            // A bit of a blunt instrument, but we can listen for a general 'vfs-update' event
            if (event.key === 'vfs-update') {
                 setStoredValue(vfs.get(key, initialValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, initialValue]);


    return [storedValue, setValue];
};