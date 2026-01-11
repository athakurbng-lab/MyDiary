import { getDatabase, generateId, getCurrentTimestamp } from '../db';
import { Task } from '../schema';

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const db = await getDatabase();
    const id = generateId();
    const timestamp = getCurrentTimestamp();

    const newTask: Task = {
        ...task,
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    await db.runAsync(
        `INSERT INTO tasks (id, title, description, deadline, reminderTime, completed, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [newTask.id, newTask.title, newTask.description, newTask.deadline,
        newTask.reminderTime, newTask.completed ? 1 : 0, newTask.createdAt, newTask.updatedAt]
    );

    return newTask;
}

export async function getTaskById(id: string): Promise<Task | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Task & { completed: number }>(
        'SELECT * FROM tasks WHERE id = ?',
        [id]
    );

    if (!result) return null;

    return {
        ...result,
        completed: result.completed === 1,
    };
}

export async function getAllTasks(): Promise<Task[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<Task & { completed: number }>(
        'SELECT * FROM tasks ORDER BY deadline ASC'
    );

    return results.map(task => ({
        ...task,
        completed: task.completed === 1,
    }));
}

export async function getPendingTasks(): Promise<Task[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<Task & { completed: number }>(
        'SELECT * FROM tasks WHERE completed = 0 ORDER BY deadline ASC'
    );

    return results.map(task => ({
        ...task,
        completed: false,
    }));
}

export async function getCompletedTasks(): Promise<Task[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<Task & { completed: number }>(
        'SELECT * FROM tasks WHERE completed = 1 ORDER BY deadline DESC'
    );

    return results.map(task => ({
        ...task,
        completed: true,
    }));
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
    const db = await getDatabase();
    const timestamp = getCurrentTimestamp();

    const updateData: any = { ...updates };
    if ('completed' in updateData) {
        updateData.completed = updateData.completed ? 1 : 0;
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), timestamp, id];

    await db.runAsync(
        `UPDATE tasks SET ${fields}, updatedAt = ? WHERE id = ?`,
        values
    );
}

export async function deleteTask(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}
