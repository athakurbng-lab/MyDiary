import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEYS_STORAGE_KEY = 'gemini_api_keys';

export const getApiKeys = async (): Promise<string[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(API_KEYS_STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Failed to fetch API keys', e);
        return [];
    }
};

export const addApiKeys = async (newKeys: string[]): Promise<void> => {
    try {
        const currentKeys = await getApiKeys();
        const uniqueKeys = new Set([...currentKeys, ...newKeys]);
        await AsyncStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(Array.from(uniqueKeys)));
    } catch (e) {
        console.error('Failed to add API keys', e);
        throw e;
    }
};

export const removeApiKey = async (keyToRemove: string): Promise<void> => {
    try {
        const currentKeys = await getApiKeys();
        const newKeys = currentKeys.filter(k => k !== keyToRemove);
        await AsyncStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(newKeys));
    } catch (e) {
        console.error('Failed to remove API key', e);
        throw e;
    }
};

export const removeAllApiKeys = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(API_KEYS_STORAGE_KEY);
    } catch (e) {
        console.error('Failed to remove all API keys', e);
        throw e;
    }
};

export const maskApiKey = (key: string): string => {
    if (!key || key.length < 8) return '********';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};
