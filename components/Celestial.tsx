
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { getCelestialContextForDate, getZodiacSignFromDate, getChineseZodiac } from '../utils/celestial';
import { getZodiacInterpretation, getMoonPhaseInterpretation } from '../services/geminiService';
import { CelestialContext } from '../types';
import { SettingsContext } from '../context/SettingsContext';
import { AuthContext } from '../context/AuthContext';
import { CometIcon, SparklesIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

const ZODIAC_EMOJIS: { [key: string]: string } = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
    Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

const CHINESE_ZODIAC_EMOJIS: { [key: string]: string } = {
    Rat: '🐀', Ox: '🐂', Tiger: '🐅', Rabbit: '🐇', Dragon: '🐉', Snake: '🐍',
    Horse: '🐎', Goat: '🐐', Monkey: '🐒', Rooster: '🐓', Dog: '🐕', Pig: '🐖'
};

const Celestial: React.FC = () => {
    const settingsContext = useContext(SettingsContext);
    const authContext = useContext(AuthContext);

    const [dailyContext, setDailyContext] = useState<CelestialContext | null>(null);
    const [moonInterpretation, setMoonInterpretation] = useState('');
    const [isLoadingMoon, setIsLoadingMoon] = useState(false);
    const [zodiacInterpretation, setZodiacInterpretation] = useState('');
    const [isLoadingZodiac, setIsLoadingZodiac] = useState(false);

    useEffect(() => {
        setDailyContext(getCelestialContextForDate(new Date()));
    }, []);
    
    const { currentUser } = authContext!;
    const { disableAIFeatures } = settingsContext!;

    const userSunSign = useMemo(() => currentUser?.dob ? getZodiacSignFromDate(new Date(currentUser.dob)) : null, [currentUser?.dob]);
    const userChineseZodiac = useMemo(() => currentUser?.dob ? getChineseZodiac(new Date(currentUser.dob).getFullYear()) : null, [currentUser?.dob]);

    const handleGetMoonInterpretation = async () => {
        if (!dailyContext) return;
        setIsLoadingMoon(true);
        try {
            const result = await getMoonPhaseInterpretation(dailyContext.moonPhase.phase);
            setMoonInterpretation(result);
        } catch (error) { console.error(error); } 
        finally { setIsLoadingMoon(false); }
    };

    const handleGetZodiacInterpretation = async () => {
        if (!userSunSign || !userChineseZodiac) return;
        setIsLoadingZodiac(true);
        try {
            const result = await getZodiacInterpretation(userSunSign, userChineseZodiac.sign);
            setZodiacInterpretation(result);
        } catch (error) { console.error(error); }
        finally { setIsLoadingZodiac(false); }
    };

    if (!dailyContext) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center">
                <CometIcon className="h-12 w-12 mx-auto text-purple-400" />
                <h2 className="text-3xl font-bold text-purple-300 mt-2">Cosmic Dashboard</h2>
                <p className="text-purple-300 max-w-2xl mx-auto">An overview of the celestial energies influencing you and your dreams.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Moon Phase Card */}
                <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg flex flex-col items-center text-center">
                    <p className="text-6xl">{dailyContext.moonPhase.emoji}</p>
                    <p className="font-bold text-white text-lg mt-2">{dailyContext.moonPhase.phase}</p>
                    <p className="text-sm text-purple-300">Today's Moon Phase</p>
                    {!disableAIFeatures && (
                        <div className="mt-4 w-full">
                            {moonInterpretation ? (
                                <blockquote className="text-sm text-gray-300 italic border-l-2 border-cyan-400/50 pl-3 text-left">{moonInterpretation}</blockquote>
                            ) : (
                                <button onClick={handleGetMoonInterpretation} disabled={isLoadingMoon} className="flex items-center justify-center gap-2 mx-auto py-2 px-3 bg-purple-600/50 hover:bg-purple-500/80 rounded-md text-sm font-semibold transition-colors disabled:opacity-50">
                                    {isLoadingMoon ? <LoadingSpinner /> : <SparklesIcon />} Interpret
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Western Zodiac Card */}
                <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg flex flex-col items-center text-center">
                    {userSunSign ? (
                        <>
                            <p className="text-6xl">{ZODIAC_EMOJIS[userSunSign]}</p>
                            <p className="font-bold text-white text-lg mt-2">{userSunSign}</p>
                            <p className="text-sm text-purple-300">Your Sun Sign</p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                             <p className="font-bold text-white text-lg">Sun Sign Unknown</p>
                             <p className="text-sm text-purple-300 mt-2">Set your DOB in your profile to see your sign.</p>
                        </div>
                    )}
                </div>

                {/* Chinese Zodiac Card */}
                 <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg flex flex-col items-center text-center">
                     {userChineseZodiac ? (
                        <>
                            <p className="text-6xl">{CHINESE_ZODIAC_EMOJIS[userChineseZodiac.animal]}</p>
                            <p className="font-bold text-white text-lg mt-2">{userChineseZodiac.animal}</p>
                            <p className="text-sm text-purple-300">Your Chinese Zodiac</p>
                            <p className="text-xs text-yellow-300 mt-2">{userChineseZodiac.sign}</p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                             <p className="font-bold text-white text-lg">Zodiac Unknown</p>
                             <p className="text-sm text-purple-300 mt-2">Set your DOB in your profile to see your sign.</p>
                        </div>
                    )}
                </div>
            </div>

            {!disableAIFeatures && userSunSign && userChineseZodiac && (
                <div className="p-6 bg-black/30 border border-purple-500/20 rounded-lg text-center">
                     <h3 className="text-xl font-semibold text-purple-200">Your Cosmic Signature</h3>
                      <div className="mt-4 w-full">
                        {zodiacInterpretation ? (
                            <blockquote className="text-md text-gray-300 italic max-w-2xl mx-auto">{zodiacInterpretation}</blockquote>
                        ) : (
                            <>
                                <p className="text-purple-300 mb-4 max-w-2xl mx-auto">Get an AI-powered interpretation of how your Western and Eastern zodiac signs combine to influence your personality and dream life.</p>
                                <button onClick={handleGetZodiacInterpretation} disabled={isLoadingZodiac} className="flex items-center justify-center gap-2 mx-auto py-2 px-3 bg-purple-600 hover:bg-purple-500 rounded-md text-sm font-semibold transition-colors disabled:opacity-50">
                                    {isLoadingZodiac ? <LoadingSpinner /> : <SparklesIcon />}
                                    {isLoadingZodiac ? 'Interpreting...' : 'Reveal My Signature'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Celestial;
