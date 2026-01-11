import { getDatabase, generateId, getCurrentTimestamp } from '../db';
import { ProgressScore } from '../schema';
import { INITIAL_GROWTH_SCORE } from '../../utils/constants';

export async function createProgressScore(score: Omit<ProgressScore, 'id' | 'createdAt'>): Promise<ProgressScore> {
    const db = await getDatabase();
    const id = generateId();
    const timestamp = getCurrentTimestamp();

    const newScore: ProgressScore = {
        ...score,
        id,
        createdAt: timestamp,
    };

    await db.runAsync(
        `INSERT INTO progress_scores (id, date, diaryScore, taskScore, cumulativeDiaryScore, cumulativeTaskScore, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newScore.id, newScore.date, newScore.diaryScore, newScore.taskScore,
        newScore.cumulativeDiaryScore, newScore.cumulativeTaskScore, newScore.createdAt]
    );

    return newScore;
}

// UPSERT: Insert or update if date already exists
export async function upsertProgressScore(score: Omit<ProgressScore, 'id' | 'createdAt'>): Promise<ProgressScore> {
    const db = await getDatabase();
    const existing = await getProgressScoreByDate(score.date);

    if (existing) {
        // Update existing
        await db.runAsync(
            `UPDATE progress_scores 
             SET diaryScore = ?, taskScore = ?, cumulativeDiaryScore = ?, cumulativeTaskScore = ?
             WHERE date = ?`,
            [score.diaryScore, score.taskScore, score.cumulativeDiaryScore, score.cumulativeTaskScore, score.date]
        );
        return { ...existing, ...score };
    } else {
        // Insert new
        return await createProgressScore(score);
    }
}

export async function getProgressScoreByDate(date: string): Promise<ProgressScore | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<ProgressScore>(
        'SELECT * FROM progress_scores WHERE date = ?',
        [date]
    );
    return result || null;
}

export async function getAllProgressScores(): Promise<ProgressScore[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<ProgressScore>(
        'SELECT * FROM progress_scores ORDER BY date ASC'
    );
    return results;
}

export async function getRecentProgressScores(limit: number = 30): Promise<ProgressScore[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<ProgressScore>(
        'SELECT * FROM progress_scores ORDER BY date DESC LIMIT ?',
        [limit]
    );
    return results.reverse(); // Return in ascending order
}

export async function getLatestProgressScore(): Promise<ProgressScore | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<ProgressScore>(
        'SELECT * FROM progress_scores ORDER BY date DESC LIMIT 1'
    );
    return result || null;
}

export async function updateProgressScore(date: string, updates: Partial<Omit<ProgressScore, 'id' | 'date' | 'createdAt'>>): Promise<void> {
    const db = await getDatabase();

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), date];

    await db.runAsync(
        `UPDATE progress_scores SET ${fields} WHERE date = ?`,
        values
    );
}

export async function getCurrentCumulativeScores(): Promise<{ diary: number; task: number }> {
    const latest = await getLatestProgressScore();

    if (!latest) {
        return { diary: INITIAL_GROWTH_SCORE, task: INITIAL_GROWTH_SCORE };
    }

    return {
        diary: latest.cumulativeDiaryScore,
        task: latest.cumulativeTaskScore,
    };
}
