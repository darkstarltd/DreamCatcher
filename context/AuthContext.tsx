import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, SubscriptionTier } from '../types.ts';
import { vfs } from '../services/virtualFs.ts';

const GUEST_USER_EMAIL = 'guest@dreamcatcher.app';

export interface AuthContextType {
    currentUser: Omit<User, 'passwordHash'> | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: Omit<User, 'passwordHash' | 'provider' | 'subscriptionTier' | 'dreamEssence'> & { password: string }) => Promise<void>;
    logout: () => void;
    continueAsGuest: () => void;
    loginWithGoogle: () => Promise<void>;
    upgradeGuestAccount: (userData: Omit<User, 'passwordHash' | 'provider' | 'subscriptionTier' | 'dreamEssence'> & { password: string }) => Promise<void>;
    updateUserProfile: (updates: Partial<Omit<User, 'passwordHash'>>) => Promise<void>;
    deleteAccount: () => Promise<void>;
    upgradeTier: () => void;
    addEssence: (amount: number) => void;
    useEssence: (amount: number) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

const USERS_STORAGE_KEY = 'dream-catcher-users';
const SESSION_STORAGE_KEY = 'dream-catcher-session';

const fakeHash = (password: string) => btoa(password);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<Omit<User, 'passwordHash'> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getUsers = (): Record<string, User> => {
        try {
            const users = localStorage.getItem(USERS_STORAGE_KEY);
            return users ? JSON.parse(users) : {};
        } catch {
            return {};
        }
    };
    
    const setUsers = (users: Record<string, User>) => {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    useEffect(() => {
        try {
            const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (sessionData) {
                const parsedUser = JSON.parse(sessionData);
                vfs.init(parsedUser.email); // Initialize VFS with user ID

                if (parsedUser.email !== GUEST_USER_EMAIL) {
                    const users = getUsers();
                    const persistentUser = users[parsedUser.email];
                    if (persistentUser) {
                        // FIX: Destructure to correctly omit passwordHash for the state type.
                        const { passwordHash, ...userToStore } = persistentUser;
                        setCurrentUser(userToStore);
                    }
                } else {
                     // For guest, we construct the user object from VFS data
                    setCurrentUser({
                        ...parsedUser,
                        subscriptionTier: vfs.get('subscriptionTier', 'free'),
                        dreamEssence: vfs.get('dreamEssence', 20),
                    });
                }
            } else {
                vfs.init(null); // No session
            }
        } catch (error) {
            console.error("Failed to parse session data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateUserSession = (user: Omit<User, 'passwordHash'> | null) => {
        setCurrentUser(user);
        if (user) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
            vfs.init(user.email);
            if(user.email === GUEST_USER_EMAIL){
                // For guest, also persist essential fields for session recovery
                vfs.set('subscriptionTier', user.subscriptionTier);
                vfs.set('dreamEssence', user.dreamEssence);
            }
        } else {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            vfs.init(null);
        }
    };


    const login = async (email: string, password: string): Promise<void> => {
        const users = getUsers();
        const user = users[email];
        if (user && user.provider === 'google') {
            throw new Error("This account uses Google Sign-In. Please use the 'Continue with Google' button.");
        }
        if (user && user.passwordHash === fakeHash(password)) {
            const { passwordHash, ...userToStore } = user;
            updateUserSession(userToStore);
        } else {
            throw new Error("Invalid email or password.");
        }
    };

    const signup = async (userData: Omit<User, 'passwordHash' | 'provider' | 'subscriptionTier' | 'dreamEssence'> & { password: string }): Promise<void> => {
        const users = getUsers();
        if (users[userData.email]) throw new Error("An account with this email already exists.");
        
        const usernameExists = Object.values(users).some(u => u.username.toLowerCase() === userData.username.toLowerCase());
        if (usernameExists) throw new Error("This username is already taken. Please choose another.");

        const { password, ...restOfUser } = userData;
        const newUser: User = {
            ...restOfUser,
            passwordHash: fakeHash(password),
            provider: 'email',
            subscriptionTier: 'free',
            dreamEssence: 20,
        };

        users[userData.email] = newUser;
        setUsers(users);

        const { passwordHash, ...userToStore } = newUser;
        updateUserSession(userToStore);
    };
    
    const loginWithGoogle = async (): Promise<void> => {
        const name = prompt("SIMULATION: Please enter your Google display name:", "Jane Doe");
        if (!name) throw new Error("Google sign-in cancelled.");
        
        const email = prompt("SIMULATION: Please enter your Google email:", `jane.doe${Math.floor(Math.random()*1000)}@gmail.com`);
        if (!email) throw new Error("Google sign-in cancelled.");

        const users = getUsers();
        let user = users[email];

        if (user && user.provider !== 'google') {
            throw new Error("An account with this email already exists. Please sign in with your password.");
        }

        if (!user) {
            const nameParts = name.split(' ');
            const newUser: User = {
                email,
                username: email.split('@')[0],
                name: nameParts[0] || 'Jane',
                surname: nameParts.slice(1).join(' ') || 'Doe',
                dob: '',
                provider: 'google',
                subscriptionTier: 'free',
                dreamEssence: 20,
            };
            users[email] = newUser;
            setUsers(users);
            user = newUser;
        }

        const { passwordHash, ...userToStore } = user;
        updateUserSession(userToStore);
    };

    const upgradeGuestAccount = async (userData: Omit<User, 'passwordHash' | 'provider' | 'subscriptionTier' | 'dreamEssence'> & { password: string }): Promise<void> => {
        const users = getUsers();
        if (users[userData.email]) throw new Error("An account with this email already exists.");
        
        const usernameExists = Object.values(users).some(u => u.username.toLowerCase() === userData.username.toLowerCase());
        if (usernameExists) throw new Error("This username is already taken.");

        // Temporarily init VFS with guest ID to read data
        vfs.init(GUEST_USER_EMAIL);
        const guestData = vfs.exportUserData();
        
        const { password, ...restOfUser } = userData;
        const newUser: User = {
            ...restOfUser,
            passwordHash: fakeHash(password),
            provider: 'email',
            subscriptionTier: vfs.get('subscriptionTier', 'free'),
            dreamEssence: vfs.get('dreamEssence', 20),
        };
        
        // Init VFS with new user ID and import guest data
        vfs.init(newUser.email);
        await vfs.importUserData(guestData);

        // Clear old guest data
        vfs.init(GUEST_USER_EMAIL);
        await vfs.clearCurrentUserData();
        
        // Save New User and Update Session
        users[newUser.email] = newUser;
        setUsers(users);

        const { passwordHash, ...userToStore } = newUser;
        updateUserSession(userToStore);
    };

    const continueAsGuest = () => {
        const guestUser = {
            email: GUEST_USER_EMAIL, username: 'Guest', name: 'Guest', surname: 'User', dob: '',
            subscriptionTier: 'free' as SubscriptionTier, dreamEssence: 20,
        };
        updateUserSession(guestUser);
    };
    
    const updateUserProfile = async (updates: Partial<Omit<User, 'passwordHash'>>) => {
        if (!currentUser || currentUser.email === GUEST_USER_EMAIL) return;
        
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser); // Update local state immediately

        // Persist to global user list
        const users = getUsers();
        if(users[currentUser.email]) {
            users[currentUser.email] = { ...users[currentUser.email], ...updates };
            setUsers(users);
        }
    };
    
    const deleteAccount = async () => {
        if (!currentUser || currentUser.email === GUEST_USER_EMAIL) return;
        await vfs.deleteAccount();
        logout();
    };


    const upgradeTier = () => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, subscriptionTier: 'premium' as SubscriptionTier, dreamEssence: currentUser.dreamEssence + 100 };
        updateUserSession(updatedUser);
        
        if (currentUser.email !== GUEST_USER_EMAIL) {
            const users = getUsers();
            if (users[currentUser.email]) {
                users[currentUser.email].subscriptionTier = 'premium';
                users[currentUser.email].dreamEssence += 100;
                setUsers(users);
            }
        }
    };

    const addEssence = (amount: number) => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, dreamEssence: currentUser.dreamEssence + amount };
        updateUserSession(updatedUser);
        if (currentUser.email !== GUEST_USER_EMAIL) {
            const users = getUsers();
            if (users[currentUser.email]) {
                users[currentUser.email].dreamEssence += amount;
                setUsers(users);
            }
        }
    };
    
    const useEssence = (amount: number): boolean => {
        if (!currentUser || currentUser.dreamEssence < amount) return false;
        
        const newBalance = currentUser.dreamEssence - amount;
        const updatedUser = { ...currentUser, dreamEssence: newBalance };
        updateUserSession(updatedUser);

        if (currentUser.email !== GUEST_USER_EMAIL) {
            const users = getUsers();
            if (users[currentUser.email]) {
                users[currentUser.email].dreamEssence = newBalance;
                setUsers(users);
            }
        }
        return true;
    };


    const logout = async () => {
        if (currentUser?.email === GUEST_USER_EMAIL) {
           await vfs.clearCurrentUserData();
        }
        updateUserSession(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, isLoading, login, signup, logout, continueAsGuest, loginWithGoogle, upgradeGuestAccount, updateUserProfile, deleteAccount, upgradeTier, addEssence, useEssence }}>
            {children}
        </AuthContext.Provider>
    );
};