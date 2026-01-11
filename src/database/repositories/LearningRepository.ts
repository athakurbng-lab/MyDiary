import { getDatabase, generateId, getCurrentTimestamp } from '../db';
import { Learning, LearningCategory } from '../schema';

export async function createLearning(learning: Omit<Learning, 'id' | 'createdAt' | 'updatedAt'>): Promise<Learning> {
    const db = await getDatabase();
    const id = generateId();
    const timestamp = getCurrentTimestamp();

    const newLearning: Learning = {
        ...learning,
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    await db.runAsync(
        `INSERT INTO learnings (id, diaryId, text, category, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [newLearning.id, newLearning.diaryId, newLearning.text, newLearning.category,
        newLearning.createdAt, newLearning.updatedAt]
    );

    return newLearning;
}

export async function getLearningsByDiaryId(diaryId: string): Promise<Learning[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<Learning>(
        'SELECT * FROM learnings WHERE diaryId = ? ORDER BY createdAt DESC',
        [diaryId]
    );
    return results;
}

export async function getLearningsByCategory(category: LearningCategory): Promise<Learning[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<Learning>(
        'SELECT * FROM learnings WHERE category = ? ORDER BY createdAt DESC',
        [category]
    );
    return results;
}

export async function getAllLearnings(): Promise<Learning[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<Learning>(
        'SELECT * FROM learnings ORDER BY createdAt DESC'
    );
    return results;
}

export async function updateLearning(id: string, updates: Partial<Omit<Learning, 'id' | 'diaryId' | 'createdAt'>>): Promise<void> {
    const db = await getDatabase();
    const timestamp = getCurrentTimestamp();

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), timestamp, id];

    await db.runAsync(
        `UPDATE learnings SET ${fields}, updatedAt = ? WHERE id = ?`,
        values
    );
}

export async function deleteLearning(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM learnings WHERE id = ?', [id]);
}

export async function deleteLearningsByDiaryId(diaryId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM learnings WHERE diaryId = ?', [diaryId]);
}
