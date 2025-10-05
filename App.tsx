import React, { useContext, useState, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DreamProvider } from './context/DreamContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';
import { ContextMenuProvider } from './context/ContextMenuContext';
import Auth from './components/Auth';
import SplashScreen from './components/SplashScreen';
import MainApp from './MainApp';
import OfflineIndicator from './components/OfflineIndicator';

const AppContent: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFading(true);
            setTimeout(() => setIsAppLoading(false), 500); // Wait for fade out animation
        }, 2000); // Show splash screen for 2 seconds

        return () => clearTimeout(timer);
    }, []);

    if (authContext?.isLoading || isAppLoading) {
        return <SplashScreen isFading={isFading} />;
    }

    return authContext?.currentUser ? <MainApp /> : <Auth />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <SettingsProvider>
            <ToastProvider>
                <DreamProvider>
                    <ModalProvider>
                        <ContextMenuProvider>
                             <div className="bg-gray-900 text-white min-h-screen font-sans bg-grid-purple-500/[0.05]">
                                <OfflineIndicator />
                                <AppContent />
                            </div>
                        </ContextMenuProvider>
                    </ModalProvider>
                </DreamProvider>
            </ToastProvider>
        </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
