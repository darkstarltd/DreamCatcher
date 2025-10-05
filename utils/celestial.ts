import { CelestialContext } from '../types';

const ZODIAC_SIGNS = [
    { sign: 'Aries', emoji: '♈' }, { sign: 'Taurus', emoji: '♉' }, { sign: 'Gemini', emoji: '♊' },
    { sign: 'Cancer', emoji: '♋' }, { sign: 'Leo', emoji: '♌' }, { sign: 'Virgo', emoji: '♍' },
    { sign: 'Libra', emoji: '♎' }, { sign: 'Scorpio', emoji: '♏' }, { sign: 'Sagittarius', emoji: '♐' },
    { sign: 'Capricorn', emoji: '♑' }, { sign: 'Aquarius', emoji: '♒' }, { sign: 'Pisces', emoji: '♓' }
];

// Simplified calculation for demo purposes
const getZodiacSign = (dayOfYear: number, offset: number = 0): string => {
    const adjustedDay = (dayOfYear + offset) % 365;
    const signIndex = Math.floor(adjustedDay / (365 / 12));
    return ZODIAC_SIGNS[signIndex].sign;
};

export const getZodiacSignFromDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Aquarius";
    if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Pisces";
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus";
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini";
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer";
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio";
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius";
    return "Capricorn";
};

// Based on Julian date calculation
const getJulianDate = (date: Date): number => {
    return (date.getTime() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
};

export const getMoonPhase = (date: Date): { phase: string, emoji: string } => {
    const JD = getJulianDate(date);
    const cycleLength = 29.53;
    const knownNewMoon = 2451549.5; // New Moon of Jan 6, 2000
    const age = (JD - knownNewMoon) % cycleLength;

    if (age < 1.84566) return { phase: "New Moon", emoji: "🌑" };
    if (age < 5.53699) return { phase: "Waxing Crescent", emoji: "🌒" };
    if (age < 9.22831) return { phase: "First Quarter", emoji: "🌓" };
    if (age < 12.91963) return { phase: "Waxing Gibbous", emoji: "🌔" };
    if (age < 16.61096) return { phase: "Full Moon", emoji: "🌕" };
    if (age < 20.30228) return { phase: "Waning Gibbous", emoji: "🌖" };
    if (age < 23.99361) return { phase: "Last Quarter", emoji: "🌗" };
    if (age < 27.68493) return { phase: "Waning Crescent", emoji: "🌘" };
    return { phase: "New Moon", emoji: "🌑" };
};

export const getChineseZodiac = (year: number): { sign: string; element: string; animal: string; } => {
    const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
    const elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
    const elementCycle = ['Yang', 'Yin', 'Yang', 'Yin', 'Yang', 'Yin', 'Yang', 'Yin', 'Yang', 'Yin'];

    // Chinese zodiac is based on the lunar calendar. This is a simplified Gregorian approximation.
    // The start year should be adjusted for the lunar new year, but for simplicity, we use the Gregorian year.
    const zodiacStartYear = 1924; // A known Yang Wood Rat year
    const yearDiff = year - zodiacStartYear;

    const animalIndex = yearDiff % 12;
    const animal = animals[animalIndex < 0 ? animalIndex + 12 : animalIndex];

    const elementIndex = Math.floor(Math.abs(yearDiff) / 2) % 5;
    const element = elements[elementIndex];
    
    const yinYang = elementCycle[year % 10];

    return {
        sign: `${yinYang} ${element} ${animal}`,
        element,
        animal,
    };
};

const getDayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

export const getCelestialContextForDate = (date: Date): CelestialContext => {
    const dayOfYear = getDayOfYear(date);

    // These are simplified approximations for demonstration.
    // Real astrological calculations are far more complex.
    return {
        moonPhase: getMoonPhase(date),
        sunSign: getZodiacSign(dayOfYear, -80), // Sun is in Capricorn on Jan 1
        moonSign: getZodiacSign(dayOfYear * (365 / 27.3)), // Moon's faster cycle
        mercurySign: getZodiacSign(dayOfYear * (365 / 88)),
        venusSign: getZodiacSign(dayOfYear * (365 / 225)),
        marsSign: getZodiacSign(dayOfYear * (365 / 687)),
    };
};