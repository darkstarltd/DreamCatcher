import React, { useContext } from 'react';
import { ToastContext } from '../context/ToastContext.tsx';
import Toast from './Toast.tsx';

const ToastContainer: React.FC = () => {
    const context = useContext(ToastContext);
    if (!context) return null;

    const { toasts, removeToast } = context;

    return (
        <div className="fixed bottom-4 right-4 z-[100] w-full max-w-xs space-y-3">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onDismiss={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default ToastContainer;