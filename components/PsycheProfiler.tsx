

import React, { useState, useContext, FC } from 'react';
import { DreamContext } from '../context/DreamContext';
import { SettingsContext } from '../context/SettingsContext';
import { ToastContext } from '../context/ToastContext';
import { PersonalityProfile, SpiritGuide, CognitivePuzzle, CognitiveAssessmentResult } from '../types';
import { generatePersonalityProfile, discoverSpiritGuide, generateCognitivePuzzles, evaluateCognitiveAnswers, generateImage } from '../services/geminiService';
import { UserCircleIcon, SparklesIcon, BrainIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

type PsycheView = 'personality' | 'guide' | 'cognitive';

const PersonalityView: FC = () => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const [profile, setProfile] = useState<PersonalityProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!dreamContext || !toastContext) return null;
    const { dreams } = dreamContext;
    const { addToast } = toastContext;

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const result = await generatePersonalityProfile(dreams);
            setProfile(result);
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to generate profile.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="text-center p-8"><LoadingSpinner /><p className="mt-2 text-purple-300">Analyzing your psyche...</p></div>;
    }

    if (profile) {
        return (
            <div className="p-6 bg-black/20 rounded-lg border border-purple-500/10 space-y-4 animate-fade-in">
                <h3 className="text-3xl font-bold text-center text-white" style={{textShadow: '0 0 10px rgba(192, 132, 252, 0.5)'}}>Your Archetype: {profile.type}</h3>
                <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-purple-300">
                    <h4>Analysis</h4>
                    <p>{profile.analysis}</p>
                    <h4>Key Traits</h4>
                    <ul className="list-disc pl-5">
                        {profile.keyTraits.map((trait, i) => <li key={i}>{trait}</li>)}
                    </ul>
                    <h4 className="!text-yellow-300">Area for Growth</h4>
                    <p className="!text-yellow-300/90">{profile.growthArea}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="text-center p-8 space-y-4">
            <h3 className="text-xl font-semibold text-white">Discover Your Dream-Based Personality</h3>
            <p className="text-purple-300 max-w-md mx-auto">Analyze your entire dream journal to reveal a personality archetype that reflects your subconscious patterns and inner world.</p>
            <button onClick={handleGenerate} disabled={dreams.length < 10} title={dreams.length < 10 ? "Needs at least 10 dreams" : "Generate Profile"} className="flex items-center justify-center gap-2 mx-auto py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:opacity-50">
                <SparklesIcon /> Generate Profile
            </button>
        </div>
    );
};

const GuideView: FC = () => {
    const dreamContext = useContext(DreamContext);
    const settingsContext = useContext(SettingsContext);
    const toastContext = useContext(ToastContext);
    const [guide, setGuide] = useState<SpiritGuide | null>(null);
    const [guideImage, setGuideImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!dreamContext || !settingsContext || !toastContext) return null;
    const { dreams } = dreamContext;
    const { userGoal, dataSaverMode } = settingsContext;
    const { addToast } = toastContext;

    const handleDiscover = async () => {
        setIsLoading(true);
        setGuide(null);
        setGuideImage(null);
        try {
            const result = await discoverSpiritGuide(dreams, userGoal);
            setGuide(result);
            const imageUrl = await generateImage(result.imagePrompt, "mystical fantasy art", dataSaverMode);
            setGuideImage(imageUrl);
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to discover guide.", "error");
        } finally {
            setIsLoading(false);
        }
    };
    
     if (isLoading) {
        return <div className="text-center p-8"><LoadingSpinner /><p className="mt-2 text-purple-300">Searching the dream ether for your guide...</p></div>;
    }

    if (guide) {
        return (
            <div className="p-6 bg-black/20 rounded-lg border border-purple-500/10 grid md:grid-cols-2 gap-6 animate-fade-in">
                <div>
                    {guideImage ? <img src={guideImage} alt={guide.name} className="w-full aspect-square object-cover rounded-lg" /> : <div className="w-full aspect-square bg-black/20 rounded-lg flex items-center justify-center"><LoadingSpinner /></div>}
                </div>
                <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-white">{guide.name}</h3>
                    <p className="text-sm text-purple-300">{guide.description}</p>
                    <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-purple-300">
                        <h4>Symbolism</h4>
                        <p>{guide.symbolism}</p>
                        <blockquote className="border-l-2 border-yellow-400/50 pl-3 text-yellow-300/90 italic">
                            {guide.message}
                        </blockquote>
                    </div>
                </div>
            </div>
        );
    }
    
     return (
        <div className="text-center p-8 space-y-4">
            <h3 className="text-xl font-semibold text-white">Discover Your Spirit Guide</h3>
            <p className="text-purple-300 max-w-md mx-auto">Embark on a guided meditation to meet a symbolic guide drawn from the depths of your own subconscious.</p>
            <button onClick={handleDiscover} disabled={dreams.length < 5} title={dreams.length < 5 ? "Needs at least 5 dreams" : "Begin Discovery"} className="flex items-center justify-center gap-2 mx-auto py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:opacity-50">
                <SparklesIcon /> Begin Discovery
            </button>
        </div>
    );
};

