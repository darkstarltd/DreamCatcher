import { GoogleGenAI, Type, GenerateContentResponse, Modality, GenerateContentStreamResponse } from "@google/genai";
import { Dream, Totem, SymbolEntry, SynthesisReport, Odyssey, User, CelestialContext, NumerologyReport, OracleReading, ChatPart, PersonalityProfile, SpiritGuide, CognitivePuzzle, CognitiveAssessmentResult, DreamSeries, ChatMessage, OdysseyStep, DreamSeriesAnalysis, DreamEcho, InDepthHoroscope, DreamComparisonReport } from '../types';
import { AI_PERSONAS, MOODS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Helper to check for offline status before making an API call
const checkOffline = () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error("You are offline. This feature requires an internet connection.");
    }
};

const parseJsonResponse = <T>(jsonString: string): T => {
    try {
        const cleanedString = jsonString.replace(/^```json\s*|```\s*$/g, '').trim();
        return JSON.parse(cleanedString) as T;
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonString, e);
        throw new Error("The AI returned a response in an unexpected format.");
    }
};

export const analyzeDreamForMetadata = async (title: string, description: string, lexicon: SymbolEntry[]): Promise<{ mood: string; tags: string[]; summary: string }> => {
    checkOffline();
    const prompt = `Analyze the following dream. Use the user's personal symbol lexicon for context if provided.
    Dream: "${title}: ${description}"
    User's lexicon: ${JSON.stringify(lexicon)}
    
    1.  Determine the primary mood. Choose ONE from: ${MOODS.map(m => m.label).join(', ')}.
    2.  Extract 3-5 relevant tags (keywords, symbols, themes).
    3.  Provide a concise one-sentence summary.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    mood: { type: Type.STRING, enum: MOODS.map(m => m.label) },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    summary: { type: Type.STRING },
                },
                required: ['mood', 'tags', 'summary']
            }
        }
    });
    return parseJsonResponse(response.text);
};

export const suggestDreamTitle = async (description: string): Promise<string> => {
    checkOffline();
    const prompt = `Based on the following dream description, suggest a creative and concise title (4-6 words max).\n\nDescription: "${description}"`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text.replace(/["']/g, "").trim();
};

export const generateImage = async (prompt: string, style: string, dataSaver: boolean): Promise<string> => {
    checkOffline();
    const fullPrompt = `${prompt}. Style: ${style}, cinematic lighting, high detail.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: dataSaver ? 'image/jpeg' : 'image/png',
            aspectRatio: '16:9',
        }
    });
    const base64Image = response.generatedImages[0].image.imageBytes;
    const mimeType = dataSaver ? 'image/jpeg' : 'image/png';
    return `data:${mimeType};base64,${base64Image}`;
};

export const generateVideo = async (dream: Dream, onProgress: (message: string) => void): Promise<string> => {
    checkOffline();
    onProgress("Crafting a prompt for the video generator...");
    const prompt = `An animated dream sequence of: ${dream.title}. ${dream.description}. Mood: ${dream.mood}. Tags: ${dream.tags.join(', ')}. Style: surreal, ethereal, cinematic.`;
    
    onProgress("Sending request to the video model...");
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      config: { numberOfVideos: 1 }
    });
    
    onProgress("Video generation started. This may take several minutes...");
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      onProgress("Checking video status...");
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
        throw new Error("Video generation completed, but no video URI was returned.");
    }
    
    onProgress("Video processing complete. Preparing for playback...");
    const downloadLink = operation.response.generatedVideos[0].video.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

export const interpretSymbol = async (symbol: string, dream: Dream): Promise<{ interpretation: string; sources: { uri: string; title: string }[] }> => {
    checkOffline();
    const prompt = `Provide a brief psychological interpretation of the symbol "${symbol}" within the context of this dream: "${dream.title} - ${dream.description}".`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter((web: any) => web?.uri && web?.title) || [];
    
    return { interpretation: response.text, sources };
};

