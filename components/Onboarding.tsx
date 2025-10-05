import React, { useState, useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import { PlusIcon, ChartBarIcon, SparklesIcon, BrainIcon, StarIcon, ImageIcon } from './icons';

interface OnboardingProps {
    onFinish: () => void;
}

const GOALS = [
    {
        icon: <StarIcon />,
        title: "Achieve Lucidity",
        description: "Focus on identifying dream signs to become aware while dreaming.",
        signs: ["Flying", "Hands look weird", "Light switches don't work"],
    },
    {
        icon: <BrainIcon />,
        title: "Explore My Subconscious",
        description: "Analyze symbols and themes to gain deeper self-understanding.",
        signs: ["Water", "Teeth falling out", "Being chased"],
    },
    {
        icon: <ImageIcon />,
        title: "Creative Inspiration",
        description: "Use your dreams as a source of unique ideas and visuals.",
        signs: ["Strange creatures", "Impossible architecture", "Vivid colors"],
    }
];

const Onboarding: React.FC<OnboardingProps> = ({ onFinish }) => {
    const context = useContext(SettingsContext);
    const [step, setStep] = useState(0);

    if (!context) return null;
    const { setUserGoal, addDreamSign } = context;

    const handleGoalSelect = (goal: typeof GOALS[0]) => {
        setUserGoal(goal.title);
        goal.signs.forEach(sign => addDreamSign(sign));
        setStep(4); // Move to final step after goal selection
    };

    const handleFinish = () => {
        onFinish();
    };

    const stepsContent = [
        {
            icon: <SparklesIcon className="h-16 w-16 text-purple-300 mb-4"/>,
            title: "Welcome to Dream Catcher",
            description: "Your personal AI-powered dream journal. Let's take a quick tour of the core features.",
        },
        {
            icon: <PlusIcon className="h-16 w-16 text-purple-300 mb-4"/>,
            title: "Record Your Dreams",
            description: "Use the 'New Dream' button to log your nightly adventures. You can type, transcribe via voice, or record an audio memo.",
        },
        {
            icon: <ChartBarIcon className="h-16 w-16 text-purple-300 mb-4"/>,
            title: "Discover Insights",
            description: "The Dashboard visualizes your dream data, revealing patterns in moods, common themes, and recurring symbols.",
        },
        {
            icon: <SparklesIcon className="h-16 w-16 text-purple-300 mb-4"/>,
            title: "Unleash AI Magic",
            description: "Generate stunning images from your dreams, chat with an AI guide, and interpret symbols.",
        },
        {
            icon: <BrainIcon className="h-16 w-16 text-purple-300 mb-4"/>,
            title: "Set Your Intention",
            description: "What is your primary goal for journaling? This will help personalize your experience.",
        },
        {
            icon: <StarIcon className="h-16 w-16 text-purple-300 mb-4"/>,
            title: "You're All Set!",
            description: "You're ready to begin your journey into the world of dreams. Start by recording your first dream!",
        }
    ];

    const currentStep = stepsContent[step];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-[60] p-4 animate-fade-in">
            <div className="bg-gray-900/80 border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/20 p-8 text-center flex flex-col items-center w-full max-w-2xl">
                <div className="animate-fade-in" key={step}>
                    {currentStep.icon}
                    <h2 className="text-3xl font-bold text-white">{currentStep.title}</h2>
                    <p className="text-gray-300 mt-2 max-w-md mx-auto">{currentStep.description}</p>
                </div>
                
                {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 w-full animate-fade-in">
                        {GOALS.map(goal => (
                            <button 
                                key={goal.title}
                                onClick={() => handleGoalSelect(goal)}
                                className="p-4 bg-black/20 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 hover:border-purple-500 transition-all text-left flex flex-col items-center text-center transform hover:scale-105"
                            >
                                <div className="text-purple-300 mb-2 h-8 w-8">{goal.icon}</div>
                                <h3 className="font-semibold text-white">{goal.title}</h3>
                                <p className="text-sm text-purple-300 mt-1 flex-grow">{goal.description}</p>
                            </button>
                        ))}
                    </div>
                )}
                
                <div className="mt-8 flex items-center justify-between w-full">
                    {step > 0 && step < 4 ? (
                         <button onClick={() => setStep(step - 1)} className="py-2 px-4 bg-gray-700/50 hover:bg-gray-700/80 rounded-lg transition-colors">Back</button>
                    ) : ( <div></div> )}
                    {step < 3 ? (
                        <button onClick={() => setStep(step + 1)} className="py-2 px-6 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors shadow-[0_0_15px_rgba(168,85,247,0.5)]">Next</button>
                    ) : step === 4 ? (
                         <button onClick={handleFinish} className="py-2 px-6 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors shadow-[0_0_15px_rgba(168,85,247,0.5)]">Enter Dream Catcher</button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;