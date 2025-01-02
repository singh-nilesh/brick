import { SQLiteDatabase } from "expo-sqlite";
import { format } from "date-fns";

const formatTimestamp = () => format(new Date(), "yyyy-MM-dd HH:mm:ss");

// Add a Todo
export const addTodo = async (db: SQLiteDatabase, task: string): Promise<void> => {
    const statement = await db.prepareAsync(
        `INSERT INTO todos (task, done, created_at, is_deleted, is_task)
        VALUES ($task, $done, $createdAt, $isDeleted, $isTask)`
    );
    try {
        await statement.executeAsync({
            $task: task,
            $done: 0, // false
            $createdAt: formatTimestamp(),
            $isDeleted: 0, // false
            $isTask: 0, // false (indicates a todo)
        });
    } finally {
        await statement.finalizeAsync();
    }
};

// Get Todos
export const getTodos = async (db: SQLiteDatabase) => {
    const statement = await db.prepareAsync(`SELECT * FROM todos WHERE is_deleted = 0 AND is_task = 0`);
    try {
        const result = await statement.executeAsync();
        return await result.getAllAsync();
    } finally {
        await statement.finalizeAsync();
    }
};

// Delete Todo
export const deleteTodo = async (db: SQLiteDatabase, id: number): Promise<void> => {
    const statement = await db.prepareAsync(
        `UPDATE todos SET is_deleted = 1, deleted_at = $deletedAt WHERE id = $id`
    );
    try {
        await statement.executeAsync({
            $deletedAt: formatTimestamp(),
            $id: id,
        });
    } finally {
        await statement.finalizeAsync();
    }
};

// Complete Todo
export const completeTodo = async (db: SQLiteDatabase, id: number): Promise<void> => {
    const statement = await db.prepareAsync(
        `UPDATE todos SET done = 1, completed_at = $completedAt WHERE id = $id`
    );
    try {
        await statement.executeAsync({
            $completedAt: formatTimestamp(),
            $id: id,
        });
    } finally {
        await statement.finalizeAsync();
    }
};

// Uncomplete Todo
export const uncompleteTodo = async (db: SQLiteDatabase, id: number): Promise<void> => {
    const statement = await db.prepareAsync(
        `UPDATE todos SET done = 0, completed_at = NULL WHERE id = $id`
    );
    try {
        await statement.executeAsync({ $id: id });
    } finally {
        await statement.finalizeAsync();
    }
};




// Add a Task
export const addTask = async (db: SQLiteDatabase, task: string): Promise<void> => {
    const statement = await db.prepareAsync(
        `INSERT INTO todos (task, done, created_at, is_deleted, is_task)
        VALUES ($task, $done, $createdAt, $isDeleted, $isTask)`
    );
    try {
        await statement.executeAsync({
            $task: task,
            $done: 0, // false
            $createdAt: formatTimestamp(),
            $isDeleted: 0, // false
            $isTask: 1, // true (indicates a task)
        });
    } finally {
        await statement.finalizeAsync();
    }
};

// Get Tasks
export const getTasks = async (db: SQLiteDatabase) => {
    const statement = await db.prepareAsync(`SELECT * FROM todos WHERE is_deleted = 0 AND is_task = 1`);
    try {
        const result = await statement.executeAsync();
        return await result.getAllAsync();
    } finally {
        await statement.finalizeAsync();
    }
};

// Delete Task
export const deleteTask = async (db: SQLiteDatabase, id: number): Promise<void> => {
    const statement = await db.prepareAsync(
        `UPDATE todos SET is_deleted = 1, deleted_at = $deletedAt WHERE id = $id`
    );
    try {
        await statement.executeAsync({
            $deletedAt: formatTimestamp(),
            $id: id,
        });
    } finally {
        await statement.finalizeAsync();
    }
};

// Complete Task
export const completeTask = async (db: SQLiteDatabase, id: number): Promise<void> => {
    const statement = await db.prepareAsync(
        `UPDATE todos SET done = 1, completed_at = $completedAt WHERE id = $id`
    );
    try {
        await statement.executeAsync({
            $completedAt: formatTimestamp(),
            $id: id,
        });
    } finally {
        await statement.finalizeAsync();
    }
};

// Uncomplete Task
export const uncompleteTask = async (db: SQLiteDatabase, id: number): Promise<void> => {
    const statement = await db.prepareAsync(
        `UPDATE todos SET done = 0, completed_at = NULL WHERE id = $id`
    );
    try {
        await statement.executeAsync({ $id: id });
    } finally {
        await statement.finalizeAsync();
    }
};