export const suggestConnections = async (currentDream: Dream, allDreams: Dream[]): Promise<{ dreamId: string, reason: string }[]> => {
    checkOffline();
    const otherDreams = allDreams.filter(d => d.id !== currentDream.id).map(d => ({ id: d.id, title: d.title, summary: d.summary, tags: d.tags }));
    if (otherDreams.length === 0) return [];
    
    const prompt = `Analyze this dream:\nCURRENT DREAM: {id: "${currentDream.id}", title: "${currentDream.title}", description: "${currentDream.description}"}\n\nCompare it to this list of other dreams:\n${JSON.stringify(otherDreams)}\n\nIdentify up to 3 other dreams that have strong thematic, symbolic, or narrative connections. Provide a brief reason for each connection.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        dreamId: { type: Type.STRING },
                        reason: { type: Type.STRING }
                    },
                    required: ['dreamId', 'reason']
                }
            }
        }
    });

    return parseJsonResponse(response.text);
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<{ imageUrl: string; textResponse: string }> => {
    checkOffline();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let newImageUrl = '';
    let textResponse = '';
    for (const part of response.candidates[0].content.parts) {
        if (part.text) {
            textResponse = part.text;
        } else if (part.inlineData) {
            newImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    if (!newImageUrl) throw new Error("The AI did not return an edited image.");
    return { imageUrl: newImageUrl, textResponse };
};

export const generateChatResponseStream = async (dream: Dream, history: ChatMessage[], systemInstruction: string, lexicon: SymbolEntry[]): Promise<GenerateContentStreamResponse> => {
    checkOffline();
    const dreamContext = `CONTEXT: The user is asking about the following dream:\nTitle: ${dream.title}\nDescription: ${dream.description}\nMood: ${dream.mood}\nTags: ${dream.tags.join(', ')}\n\nPersonal Symbol Lexicon: ${JSON.stringify(lexicon)}\n\n`;
    
    const historyWithContext: ChatMessage[] = [
        { role: 'user', parts: [{ text: dreamContext }] },
        { role: 'model', parts: [{ text: "I have the dream's context. I am ready to discuss it." }] },
        ...history
    ];
    
    return ai.models.generateContentStream({
       model: "gemini-2.5-flash",
       contents: {
           history: historyWithContext.slice(0, -1),
           parts: historyWithContext[historyWithContext.length-1].parts
       },
       config: {
         systemInstruction: systemInstruction,
       },
    });
};

export const discoverTotems = async (dreams: Dream[]): Promise<Omit<Totem, 'id' | 'imageUrl' | 'detailedInterpretation'>[]> => {
    checkOffline();
    const prompt = `Analyze this collection of dream summaries. Identify recurring, significant symbols or characters that could be considered "dream totems". A totem should appear in at least two dreams. For each totem, provide a name, a brief description of its role, a list of dream IDs it appears in, and a creative prompt for generating an image of it.\n\n${JSON.stringify(dreams.map(d => ({id: d.id, summary: d.summary, tags: d.tags})))}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        dreamIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                        imagePrompt: { type: Type.STRING }
                    },
                     required: ['name', 'description', 'dreamIds', 'imagePrompt']
                }
            }
        }
    });
    return parseJsonResponse(response.text);
};

export const generateImageForTotem = (prompt: string) => {
    checkOffline();
    return generateImage(prompt, "mystical, symbolic, detailed", false);
};

export const getTotemDetails = async (name: string, dreams: Dream[]): Promise<string> => {
    checkOffline();
    const prompt = `Provide a deep, psychological interpretation of the dream totem "${name}", considering its appearances in the following dreams:\n\n${JSON.stringify(dreams.map(d => ({title: d.title, summary: d.summary})))}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generateIncubationGuide = async (intention: string, keywords: string[]): Promise<{ guidedScript: string, focusImagePrompt: string }> => {
    checkOffline();
    const prompt = `Create a dream incubation guide. The user's intention is "${intention}". Associated keywords are: ${keywords.join(', ')}. Provide a short, calming guided meditation script (2-3 paragraphs) and a surreal, symbolic prompt for an AI image generator to create a "focus image" for the meditation.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    guidedScript: { type: Type.STRING },
                    focusImagePrompt: { type: Type.STRING }
                },
                required: ['guidedScript', 'focusImagePrompt']
            }
        }
    });
    return parseJsonResponse(response.text);
};

