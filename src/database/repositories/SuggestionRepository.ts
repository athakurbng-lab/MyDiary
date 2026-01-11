import { getDatabase, generateId, getCurrentTimestamp } from '../db';
import { Suggestion } from '../schema';

export async function createSuggestion(suggestion: Omit<Suggestion, 'id' | 'createdAt'>): Promise<Suggestion> {
    const db = await getDatabase();
    const id = generateId();
    const timestamp = getCurrentTimestamp();

    const newSuggestion: Suggestion = {
        ...suggestion,
        id,
        createdAt: timestamp,
    };

    await db.runAsync(
        `INSERT INTO suggestions (id, diaryId, whatWentWell, whatWentWrong, whyItFailed, improvements, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newSuggestion.id, newSuggestion.diaryId, newSuggestion.whatWentWell, newSuggestion.whatWentWrong,
        newSuggestion.whyItFailed, newSuggestion.improvements, newSuggestion.createdAt]
    );

    return newSuggestion;
}

export async function getSuggestionByDiaryId(diaryId: string): Promise<Suggestion | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Suggestion>(
        'SELECT * FROM suggestions WHERE diaryId = ?',
        [diaryId]
    );
    return result || null;
}

export async function deleteSuggestionByDiaryId(diaryId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM suggestions WHERE diaryId = ?', [diaryId]);
}
