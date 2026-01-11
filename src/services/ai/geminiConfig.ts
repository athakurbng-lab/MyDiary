import { getApiKeys } from '../storage/apiKeyStorage';

// In-memory key management to match MyAudioApp logic
let availableKeys: string[] = [];
let currentKeyIndex = 0;

// Initialize keys immediately when module loads (matching MyAudioApp pattern)
let initPromise: Promise<void> | null = null;

const initializeKeys = async () => {
    try {
        const keys = await getApiKeys();
        if (keys.length > 0) {
            availableKeys = [...keys];
            console.log(`Loaded ${availableKeys.length} keys into memory.`);
        } else {
            console.warn("No API keys found in storage.");
        }
    } catch (e) {
        console.warn("Failed to load keys", e);
    }
};

// Start loading keys immediately (IIFE pattern from MyAudioApp)
initPromise = initializeKeys();

export const reloadKeys = async () => {
    initPromise = initializeKeys();
    await initPromise;
};

function getNextKey(): string {
    if (availableKeys.length === 0) {
        throw new Error("No API keys found. Please add a Gemini API Key in Settings.");
    }
    const key = availableKeys[currentKeyIndex % availableKeys.length];
    currentKeyIndex++;
    return key;
}

function removeKey(keyToRemove: string) {
    console.warn(`Removing exhausted key: ${keyToRemove.substring(0, 10)}...`);
    availableKeys = availableKeys.filter(k => k !== keyToRemove);
    if (availableKeys.length === 0) {
        console.error("CRITICAL: All keys exhausted!");
    }
}

const MODEL_NAME = 'gemini-2.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

// Direct fetch implementation matching MyAudioApp logic
export async function fetchGemini(promptText: string): Promise<string> {
    // Wait for initialization to complete
    if (initPromise) await initPromise;

    const body: any = {
        contents: [{
            parts: [{ text: promptText }]
        }]
    };

    try {
        const response = await fetchWithRetry(API_URL, body);
        const data = await response.json();

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("No content from Gemini");

        return text;
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        throw error;
    }
}

// The core logic from MyAudioApp
async function fetchWithRetry(urlBase: string, body: any, retries = 3): Promise<Response> {
    // Get a key for this attempt
    let apiKey = getNextKey();

    try {
        const response = await fetch(`${urlBase}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        // Handle Rate Limits (429)
        if (response.status === 429) {
            console.log(`Key ${apiKey.substring(0, 8)}... hit 429. Removing from pool.`);
            removeKey(apiKey);

            if (availableKeys.length > 0) {
                console.log("Retrying with next available key...");
                return fetchWithRetry(urlBase, body, retries);
            } else {
                throw new Error("All API keys exhausted.");
            }
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API Failed [${response.status}]:`, errorText);
            throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
        }

        return response;

    } catch (error: any) {
        if (error.message.includes("exhausted")) throw error;

        console.warn(`Attempt failed with key ${apiKey.substring(0, 5)}... Error: ${error.message}`);

        if (retries > 0) {
            await new Promise(r => setTimeout(r, 1000));
            return fetchWithRetry(urlBase, body, retries - 1);
        }
        throw error;
    }
}

// Compatibility wrapper for existing SDK-based code
export async function callGeminiWithFailover<T>(
    operation: (model: any) => Promise<T>
): Promise<T> {
    // Wait for initialization
    if (initPromise) await initPromise;

    const MAX_RETRIES = 3;

    const tryOp = async (retries: number): Promise<T> => {
        const apiKey = getNextKey();
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        try {
            return await operation(model);
        } catch (error: any) {
            const isRateLimit = error.message.includes('429') || error.message.includes('Quota exceeded');

            if (isRateLimit) {
                console.log(`Key ${apiKey.substring(0, 8)}... hit 429. Removing from pool.`);
                removeKey(apiKey);

                if (availableKeys.length > 0) {
                    console.log("Retrying with next available key...");
                    return tryOp(retries);
                } else {
                    throw new Error("All API keys exhausted.");
                }
            }

            console.warn(`Attempt failed with key ${apiKey.substring(0, 5)}... Error: ${error.message}`);
            if (retries > 0) {
                await new Promise(r => setTimeout(r, 1000));
                return tryOp(retries - 1);
            }
            throw error;
        }
    };

    return tryOp(MAX_RETRIES);
}

export async function getGeminiModel() {
    if (initPromise) await initPromise;

    const apiKey = getNextKey();
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: MODEL_NAME });
}
