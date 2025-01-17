import { SQLiteDatabase } from "expo-sqlite";
import { mapDBToTask, mapTaskToDB } from "./dbUtils";
import { format, formatISO } from 'date-fns';
import { Task } from "./customTypes";


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
        return rows.map(mapDBToTask);  // Map each database row to a Task object
    } finally {
        await statement.finalizeAsync();
    }
};

// Update Todo
export const updateTodo = async (db: SQLiteDatabase, id: number, new_title: string): Promise<void> => {
    const statement = await db.prepareAsync(
        `UPDATE todos SET task = $task WHERE id = $id`
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




// Add a Task
export const addTask = async (db: SQLiteDatabase, newTask: Task): Promise<void> => {
    const statement = await db.prepareAsync(
        `INSERT INTO todos (group_id, title, description, comment, status, priority, due_at, is_task, habit_id)
        VALUES ($group_id, $title, $description, $comment, $status, $priority, $due_at, $is_task, $habit_id)`
    );

    try {
        let varTask = mapTaskToDB(newTask);
        await statement.executeAsync({
            $group_id: varTask.group_id,
            $title: varTask.title,
            $description: varTask.description,
            $comment: varTask.comment,
            $status: varTask.status,
            $priority: varTask.priority,
            $due_at: varTask.due_at,
            $is_task: 1,
            $habit_id: varTask.habit_id
        });
    } finally {
        await statement.finalizeAsync();
    }
};


// Get Tasks
export const getTasksForDate = async (db: SQLiteDatabase, dueDate: Date) => {
    // Convert dueDate to ISO format for querying
    
    const date = format(dueDate, 'yyyy-MM-dd');
    console.log('db --> date: ', date);

    const statement = await db.prepareAsync(
        `SELECT * FROM todos 
         WHERE is_deleted = 0 
           AND is_task = 1 
           AND strftime('%Y-%m-%d', due_at) = $date`
    );

    try {
        const result = await statement.executeAsync({ $date: date });
        return await result.getAllAsync();
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
            $deletedAt: formatISO(new Date()),
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
            $completedAt: formatISO(new Date()),
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