export const generateDreamFromPrompt = async (prompt: string): Promise<Omit<Dream, 'id'|'date'|'chatHistory'>> => {
    checkOffline();
    const promptText = `Forge a dream entry based on this prompt: "${prompt}". Create a title, a detailed description, a mood, relevant tags, a summary, and appropriate lucidity/clarity scores. The dream should feel authentic and symbolic. Set isAIGenerated to true.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    mood: { type: Type.STRING, enum: MOODS.map(m => m.label) },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    summary: { type: Type.STRING },
                    isRecurring: { type: Type.BOOLEAN },
                    lucidity: { type: Type.INTEGER },
                    clarity: { type: Type.INTEGER },
                    isAIGenerated: { type: Type.BOOLEAN },
                },
                required: ['title', 'description', 'mood', 'tags', 'summary', 'isRecurring', 'lucidity', 'clarity', 'isAIGenerated']
            }
        }
    });
    return parseJsonResponse(response.text);
};

export const analyzeDreamSeries = async (series: Dream[]): Promise<DreamSeriesAnalysis> => {
    checkOffline();
    const prompt = `Analyze this chronological series of dreams. Identify the overarching narrative, how themes evolve, and predict a possible continuation of the story.\n\n${JSON.stringify(series.map(d => ({title: d.title, description: d.description})))}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    narrativeSummary: { type: Type.STRING },
                    evolvingThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    predictedContinuation: { type: Type.STRING }
                },
                required: ['narrativeSummary', 'evolvingThemes', 'predictedContinuation']
            }
        }
    });
    return parseJsonResponse(response.text);
};


export const analyzeAudioMemo = async (base64Data: string, mimeType: string): Promise<{ transcription: string, mood: string }> => {
    checkOffline();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType } },
                { text: `Transcribe this audio of a person describing a dream shortly after waking up. Then, determine the primary mood of the dream described. Choose ONE mood from: ${MOODS.map(m => m.label).join(', ')}.` }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    transcription: { type: Type.STRING },
                    mood: { type: Type.STRING, enum: MOODS.map(m => m.label) }
                },
                required: ['transcription', 'mood']
            }
        }
    });
    return parseJsonResponse(response.text);
};

export const analyzeSleepFragment = async (base64Data: string, mimeType: string): Promise<{ transcription: string, title: string, theme: string }> => {
    checkOffline();
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType } },
                { text: `This is an audio fragment recorded during sleep. It may contain sleep talking or other sounds. 
                1. Transcribe any discernible speech. If no speech, describe the sounds.
                2. Based on the audio, create a short, evocative title.
                3. Identify a single, primary theme (e.g., "Anxiety," "Celebration," "Confusion").` }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    transcription: { type: Type.STRING },
                    title: { type: Type.STRING },
                    theme: { type: Type.STRING }
                },
                required: ['transcription', 'title', 'theme']
            }
        }
    });
    return parseJsonResponse(response.text);
};


