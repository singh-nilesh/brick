import { SQLiteDatabase } from "expo-sqlite";
import { mapDBToTodo } from "./dbUtils";
import { formatDateForDB } from "./dbUtils";

// Add a Todo
export const addTodo = async (db: SQLiteDatabase, new_title: string): Promise<void> => {
    const statement = await db.prepareAsync(
        `INSERT INTO todos (title)
        VALUES ($title)`
    );
    try {
        await statement.executeAsync({ $title: new_title });
    } finally {
        await statement.finalizeAsync();
    }
};

// Get Todos
export const getTodos = async (db: SQLiteDatabase) => {
    const statement = await db.prepareAsync(`SELECT * FROM todos WHERE is_deleted = 0 AND is_task = 0`);
    try {
        const result = await statement.executeAsync();
        const rows = await result.getAllAsync();
        return rows.map(mapDBToTodo);  // Map each database row to a Task object
    } finally {
        await statement.finalizeAsync();
    }
};

// Update Todo
export const updateTodo = async (db: SQLiteDatabase, id: number, new_title: string): Promise<void> => {
    const statement = await db.prepareAsync(
        `UPDATE todos SET title = $task WHERE id = $id`
    );
    try {
        await statement.executeAsync({
            $task: new_title,
            $id: id,
        });
    } finally {
        await statement.finalizeAsync();
    }
};



// Delete Task or todo
export const markDeleted = async (db: SQLiteDatabase, id: number): Promise<void> => {
    const statement = await db.prepareAsync(
        `UPDATE todos SET is_deleted = 1, deleted_at = $deletedAt WHERE id = $id`
    );
    try {
        await statement.executeAsync({
            $deletedAt: formatDateForDB(new Date()),
            $id: id,
        });
    } finally {
        await statement.finalizeAsync();
    }
};


// Complete Todo or Task
export const markAsDone = async (db: SQLiteDatabase, id: number): Promise<void> => {
    const statement = await db.prepareAsync(
        `UPDATE todos SET status = 1, completed_at = $completedAt WHERE id = $id`
    );
    try {
        await statement.executeAsync({
            $completedAt: formatDateForDB(new Date()),
            $id: id,
        });
    } finally {
        await statement.finalizeAsync();
    }
};


// Uncompleted Todo or Task
export const markAsNotDone = async (db: SQLiteDatabase, id: number): Promise<void> => {
    const statement = await db.prepareAsync(
        `UPDATE todos SET status = 0, completed_at = NULL WHERE id = $id`
    );
    try {
        await statement.executeAsync({ $id: id });
    } finally {
        await statement.finalizeAsync();
    }
};

