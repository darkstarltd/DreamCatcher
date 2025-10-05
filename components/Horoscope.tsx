import React, { useState, useEffect, useMemo, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import { ToastContext } from '../context/ToastContext';
import { getCelestialContextForDate, getZodiacSignFromDate } from '../utils/celestial';
import { generateDreamHoroscope } from '../services/geminiService';
import { InDepthHoroscope } from '../types';
import { SparklesIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

const ZODIAC_EMOJIS: { [key: string]: string } = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
    Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

type HoroscopePeriod = 'today' | 'weekly' | 'monthly';

const Horoscope: React.FC = () => {
    const authContext = useContext(AuthContext);
    const settingsContext = useContext(SettingsContext);
    const toastContext = useContext(ToastContext);

    const [period, setPeriod] = useState<HoroscopePeriod>('today');
    const [horoscopes, setHoroscopes] = useState<Partial<Record<HoroscopePeriod, InDepthHoroscope>>>({});
    const [isLoading, setIsLoading] = useState(false);

    const { currentUser } = authContext!;
    const userSunSign = useMemo(() => currentUser?.dob ? getZodiacSignFromDate(new Date(currentUser.dob)) : null, [currentUser]);

    useEffect(() => {
        const fetchHoroscope = async () => {
            if (!userSunSign || horoscopes[period] || settingsContext?.disableAIFeatures) return;

            setIsLoading(true);
            try {
                const celestialContext = getCelestialContextForDate(new Date());
                const result = await generateDreamHoroscope(userSunSign, celestialContext, period);
                setHoroscopes(prev => ({ ...prev, [period]: result }));
            } catch (error) {
                toastContext?.addToast(error instanceof Error ? error.message : `Failed to get ${period} horoscope.`, "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHoroscope();
    }, [period, userSunSign, horoscopes, settingsContext, toastContext]);

    const currentReport = horoscopes[period];

    if (settingsContext?.disableAIFeatures) {
        return <div className="text-center p-8">AI features are disabled in settings.</div>;
    }

    if (!userSunSign) {
        return (
            <div className="text-center py-16 bg-black/20 rounded-2xl border border-purple-500/10">
                <h2 className="text-2xl font-bold text-white">Horoscope Unavailable</h2>
                <p className="text-purple-300 mt-2">Please set your Date of Birth in your profile to receive a personalized dream horoscope.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center p-6 bg-black/20 rounded-2xl border border-purple-500/10">
                <p className="text-8xl">{ZODIAC_EMOJIS[userSunSign]}</p>
                <h2 className="text-4xl font-bold text-white mt-2">{userSunSign} Dream Horoscope</h2>
                <p className="text-purple-300">Astrological insights into your subconscious landscape.</p>
            </div>
            
            <div className="flex justify-center gap-2 p-2 bg-black/20 rounded-lg">
                {(['today', 'weekly', 'monthly'] as HoroscopePeriod[]).map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors capitalize w-full ${period === p ? 'bg-purple-600 text-white' : 'text-purple-200 hover:bg-purple-500/20'}`}
                    >
                        {p === 'today' ? 'Daily' : p}
                    </button>
                ))}
            </div>

            <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg min-h-[24rem] flex items-center justify-center">
                {isLoading ? (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-purple-300">Consulting the cosmos for your {period} forecast...</p>
                    </div>
                ) : currentReport ? (
                    <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-purple-300 space-y-4 animate-fade-in">
                        <h4>Overall Theme</h4>
                        <p>{currentReport.overallTheme}</p>
                        
                        <h4>Key Dream Symbols to Watch For</h4>
                        <div className="flex flex-wrap gap-2">
                            {currentReport.keyDreamSymbols.map(symbol => (
                                <span key={symbol} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200">
                                    <SparklesIcon className="h-3 w-3" />
                                    {symbol}
                                </span>
                            ))}
                        </div>
                        
                        <h4>Emotional Landscape</h4>
                        <p>{currentReport.emotionalLandscape}</p>
                        
                        <h4 className="!text-yellow-300">Actionable Advice</h4>
                        <p className="!text-yellow-300/90">{currentReport.actionableAdvice}</p>
                    </div>
                ) : (
                    <p className="text-purple-400">Select a period to view your horoscope.</p>
                )}
            </div>
        </div>
    );
};

export default Horoscope;