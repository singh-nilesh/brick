import { SQLiteDatabase } from "expo-sqlite";
import { mapDBToTodo } from "./dbUtils";
import { formatDateForDB } from "./dbUtils";
import { Todo } from "./customTypes";

// Add a Todo
export const addTodo = async (db: SQLiteDatabase, new_title: string): Promise<void> => {
    const statement = await db.prepareAsync(
        `INSERT INTO tasks (title)
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
    const statement = await db.prepareAsync(`SELECT * FROM tasks WHERE is_deleted = 0 AND is_task = 0`);
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
        `UPDATE tasks SET title = $task WHERE id = $id`
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
        `UPDATE tasks SET is_deleted = 1, deleted_at = $deletedAt WHERE id = $id`
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
export const markAsDone = async (db: SQLiteDatabase, id: number, isSubtask = false): Promise<void> => {
    if (isSubtask) {
        const statement = await db.prepareAsync(`UPDATE todos SET status = 1 WHERE id = $id`);
        try {
            await statement.executeAsync({ $id: id });
        } finally {
            await statement.finalizeAsync();
        }
    }
    else {
        const statement = await db.prepareAsync(
            `UPDATE tasks SET status = 1, completed_at = $completedAt WHERE id = $id`
        );
        try {
            await statement.executeAsync({
                $completedAt: formatDateForDB(new Date()),
                $id: id,
            });
        } finally {
            await statement.finalizeAsync();
        }
    }
};


// Uncompleted Todo or Task
export const markAsNotDone = async (db: SQLiteDatabase, id: number, isSubtask = false): Promise<void> => {
    if (isSubtask) {
        const statement = await db.prepareAsync(`UPDATE todos SET status = 0 WHERE id = $id`);
        try {
            await statement.executeAsync({ $id: id });
        } finally {
            await statement.finalizeAsync();
        }
    }
    else {
        const statement = await db.prepareAsync(
            `UPDATE tasks SET status = 0, completed_at = NULL WHERE id = $id`
        );
        try {
            await statement.executeAsync({ $id: id });
        } finally {
            await statement.finalizeAsync();
        }
    }
};


// Add subtask
export const addSubtask = async (db: SQLiteDatabase, task_id: number, new_title: string): Promise<number> => {
    const statement = await db.prepareAsync(
        `INSERT INTO todos (task_id, title) VALUES ($task_id, $title)`
    );
    try {
        const todoId = (
        await statement.executeAsync({
            $title: new_title,
            $task_id: task_id
        })
    ).lastInsertRowId;
    return todoId;
    }
    catch (error) {
        console.log(error);
        return -1; // Return a default or error value
    }
    finally {
        await statement.finalizeAsync();
    }
};

// Get subtasks
export const getSubtasks = async (db: SQLiteDatabase, task_id: number) => {
    const statement = await db.prepareAsync(`SELECT * FROM todos WHERE task_id = $task_id`);
    try {
        const result = await statement.executeAsync({ $task_id: task_id });
        const rows = await result.getAllAsync();

        return rows.map(mapDBToTodo);
    } finally {
        await statement.finalizeAsync();
    }
};

// Delete subtask
export const deleteSubtask = async (db: SQLiteDatabase, id: number): Promise<void> => {
    const statement = await db.prepareAsync(
        `DELETE FROM todos WHERE id = $id`
    );
    try {
        await statement.executeAsync({ $id: id });
    } finally {
        await statement.finalizeAsync();
    }
};

// Update subtask
export const updateSubtask = async (db: SQLiteDatabase, subtask: Todo): Promise<number> => {

    const statement = await db.prepareAsync(`UPDATE todos SET title = $title WHERE id = $id`);
    try {
        await statement.executeAsync({$title: subtask.title ?? ""});
        return 1
    } catch (error) {
        console.log(error);
        return -1
    } finally {
        await statement.finalizeAsync();
    }
};