import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { GemIcon, CheckIcon, SparklesIcon } from './icons';

const Store: React.FC = () => {
    const authContext = useContext(AuthContext);
    const toastContext = useContext(ToastContext);

    if (!authContext || !toastContext) return null;
    const { currentUser, upgradeTier, addEssence } = authContext;
    const { addToast } = toastContext;
    
    const isPremium = currentUser?.subscriptionTier === 'premium';

    const handleUpgrade = () => {
        upgradeTier();
        addToast("Welcome to Lucid Navigator! Enjoy your premium features.", 'success');
    };
    
    const handlePurchaseEssence = (amount: number, price: number) => {
        addEssence(amount);
        addToast(`Added ${amount} Dream Essence to your account!`, 'success');
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center">
                <GemIcon className="h-12 w-12 mx-auto text-purple-400" />
                <h2 className="text-3xl font-bold text-purple-300 mt-2">Dream Store</h2>
                <p className="text-purple-300">Upgrade your experience or purchase Dream Essence for special AI features.</p>
            </div>

            {/* Subscription Tier Card */}
            <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg">
                <h3 className="text-2xl font-bold text-white">Your Plan: <span className="capitalize text-cyan-400">{currentUser?.subscriptionTier}</span></h3>
                <div className="mt-4 grid md:grid-cols-2 gap-6">
                    {/* Free Tier */}
                    <div className={`p-4 rounded-lg border-2 ${!isPremium ? 'border-cyan-400' : 'border-gray-700'}`}>
                        <h4 className="font-bold text-xl">Dreamer (Free)</h4>
                        <ul className="mt-2 text-sm space-y-1 text-gray-300 list-disc list-inside">
                            <li>Unlimited Dream Journaling</li>
                            <li>Basic Dashboard & Stats</li>
                            <li>Standard AI Chat Personas</li>
                            <li>5 Free Image Generations/month</li>
                        </ul>
                    </div>
                    {/* Premium Tier */}
                    <div className={`p-4 rounded-lg border-2 ${isPremium ? 'border-cyan-400' : 'border-gray-700'}`}>
                        <h4 className="font-bold text-xl">Lucid Navigator (Premium)</h4>
                         <ul className="mt-2 text-sm space-y-1 text-gray-300 list-disc list-inside">
                            <li>Everything in Free, plus:</li>
                            <li>Unlimited Image Generations</li>
                            <li>Access All AI Personas</li>
                            <li>Unlock Odyssey, Psyche Profiler & more</li>
                            <li>100 Dream Essence per month</li>
                        </ul>
                        {isPremium ? (
                            <div className="mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-green-600/20 text-green-300 rounded-md font-semibold">
                               <CheckIcon /> Current Plan
                            </div>
                        ) : (
                            <button onClick={handleUpgrade} className="mt-4 w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors flex items-center justify-center gap-2">
                               <SparklesIcon /> Upgrade for $9.99/mo
                            </button>
                        )}
                    </div>
                </div>
            </div>

             {/* Dream Essence Card */}
            <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-white">Dream Essence</h3>
                    <div className="flex items-center gap-2 text-xl font-bold text-yellow-300">
                        <GemIcon className="h-6 w-6" />
                        <span>{currentUser?.dreamEssence}</span>
                    </div>
                </div>
                <p className="text-purple-400 mt-1">Use Dream Essence to power high-cost AI features like Video Generation and Synthesis Reports.</p>
                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onClick={() => handlePurchaseEssence(50, 1.99)} className="p-4 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-center transition-colors">
                        <p className="font-bold text-white">50 Essence</p>
                        <p className="text-purple-300">$1.99</p>
                    </button>
                    <button onClick={() => handlePurchaseEssence(120, 3.99)} className="p-4 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-center transition-colors">
                        <p className="font-bold text-white">120 Essence</p>
                        <p className="text-purple-300">$3.99</p>
                    </button>
                    <button onClick={() => handlePurchaseEssence(300, 8.99)} className="p-4 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-center transition-colors">
                        <p className="font-bold text-white">300 Essence</p>
                        <p className="text-purple-300">$8.99</p>
                    </button>
                    <button onClick={() => handlePurchaseEssence(1000, 24.99)} className="p-4 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-center transition-colors">
                        <p className="font-bold text-white">1000 Essence</p>
                        <p className="text-purple-300">$24.99</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Store;