export const getOracleReading = async (question: string, dreams: Dream[], totems: Totem[]): Promise<OracleReading> => {
    checkOffline();
    const prompt = `Act as a mystical dream oracle. The user asks: "${question}".
    Your deck of cards consists of their recent dreams and discovered totems:
    Dreams: ${JSON.stringify(dreams.map(d => ({name: d.title, summary: d.summary})))}
    Totems: ${JSON.stringify(totems.map(t => ({name: t.name, description: t.description})))}
    
    1.  Choose the SINGLE most relevant dream or totem to answer the user's question. This is the "card" they have drawn.
    2.  Provide a short, symbolic meaning for the card if it were "upright" (its positive or direct aspects).
    3.  Provide a short, symbolic meaning for the card if it were "reversed" (its shadow or challenging aspects).
    4.  Provide a final piece of guidance that directly answers the user's question, inspired by the drawn card.
    5.  Provide a rich, symbolic prompt for an AI image generator to create the card's image.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    cardName: { type: Type.STRING },
                    cardType: { type: Type.STRING, enum: ['Dream', 'Totem'] },
                    upright: { type: Type.STRING },
                    reversed: { type: Type.STRING },
                    guidance: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING }
                },
                required: ['cardName', 'cardType', 'upright', 'reversed', 'guidance', 'imagePrompt']
            }
        }
    });
    return parseJsonResponse(response.text);
};


export const generateGuideResponseStream = async (history: ChatMessage[], persona: typeof AI_PERSONAS[0]): Promise<GenerateContentStreamResponse> => {
    checkOffline();
    return ai.models.generateContentStream({
       model: "gemini-2.5-flash",
       contents: {
           history: history.slice(0, -1),
           parts: history[history.length-1].parts
       },
       config: {
         systemInstruction: persona.systemInstruction,
       },
    });
};

export const getSymbolpediaInterpretation = (symbol: string) => {
    checkOffline();
    return interpretSymbol(symbol, { title: 'General Inquiry', description: 'N/A' } as Dream);
};
export const generateImageForSymbol = (symbol: string) => {
    checkOffline();
    return generateImage(`A highly detailed, symbolic, surrealist artistic representation of the concept of "${symbol}"`, "symbolism", false);
};

export const getCelestialInfluence = async (context: CelestialContext): Promise<string> => {
    checkOffline();
    const prompt = `Provide a brief, one-paragraph astrological interpretation of today's celestial weather for dreaming. Consider these placements: ${JSON.stringify(context)}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const getZodiacInterpretation = async (sunSign: string, chineseZodiac: string): Promise<string> => {
    checkOffline();
    const prompt = `Provide a brief, insightful, and mystical interpretation of how a person's Western Zodiac sun sign and their Chinese Zodiac sign might interact, especially in the context of their dream life and subconscious patterns.
    - Western Sun Sign: ${sunSign}
    - Chinese Zodiac: ${chineseZodiac}
    
    Focus on the combined energies and what they might reveal about the dreamer's inner world. Keep it to 2-3 sentences.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generateDreamHoroscope = async (sunSign: string, context: CelestialContext, period: 'today' | 'weekly' | 'monthly'): Promise<InDepthHoroscope> => {
    checkOffline();
    const prompt = `Generate an in-depth, personalized dream horoscope for a ${sunSign} for the specified period.
    The period is: ${period}.
    Today's date is ${new Date().toDateString()}.
    The current celestial context is: ${JSON.stringify(context)}.

    Provide a detailed analysis with the following structure:
    - overallTheme: A summary of the main energetic influence on dreams.
    - keyDreamSymbols: A list of 3-5 potent symbols that might appear in dreams.
    - emotionalLandscape: A description of the likely emotional tone of dreams.
    - actionableAdvice: A piece of advice on how to integrate these dream insights into waking life.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    overallTheme: { type: Type.STRING },
                    keyDreamSymbols: { type: Type.ARRAY, items: { type: Type.STRING } },
                    emotionalLandscape: { type: Type.STRING },
                    actionableAdvice: { type: Type.STRING }
                },
                required: ['overallTheme', 'keyDreamSymbols', 'emotionalLandscape', 'actionableAdvice']
            }
        }
    });
    const result = parseJsonResponse<Omit<InDepthHoroscope, 'period' | 'sunSign'>>(response.text);
    return { ...result, period, sunSign };
};

