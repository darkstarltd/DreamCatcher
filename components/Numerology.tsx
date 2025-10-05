

import React, { useMemo, useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { calculateLifePath, calculateExpression, calculateSoulUrge } from '../utils/numerology';
import { generateNumerologyReport } from '../services/geminiService';
import { NumerologyReport, User } from '../types';
import { NUMEROLOGY_MEANINGS } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon } from './icons';

const NumberCard: React.FC<{ number: number; title: string; subtitle: string }> = ({ number, title, subtitle }) => {
    const meaning = NUMEROLOGY_MEANINGS[number as keyof typeof NUMEROLOGY_MEANINGS] || { keyword: 'Unique', description: 'A special number.' };
    return (
        <div className="p-6 bg-black/20 rounded-xl border border-purple-500/10 text-center">
            <p className="text-6xl font-bold text-white tracking-tighter" style={{ textShadow: '0 0 15px rgba(192, 132, 252, 0.4)' }}>{number}</p>
            <h3 className="text-lg font-semibold text-purple-200 mt-2">{title}</h3>
            <p className="text-sm text-purple-300">{subtitle}</p>
            <p className="mt-4 font-bold text-yellow-300">{meaning.keyword}</p>
            <p className="text-xs text-yellow-400/80">{meaning.description}</p>
        </div>
    );
};

const Numerology: React.FC = () => {
    const authContext = useContext(AuthContext);
    const toastContext = useContext(ToastContext);
    
    const [report, setReport] = useState<NumerologyReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!authContext || !toastContext) return null;
    const { currentUser } = authContext;

    const coreNumbers = useMemo(() => {
        if (!currentUser || !currentUser.dob || !currentUser.name || !currentUser.surname) {
            return null;
        }
        const lifePath = calculateLifePath(currentUser.dob);
        const expression = calculateExpression(`${currentUser.name} ${currentUser.surname}`);
        const soulUrge = calculateSoulUrge(`${currentUser.name} ${currentUser.surname}`);
        return { lifePath, expression, soulUrge };
    }, [currentUser]);

    const handleGenerateReport = async () => {
        if (!coreNumbers || !currentUser) return;
        setIsLoading(true);
        try {
            const result = await generateNumerologyReport(currentUser as User, coreNumbers);
            setReport(result);
        } catch (error) {
            toastContext.addToast(error instanceof Error ? error.message : "Failed to generate report.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!coreNumbers) {
        return (
            <div className="text-center py-16 bg-black/20 rounded-2xl border border-purple-500/10">
                <h2 className="text-2xl font-bold text-white">Numerology Report Unavailable</h2>
                <p className="text-purple-300 mt-2">Please ensure your full name and date of birth are set in your profile to generate a report.</p>
                <p className="text-xs text-purple-400 mt-1">(This feature is unavailable for guest accounts).</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-purple-300">Your Numerology Profile</h2>
                <p className="text-purple-300 max-w-2xl mx-auto">Discover the core numbers that shape your personality, purpose, and inner desires.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <NumberCard number={coreNumbers.lifePath} title="Life Path" subtitle="Your journey & purpose" />
                <NumberCard number={coreNumbers.expression} title="Expression" subtitle="Your talents & potential" />
                <NumberCard number={coreNumbers.soulUrge} title="Soul Urge" subtitle="Your inner desires" />
            </div>

            <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg">
                 <h3 className="text-xl font-semibold text-purple-200 mb-3">Personalized AI Interpretation</h3>
                 {report ? (
                    <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-purple-300 space-y-4 animate-fade-in">
                        <h4>Life Path #{report.lifePath.number}</h4>
                        <p>{report.lifePath.analysis}</p>
                         <h4>Expression #{report.expression.number}</h4>
                        <p>{report.expression.analysis}</p>
                         <h4>Soul Urge #{report.soulUrge.number}</h4>
                        <p>{report.soulUrge.analysis}</p>
                        <h4 className="!text-yellow-300">Integrated Summary</h4>
                        <p className="!text-yellow-300/90">{report.integratedSummary}</p>
                    </div>
                 ) : (
                    <div className="text-center">
                        <p className="text-purple-300 mb-4">Generate a detailed report that synthesizes your core numbers into a single, cohesive narrative about you.</p>
                        <button
                            onClick={handleGenerateReport}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 mx-auto py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
                            {isLoading ? 'Generating Report...' : 'Generate Full Report'}
                        </button>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default Numerology;