const CognitiveView: FC = () => {
    const dreamContext = useContext(DreamContext);
    const toastContext = useContext(ToastContext);
    const [puzzles, setPuzzles] = useState<CognitivePuzzle[] | null>(null);
    const [answers, setAnswers] = useState<(string | null)[]>([]);
    const [currentPuzzle, setCurrentPuzzle] = useState(0);
    const [result, setResult] = useState<CognitiveAssessmentResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    if (!dreamContext || !toastContext) return null;
    const { dreams } = dreamContext;
    const { addToast } = toastContext;

    const handleStart = async () => {
        setIsLoading(true);
        setResult(null);
        try {
            const generatedPuzzles = await generateCognitivePuzzles(dreams);
            setPuzzles(generatedPuzzles);
            setAnswers(new Array(generatedPuzzles.length).fill(null));
            setCurrentPuzzle(0);
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to generate puzzles.", "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnswer = async (answer: string) => {
        const newAnswers = [...answers];
        newAnswers[currentPuzzle] = answer;
        setAnswers(newAnswers);

        if (currentPuzzle < puzzles!.length - 1) {
            setCurrentPuzzle(currentPuzzle + 1);
        } else {
            setIsLoading(true);
            try {
                const assessmentResult = await evaluateCognitiveAnswers(puzzles!, newAnswers);
                setResult(assessmentResult);
            } catch (error) {
                 addToast(error instanceof Error ? error.message : "Failed to evaluate answers.", "error");
            } finally {
                setIsLoading(false);
                setPuzzles(null);
            }
        }
    };
    
    if (isLoading) {
        return <div className="text-center p-8"><LoadingSpinner /><p className="mt-2 text-purple-300">{puzzles ? 'Evaluating your answers...' : 'Generating cognitive challenges...'}</p></div>;
    }
    
    if(result) {
        return (
            <div className="p-6 bg-black/20 rounded-lg border border-purple-500/10 text-center space-y-4 animate-fade-in">
                <h3 className="text-2xl font-bold text-white">Assessment Complete!</h3>
                <p className="text-5xl font-bold text-cyan-400">{result.score} / {answers.length}</p>
                <h4 className="text-xl font-semibold text-purple-200">{result.title}</h4>
                <p className="text-gray-300 max-w-md mx-auto">{result.analysis}</p>
                <button onClick={() => setResult(null)} className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors">Try Again</button>
            </div>
        );
    }
    
    if (puzzles) {
        const puzzle = puzzles[currentPuzzle];
        return (
            <div className="p-6 bg-black/20 rounded-lg border border-purple-500/10 space-y-4 animate-fade-in">
                <p className="text-sm text-purple-300 text-center">Question {currentPuzzle + 1} of {puzzles.length}</p>
                <h4 className="text-lg font-semibold text-white text-center">{puzzle.question}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {puzzle.options.map(option => (
                        <button key={option} onClick={() => handleAnswer(option)} className="w-full p-3 bg-gray-800/60 border border-purple-500/30 rounded-lg text-white hover:bg-purple-900/40 transition-colors">
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="text-center p-8 space-y-4">
            <h3 className="text-xl font-semibold text-white">Cognitive Assessment</h3>
            <p className="text-purple-300 max-w-md mx-auto">Test your problem-solving skills with a series of unique puzzles and riddles generated from the themes of your own dreams.</p>
            <button onClick={handleStart} disabled={dreams.length < 5} title={dreams.length < 5 ? "Needs at least 5 dreams" : "Start Assessment"} className="flex items-center justify-center gap-2 mx-auto py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:opacity-50">
                <BrainIcon /> Start Assessment
            </button>
        </div>
    );
};


const PsycheProfiler: React.FC = () => {
    const [view, setView] = useState<PsycheView>('personality');

    const TabButton: FC<{ current: PsycheView, target: PsycheView, children: React.ReactNode }> = ({ current, target, children }) => (
        <button
            onClick={() => setView(target)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${current === target ? 'border-b-2 border-cyan-400 text-white' : 'text-purple-300 hover:text-white'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
             <div className="text-center">
                <UserCircleIcon className="h-12 w-12 mx-auto text-purple-400" />
                <h2 className="text-3xl font-bold text-purple-300 mt-2">Psyche Profiler</h2>
                <p className="text-purple-300 max-w-2xl mx-auto">AI-powered tools to explore your inner landscape through the lens of your dreams.</p>
            </div>

            <div className="flex border-b border-purple-500/20 mb-4">
                <TabButton current={view} target="personality"><UserCircleIcon className="h-4 w-4" /> Personality</TabButton>
                <TabButton current={view} target="guide"><SparklesIcon className="h-4 w-4" /> Spirit Guide</TabButton>
                <TabButton current={view} target="cognitive"><BrainIcon className="h-4 w-4" /> Cognitive Test</TabButton>
            </div>

            <div>
                {view === 'personality' && <PersonalityView />}
                {view === 'guide' && <GuideView />}
                {view === 'cognitive' && <CognitiveView />}
            </div>
        </div>
    );
};

export default PsycheProfiler;