export const getMoonPhaseInterpretation = async (phaseName: string): Promise<string> => {
    checkOffline();
    const prompt = `Provide a deep, symbolic interpretation of a "${phaseName}" moon phase. Focus on its potential influence on dreams, emotions, and the subconscious. What kind of energies does it bring? What themes might surface in dreams during this time? Keep it concise and mystical in tone.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const getCelestialHighlights = async (date: Date): Promise<string> => {
    checkOffline();
    const prompt = `For today's date (${date.toDateString()}), provide a brief, engaging summary of any significant celestial events. This can include visible planets in the night sky, ongoing meteor showers, or interesting planetary alignments. Frame it in a mystical, astrological tone suitable for a dream journal app. If there are no major events, describe the general cosmic "weather".`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generateSynthesisReport = async (dreams: Dream[], userGoal: string): Promise<SynthesisReport> => {
    checkOffline();
    const prompt = `Analyze this dream journal data. The user's goal is "${userGoal}". Produce a synthesis report.\n\n${JSON.stringify(dreams.map(d => ({id: d.id, title: d.title, mood: d.mood, summary: d.summary, tags: d.tags})))}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    executiveSummary: { type: Type.STRING },
                    keyThemes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                theme: { type: Type.STRING },
                                analysis: { type: Type.STRING },
                                relevantDreamIds: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ['theme', 'analysis', 'relevantDreamIds']
                        }
                    },
                    moodAnalysis: { type: Type.STRING },
                    symbolicDeepDive: {
                         type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                symbol: { type: Type.STRING },
                                interpretation: { type: Type.STRING },
                                relevantDreamIds: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ['symbol', 'interpretation', 'relevantDreamIds']
                        }
                    },
                    connectionToGoal: { type: Type.STRING },
                    actionableInsights: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['executiveSummary', 'keyThemes', 'moodAnalysis', 'symbolicDeepDive', 'connectionToGoal', 'actionableInsights']
            }
        }
    });
    return parseJsonResponse(response.text);
};


export const generateOdyssey = async (dreams: Dream[], totems: Totem[]): Promise<Omit<Odyssey, 'id'>> => {
    checkOffline();
    const prompt = `Create a "Dream Odyssey," a personalized quest based on a user's dreams and totems.
    1.  Analyze the provided dreams and totems to find a core theme or unresolved conflict.
    2.  Create a compelling title and short description for the Odyssey based on this theme.
    3.  Select one of the user's totems to act as a central guide for the quest. If no totems exist, invent one that fits the theme.
    4.  Design 3-5 sequential quest steps. Each step should have a title, a description of the challenge, and a specific "incubation goal" for the user to focus on before sleep, aiming to resolve that step in a dream.
    
    Dreams: ${JSON.stringify(dreams.map(d => d.summary).slice(0, 20))}
    Totems: ${JSON.stringify(totems)}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    centralTotemId: { type: Type.STRING, description: "The ID of the chosen totem from the provided list. If none, create a name like 'new-totem-The Guide'." },
                    steps: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.INTEGER },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                incubationGoal: { type: Type.STRING },
                                status: { type: Type.STRING, enum: ['pending'] }
                            },
                            required: ['id', 'title', 'description', 'incubationGoal', 'status']
                        }
                    },
                    status: { type: Type.STRING, enum: ['active'] }
                },
                required: ['title', 'description', 'centralTotemId', 'steps', 'status']
            }
        }
    });
    return parseJsonResponse(response.text);
};

export const generateOdysseyCompletion = async (odyssey: Odyssey, dreams: Dream[]): Promise<string> => {
    checkOffline();
    const relevantDreams = dreams.filter(d => odyssey.steps.some(s => s.resolutionDreamId === d.id));
    const prompt = `This user has completed a Dream Odyssey. Provide a final, congratulatory summary of their journey, reflecting on the initial goal, the steps taken, and the insights gained from their resolution dreams.\n\nOdyssey: ${JSON.stringify(odyssey)}\n\nResolution Dreams: ${JSON.stringify(relevantDreams.map(d => d.summary))}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generateNumerologyReport = async (user: User, numbers: { lifePath: number, expression: number, soulUrge: number }): Promise<NumerologyReport> => {
    checkOffline();
    const prompt = `Generate a personalized numerology report for ${user.name}, born on ${user.dob}.
    - Life Path: ${numbers.lifePath}
    - Expression: ${numbers.expression}
    - Soul Urge: ${numbers.soulUrge}
    Provide a paragraph analysis for each number, then an integrated summary combining their meanings.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    lifePath: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, analysis: { type: Type.STRING } }, required: ['number', 'analysis'] },
                    expression: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, analysis: { type: Type.STRING } }, required: ['number', 'analysis'] },
                    soulUrge: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, analysis: { type: Type.STRING } }, required: ['number', 'analysis'] },
                    integratedSummary: { type: Type.STRING }
                },
                required: ['lifePath', 'expression', 'soulUrge', 'integratedSummary']
            }
        }
    });
    return parseJsonResponse(response.text);
};

