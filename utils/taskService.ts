import { SQLiteDatabase } from "expo-sqlite";

export const addTask = async (db: SQLiteDatabase, task: string) => {
    const query = `INSERT INTO todos (task) VALUES (?)`;
    await db.runAsync(query, [task]);
};

export const getTasks = async (db: SQLiteDatabase) => {
    const query = `SELECT * FROM todos WHERE is_deleted = 0`;
    return await db.getAllAsync(query);
};

export const deleteTask = async (db: SQLiteDatabase, id: number) => {
    const query = `UPDATE todos SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await db.runAsync(query, [id]);
};

export const completeTask = async (db: SQLiteDatabase, id: number) => {
    const query = `UPDATE todos SET done = 1, completed_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await db.runAsync(query, [id]);
};

export const uncompleteTask = async (db: SQLiteDatabase, id: number) => {
    const query = `UPDATE todos SET done = 0, completed_at = NULL WHERE id = ?`;
    await db.runAsync(query, [id]);
};
