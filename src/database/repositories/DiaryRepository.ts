import { getDatabase, generateId, getCurrentTimestamp } from '../db';
import { DiaryEntry } from '../schema';

export async function createDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiaryEntry> {
    const db = await getDatabase();
    const id = generateId();
    const timestamp = getCurrentTimestamp();

    const newEntry: DiaryEntry = {
        ...entry,
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    await db.runAsync(
        `INSERT INTO diary_entries (id, date, originalText, paraphrasedText, finalText, imageUrl, imagePrompt, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newEntry.id, newEntry.date, newEntry.originalText, newEntry.paraphrasedText, newEntry.finalText,
        newEntry.imageUrl, newEntry.imagePrompt, newEntry.createdAt, newEntry.updatedAt]
    );

    return newEntry;
}

export async function getDiaryEntryById(id: string): Promise<DiaryEntry | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<DiaryEntry>(
        'SELECT * FROM diary_entries WHERE id = ?',
        [id]
    );
    return result || null;
}

export async function getDiaryEntryByDate(date: string): Promise<DiaryEntry | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<DiaryEntry>(
        'SELECT * FROM diary_entries WHERE date = ?',
        [date]
    );
    return result || null;
}

export async function getAllDiaryEntries(): Promise<DiaryEntry[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<DiaryEntry>(
        'SELECT * FROM diary_entries ORDER BY date DESC'
    );
    return results;
}

export async function getRecentDiaryEntries(limit: number = 7): Promise<DiaryEntry[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<DiaryEntry>(
        'SELECT * FROM diary_entries ORDER BY date DESC LIMIT ?',
        [limit]
    );
    return results;
}

export async function updateDiaryEntry(id: string, updates: Partial<Omit<DiaryEntry, 'id' | 'createdAt'>>): Promise<void> {
    const db = await getDatabase();
    const timestamp = getCurrentTimestamp();

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), timestamp, id];

    await db.runAsync(
        `UPDATE diary_entries SET ${fields}, updatedAt = ? WHERE id = ?`,
        values
    );
}

export async function deleteDiaryEntry(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM diary_entries WHERE id = ?', [id]);
}

// CASCADE DELETE: Delete diary and all related data
export async function deleteDiaryEntryCascade(id: string): Promise<void> {
    const db = await getDatabase();
    // Delete in order: learnings, suggestions, then diary
    await db.runAsync('DELETE FROM learnings WHERE diaryId = ?', [id]);
    await db.runAsync('DELETE FROM suggestions WHERE diaryId = ?', [id]);
    await db.runAsync('DELETE FROM diary_entries WHERE id = ?', [id]);
}

// BULK CASCADE DELETE
export async function deleteDiaryEntriesCascade(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const db = await getDatabase();
    const placeholders = ids.map(() => '?').join(',');

    await db.runAsync(`DELETE FROM learnings WHERE diaryId IN (${placeholders})`, ids);
    await db.runAsync(`DELETE FROM suggestions WHERE diaryId IN (${placeholders})`, ids);
    await db.runAsync(`DELETE FROM diary_entries WHERE id IN (${placeholders})`, ids);
}
