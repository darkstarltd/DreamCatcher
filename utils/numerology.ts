
// A simple function to reduce a number to a single digit, or master numbers 11, 22
const reduceNumber = (n: number): number => {
    if (n === 11 || n === 22) {
        return n;
    }
    let sum = n;
    while (sum > 9) {
        sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
        if (sum === 11 || sum === 22) {
            return sum;
        }
    }
    return sum;
};

// Calculate Life Path number from Date of Birth (e.g., "YYYY-MM-DD")
export const calculateLifePath = (dob: string): number => {
    const [year, month, day] = dob.split('-').map(Number);
    const yearSum = reduceNumber(year);
    const monthSum = reduceNumber(month);
    const daySum = reduceNumber(day);
    return reduceNumber(yearSum + monthSum + daySum);
};

const getCharValue = (char: string): number => {
    const val = char.toLowerCase().charCodeAt(0) - 96; // a=1, b=2, etc.
    if (val < 1 || val > 26) return 0; // Not a letter
    return reduceNumber(val);
};

// Calculate Expression (Destiny) number from full name
export const calculateExpression = (fullName: string): number => {
    const total = fullName.split('').reduce((acc, char) => acc + getCharValue(char), 0);
    return reduceNumber(total);
};

const isVowel = (char: string): boolean => {
    return 'aeiou'.includes(char.toLowerCase());
};

// Calculate Soul Urge (Heart's Desire) number from vowels in full name
export const calculateSoulUrge = (fullName: string): number => {
    const total = fullName.split('').reduce((acc, char) => {
        return isVowel(char) ? acc + getCharValue(char) : acc;
    }, 0);
    return reduceNumber(total);
};
