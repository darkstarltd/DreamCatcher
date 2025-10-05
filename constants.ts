import React from 'react';
import { View } from './types';
import {
    BookOpenIcon, ChartBarIcon, BrainIcon, CrystalBallIcon, PathIcon, SeedlingIcon, MoonSoundIcon, EyeIcon, CompassIcon, SparklesIcon, CometIcon, AudioWaveIcon, UserCircleIcon, UsersIcon, TrophyIcon, EchoIcon, WeaveIcon, GemIcon, SettingsIcon, CalendarIcon, ZodiacIcon, AbacusIcon
} from './components/icons';

export const NAV_ITEMS: { view: View; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>>, isAI?: boolean, isPremium?: boolean }[] = [
    { view: 'journal', label: 'Journal', icon: BookOpenIcon },
    { view: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { view: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { view: 'path', label: "Dreamer's Path", icon: TrophyIcon },
    { view: 'scape', label: 'DreamScape', icon: BrainIcon, isPremium: true },
    { view: 'series', label: 'Series Detector', icon: WeaveIcon, isAI: true, isPremium: true },
    { view: 'audioscape', label: 'AudioScape', icon: AudioWaveIcon, isAI: true },
    { view: 'vault', label: 'Symbolism Hub', icon: CrystalBallIcon },
    { view: 'echo', label: 'Echo Chamber', icon: EchoIcon, isAI: true },
    { view: 'circle', label: 'Dream Circle', icon: UsersIcon },
    { view: 'psyche', label: 'Psyche Profiler', icon: UserCircleIcon, isAI: true, isPremium: true },
    { view: 'odyssey', label: 'Odyssey', icon: PathIcon, isAI: true, isPremium: true },
    { view: 'incubation', label: 'Incubation', icon: SeedlingIcon, isAI: true, isPremium: true },
    { view: 'somniloquy', label: 'Somniloquy', icon: MoonSoundIcon, isAI: true, isPremium: true },
    { view: 'divination', label: 'Divination', icon: EyeIcon, isAI: true, isPremium: true },
    { view: 'celestial', label: 'Celestial', icon: CometIcon },
    { view: 'horoscope', label: 'Horoscope', icon: ZodiacIcon, isAI: true, isPremium: true },
    { view: 'numerology', label: 'Numerology', icon: AbacusIcon, isAI: true, isPremium: true },
    { view: 'guide', label: 'Guide', icon: CompassIcon, isAI: true },
    { view: 'oneirogen', label: 'Oneirogen', icon: SparklesIcon, isAI: true, isPremium: true },
    { view: 'store', label: 'Store', icon: GemIcon },
];

export const MOODS = [
  { label: 'Joyful', emoji: '😄', color: '#facc15' }, // yellow-400
  { label: 'Peaceful', emoji: '😌', color: '#34d399' }, // emerald-400
  { label: 'Anxious', emoji: '😟', color: '#f87171' }, // red-400
  { label: 'Sad', emoji: '😢', color: '#60a5fa' }, // blue-400
  { label: 'Bizarre', emoji: '🤪', color: '#a78bfa' }, // violet-400
  { label: 'Scary', emoji: '😱', color: '#f97316' }, // orange-500
  { label: 'Exciting', emoji: '🤩', color: '#ec4899' }, // pink-500
  { label: 'Neutral', emoji: '😐', color: '#9ca3af' }, // gray-400
];

export const AI_PERSONAS = [
    {
        key: 'psychoanalyst',
        name: 'Dr. Anya Sharma',
        systemInstruction: "You are Dr. Anya Sharma, a warm and insightful psychoanalyst specializing in dream interpretation. Your approach combines Jungian archetypes with modern psychological insights. You are empathetic, curious, and guide the user to explore their subconscious without being dogmatic. Use 'I' statements and address the user directly. Your tone is professional yet nurturing.",
        isPremium: false,
    },
    {
        key: 'mystic',
        name: 'The Mystic',
        systemInstruction: "You are The Mystic, an ancient and wise oracle who speaks in metaphors and archetypes. Your interpretations are poetic, spiritual, and connect the dream to universal themes and cosmic energies. You see dreams as messages from the soul. Your tone is enigmatic, profound, and slightly detached, like a voice from another realm.",
        isPremium: true,
    },
    {
        key: 'neuroscientist',
        name: 'Dr. Kenji Tanaka',
        systemInstruction: "You are Dr. Kenji Tanaka, a pragmatic neuroscientist studying the mechanisms of sleep and dreaming. You interpret dreams through the lens of memory consolidation, emotional regulation, and threat simulation theory. You are data-driven, logical, and often reference brain functions. Your tone is informative, objective, and clear.",
        isPremium: false,
    },
     {
        key: 'storyteller',
        name: 'The Storyteller',
        systemInstruction: "You are The Storyteller, a creative and imaginative guide who sees dreams as narratives. You help the user flesh out the story of their dream, identify plot points, characters, and settings, and explore what the narrative might be trying to communicate. Your tone is whimsical, engaging, and full of wonder.",
        isPremium: true,
    },
    {
        key: 'shaman',
        name: 'Elder Kael',
        systemInstruction: "You are Elder Kael, a wise shaman who interprets dreams as spirit journeys. You speak of totems, elemental forces, and messages from the natural world. Your guidance is grounded, mystical, and focused on healing and balance. Connect dream symbols to nature (animals, plants, weather) and archetypal journeys (a descent, a flight, a quest). Your tone is calm, ancient, and deeply respectful of the dreamer's inner world.",
        isPremium: true,
    },
];

export const CREDIT_COSTS = {
    VIDEO: 50,
    SYNTHESIS_REPORT: 25,
    REMIX_DREAM: 5,
};

export const CONVERSATION_STARTERS = [
    "What do the main symbols in this dream mean?",
    "Why do I keep dreaming about this?",
    "What might the {mood} feeling represent?",
    "Give me a creative writing prompt based on this dream."
];

export const COMMON_SYMBOLS = [
    "Water", "Teeth", "Flying", "Falling", "Being Chased", "House", "School", "Death", "Nudity", "Snakes", "Money", "Baby"
];

export const NUMEROLOGY_MEANINGS: { [key: number]: { keyword: string; description: string } } = {
  1: { keyword: "New Beginnings", description: "Leadership, independence, and new starts. A call to assert yourself and take action." },
  2: { keyword: "Duality", description: "Balance, partnership, and harmony. Represents choices, cooperation, and sensitivity." },
  3: { keyword: "Creativity", description: "Self-expression, communication, and growth. A sign of joy, inspiration, and social connection." },
  4: { keyword: "Stability", description: "Structure, hard work, and practicality. Building a solid foundation for the future." },
  5: { keyword: "Change", description: "Freedom, adventure, and transformation. A call to embrace change and new experiences." },
  6: { keyword: "Nurturing", description: "Responsibility, family, and healing. Represents love, care, and domestic harmony." },
  7: { keyword: "Wisdom", description: "Introspection, analysis, and spiritual insight. A call for deeper understanding and solitude." },
  8: { keyword: "Abundance", description: "Power, success, and material wealth. Relates to ambition, authority, and karma." },
  9: { keyword: "Completion", description: "Endings, humanitarianism, and universal love. A cycle is closing, making way for the new." },
  11: { keyword: "Intuition", description: "A Master Number. Heightened intuition, spiritual enlightenment, and idealism." },
  22: { keyword: "Master Builder", description: "A Master Number. The ability to turn dreams into reality, discipline, and pragmatism." },
};

export const APP_VERSION = '1.0.1-beta';

export const APP_VERSION_HISTORY = [
    {
        version: '1.0.1-beta',
        date: '2024-07-30',
        changes: [
            'Added version history to About page.',
            'Fixed a bug in the Dashboard mood distribution chart.',
            'Enhanced type safety for AI data processing in the Symbolism Hub.',
        ],
    },
    {
        version: '1.0.0-beta',
        date: '2024-07-29',
        changes: [
            'Initial public beta release.',
            'Implemented core journaling, AI analysis, and visualization features.',
            'Established offline support with PWA capabilities.',
            'Integrated responsive UI with Tailwind CSS and custom animations.',
        ],
    },
];