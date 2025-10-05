// services/virtualFs.ts

/**
 * A simple Virtual File System (VFS) abstracting localStorage.
 * All data is namespaced by the current user's ID.
 */
class VirtualFS {
    private userId: string | null = null;
    private readonly keyPrefix = 'dream-catcher';
    private readonly userStorageKey = `${this.keyPrefix}-users`;

    /**
     * Initializes the VFS for a specific user. Must be called on login/session start.
     * @param userId The unique identifier for the user (e.g., email).
     */
    public init(userId: string | null): void {
        this.userId = userId;
    }

    private getKey(key: string): string {
        if (!this.userId) {
            // This should not happen in a logged-in state, but provides a safeguard.
            console.warn("VFS operation performed without a user session. Using a temporary key.");
            return `${this.keyPrefix}-unauthenticated-${key}`;
        }
        return `${this.keyPrefix}-${this.userId}-${key}`;
    }
    
    /**
     * Retrieves a value from storage for the current user.
     * @param key The key for the data.
     * @param defaultValue The value to return if the key doesn't exist or data is corrupt.
     * @returns The parsed data or the default value.
     */
    public get<T>(key: string, defaultValue: T): T {
        const storageKey = this.getKey(key);
        try {
            const item = window.localStorage.getItem(storageKey);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`VFS: Error parsing JSON from key "${storageKey}"`, error);
            return defaultValue;
        }
    }

    /**
     * Stores a value in storage for the current user.
     * @param key The key for the data.
     * @param value The value to store (will be JSON.stringified).
     */
    public set<T>(key: string, value: T): void {
        const storageKey = this.getKey(key);
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(value));
        } catch (error) {
            console.error(`VFS: Error setting key "${storageKey}"`, error);
        }
    }

    /**
     * Removes a key-value pair from storage for the current user.
     * @param key The key to remove.
     */
    public remove(key: string): void {
        const storageKey = this.getKey(key);
        try {
            window.localStorage.removeItem(storageKey);
        } catch (error) {
            console.error(`VFS: Error removing key "${storageKey}"`, error);
        }
    }

    /**
     * Gathers all data for the current user and returns it as a JSON string.
     * Excludes global user list.
     * @returns A JSON string representing the user's data.
     */
    public exportUserData(): string {
        if (!this.userId) return '{}';
        
        const userPrefix = `${this.keyPrefix}-${this.userId}-`;
        const userData: { [key: string]: any } = {};

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(userPrefix)) {
                try {
                    const localKey = key.substring(userPrefix.length);
                    const value = localStorage.getItem(key);
                    if (value) {
                        userData[localKey] = JSON.parse(value);
                    }
                } catch (e) {
                    console.warn(`VFS Export: Could not parse item ${key}`, e);
                }
            }
        }
        return JSON.stringify(userData, null, 2);
    }

    /**
     * Clears all existing data for the current user and imports new data from a JSON string.
     * @param jsonString The JSON string of user data to import.
     */
    public async importUserData(jsonString: string): Promise<void> {
        if (!this.userId) throw new Error("No user session active for data import.");
        
        const dataToImport = JSON.parse(jsonString);
        if (typeof dataToImport !== 'object' || dataToImport === null) {
            throw new Error('Invalid backup file format.');
        }

        await this.clearCurrentUserData();
        
        const userPrefix = `${this.keyPrefix}-${this.userId}-`;
        Object.keys(dataToImport).forEach(key => {
            const storageKey = userPrefix + key;
            localStorage.setItem(storageKey, JSON.stringify(dataToImport[key]));
        });
    }

    /**
     * Deletes all data associated with the current user.
     */
    public async clearCurrentUserData(): Promise<void> {
        if (!this.userId) return;
        const userPrefix = `${this.keyPrefix}-${this.userId}-`;
        
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(userPrefix)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

     /**
     * Deletes the user account from the global user list and all their data.
     */
    public async deleteAccount(): Promise<void> {
        if (!this.userId || this.userId === 'guest@dreamcatcher.app') return;
        
        await this.clearCurrentUserData();
        
        try {
            const users = localStorage.getItem(this.userStorageKey);
            if(users) {
                const usersObj = JSON.parse(users);
                delete usersObj[this.userId];
                localStorage.setItem(this.userStorageKey, JSON.stringify(usersObj));
            }
        } catch(e) {
            console.error('VFS: Failed to remove user from global list.', e);
        }
    }
}

// Export a singleton instance
export const vfs = new VirtualFS();