export const generatePersonalityProfile = async (dreams: Dream[]): Promise<PersonalityProfile> => {
    checkOffline();
    const prompt = `Analyze this dream journal. Based on the recurring themes, moods, and symbols, determine a personality archetype for the dreamer (e.g., The Explorer, The Healer, The Artist). Provide an analysis of this archetype, list key traits, and suggest an area for growth.\n\n${JSON.stringify(dreams.map(d => d.summary))}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING },
                    analysis: { type: Type.STRING },
                    keyTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
                    growthArea: { type: Type.STRING }
                },
                required: ['type', 'analysis', 'keyTraits', 'growthArea']
            }
        }
    });
    return parseJsonResponse(response.text);
};


export const discoverSpiritGuide = async (dreams: Dream[], goal: string): Promise<SpiritGuide> => {
    checkOffline();
    const prompt = `From the user's dreams and their stated goal ("${goal}"), identify a symbolic "spirit guide" (can be an animal, an object, a figure). Describe it, its symbolism in the context of their dreams, a short message it might have for them, and a prompt for an AI to generate its image.\n\n${JSON.stringify(dreams.map(d => d.summary))}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    symbolism: { type: Type.STRING },
                    message: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING }
                },
                required: ['name', 'description', 'symbolism', 'message', 'imagePrompt']
            }
        }
    });
    return parseJsonResponse(response.text);
};

export const generateCognitivePuzzles = async (dreams: Dream[]): Promise<CognitivePuzzle[]> => {
    checkOffline();
    const prompt = `Create 5 cognitive puzzles (riddles, logic problems) based on themes from this dream journal. Each puzzle should have a question, 4 multiple-choice options, and one correct answer.\n\n${JSON.stringify(dreams.map(d => d.summary))}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    },
                    required: ['question', 'options', 'answer']
                }
            }
        }
    });
    return parseJsonResponse(response.text);
};


export const evaluateCognitiveAnswers = async (puzzles: CognitivePuzzle[], answers: (string | null)[]): Promise<CognitiveAssessmentResult> => {
    checkOffline();
    let score = 0;
    puzzles.forEach((puzzle, i) => {
        if (puzzle.answer === answers[i]) {
            score++;
        }
    });

    const prompt = `A user scored ${score} out of ${puzzles.length} on a cognitive assessment based on their dreams. Provide a brief, encouraging analysis of their performance and assign them a creative title based on their score.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    analysis: { type: Type.STRING }
                },
                required: ['title', 'analysis']
            }
        }
    });

    const result = parseJsonResponse<{ title: string; analysis: string }>(response.text);
    return { ...result, score };
};


export const generateDreamEcho = async (fragment: string): Promise<DreamEcho> => {
    checkOffline();
    const prompt = `You are an AI that finds thematic echoes of a dream fragment. Given the user's dream fragment, create 3 other short, poetic, thematically similar but distinct dream fragments. Do not explain them.\n\nFragment: "${fragment}"`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    echoes: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ['echoes']
            }
        }
    });
    const result = parseJsonResponse<{ echoes: string[] }>(response.text);
    return { original: fragment, echoes: result.echoes };
};

