import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;

    db = await SQLite.openDatabaseAsync('mydiary.db');

    // Create tables
    await db.execAsync(CREATE_TABLES_SQL);

    console.log('Database initialized successfully');
    return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!db) {
        return await initDatabase();
    }
    return db;
}

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getCurrentTimestamp(): string {
    return new Date().toISOString();
}