export const extractMindMapData = async (dream: Dream): Promise<{ centralTheme: string; keySymbols: string[]; emotions: string[]; characters: string[]; settings: string[]; }> => {
    checkOffline();
    const prompt = `Analyze the following dream and extract key elements for a mind map.
    Dream Title: "${dream.title}"
    Dream Description: "${dream.description}"
    
    Return a JSON object with:
    1. "centralTheme": A short phrase for the central theme.
    2. "keySymbols": An array of important symbols or objects.
    3. "emotions": An array of key emotions felt.
    4. "characters": An array of characters or beings present.
    5. "settings": An array of locations or settings.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    centralTheme: { type: Type.STRING },
                    keySymbols: { type: Type.ARRAY, items: { type: Type.STRING } },
                    emotions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    characters: { type: Type.ARRAY, items: { type: Type.STRING } },
                    settings: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['centralTheme', 'keySymbols', 'emotions', 'characters', 'settings']
            },
        },
    });

    return parseJsonResponse(response.text);
};

export const identifyDreamSeries = async (dreams: Dream[]): Promise<DreamSeries[]> => {
    checkOffline();
    const prompt = `Analyze this collection of dreams. Identify and group dreams that form a narrative series. A series should have a recurring plot, character, or setting over at least 2 dreams. For each series found, provide a unique 'seriesId', a creative title, a summary of the series' overarching theme, and an array of the dream IDs that belong to it.

    Dreams: ${JSON.stringify(dreams.map(d => ({id: d.id, title: d.title, summary: d.summary, tags: d.tags})))}
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        seriesId: { type: Type.STRING, description: 'A unique ID for the series, e.g., "series-1712345678"' },
                        title: { type: Type.STRING },
                        themeSummary: { type: Type.STRING },
                        dreamIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['seriesId', 'title', 'themeSummary', 'dreamIds']
                }
            }
        }
    });
    return parseJsonResponse(response.text);
};

export const compareTwoDreams = async (dreamA: Dream, dreamB: Dream): Promise<DreamComparisonReport> => {
    checkOffline();
    const prompt = `Compare these two dreams.
    Dream A: "${dreamA.title}" - ${dreamA.summary}
    Dream B: "${dreamB.title}" - ${dreamB.summary}

    Provide a concise analysis in JSON format with:
    - "sharedSymbols": An array of common symbols or themes.
    - "contrastingThemes": An object with "dreamA" and "dreamB" keys describing their opposing themes.
    - "narrativeConnection": A speculative string on how they might be connected narratively.
    - "overallSynthesis": A brief summary of the comparison.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sharedSymbols: { type: Type.ARRAY, items: { type: Type.STRING } },
                    contrastingThemes: {
                        type: Type.OBJECT,
                        properties: {
                            dreamA: { type: Type.STRING },
                            dreamB: { type: Type.STRING },
                        },
                        required: ['dreamA', 'dreamB']
                    },
                    narrativeConnection: { type: Type.STRING },
                    overallSynthesis: { type: Type.STRING },
                },
                required: ['sharedSymbols', 'contrastingThemes', 'narrativeConnection', 'overallSynthesis']
            }
        }
    });
    return parseJsonResponse(response.text);
};

export const remixDream = async (dream: Dream, remixPrompt: string): Promise<{ title: string; description: string; }> => {
    checkOffline();
    const prompt = `You are an AI dream re-mixer. Take the following dream and alter it based on the user's instruction. Generate a new, vivid description for the remixed dream and a new title prefixed with "Remix: ".

    Original Dream Title: "${dream.title}"
    Original Dream Description: "${dream.description}"

    User's Remix Instruction: "${remixPrompt}"

    Produce only the JSON object of the remixed dream.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ['title', 'description']
            },
        },
    });

    return parseJsonResponse(response.text);
};

export const selectDreamOfTheDay = async (dreams: Dream[]): Promise<{ dreamId: string; insight: string; }> => {
    checkOffline();
    const prompt = `From the following list of recent dreams from the last 7 days, select the ONE dream that is the most symbolically rich, emotionally significant, or narratively interesting. Provide a single, insightful sentence about why it's noteworthy.

    Dreams: ${JSON.stringify(dreams.map(d => ({id: d.id, title: d.title, summary: d.summary, mood: d.mood})))}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    dreamId: { type: Type.STRING, description: "The ID of the chosen dream." },
                    insight: { type: Type.STRING, description: "A single, insightful sentence about the dream." }
                },
                required: ['dreamId', 'insight']
            }
        }
    });
    return parseJsonResponse(response.text);
};
