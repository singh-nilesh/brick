import { SQLiteDatabase } from "expo-sqlite";
import { mapDBToTask } from "./dbUtils";
import { format, formatISO } from 'date-fns';

// Get Tasks
export const getTasksForDate = async (db: SQLiteDatabase, dueDate: Date) => {
    const formattedDate = format(dueDate, 'yyyy-MM-dd');

    try {
        // Fetch all tasks for the given date
        const todoQuery = await db.prepareAsync(
            `SELECT * FROM todos 
             WHERE is_deleted = 0 
               AND is_task = 1 
               AND strftime('%Y-%m-%d', due_at) = $date`
        );
        let todoResult;
        try {
            const todoRows = await todoQuery.executeAsync({ $date: formattedDate });
            todoResult = await todoRows.getAllAsync();
        } finally {
            await todoQuery.finalizeAsync();
        }


        // Fetch task details
        const taskDetails = await Promise.all(
            todoResult.map(async (row: any) => {
                let group = null;
                let habit = null;
                let references = null;

                // Fetch group details if group_id is not null
                if (row.group_id) {
                    const groupQuery = await db.prepareAsync(
                        `SELECT title AS group_title, group_bgColor, group_textColor FROM groups WHERE id = $groupId;`
                    );
                    try {
                        const groupRows = await groupQuery.executeAsync({ $groupId: row.group_id });
                        group = await groupRows.getFirstAsync();
                    } finally {
                        await groupQuery.finalizeAsync();
                    }
                }

                // Fetch habit details if habit_id is not null
                if (row.habit_id) {
                    const habitQuery = await db.prepareAsync(
                        `SELECT title AS habit_title FROM habits WHERE id = $habitId;`
                    );
                    try {
                        const habitRows = await habitQuery.executeAsync({ $habitId: row.habit_id });
                        habit = await habitRows.getFirstAsync();
                    } finally {
                        await habitQuery.finalizeAsync();
                    }
                }

                // Fetch references
                const refQuery = await db.prepareAsync(
                    `SELECT name, url FROM reference WHERE task_id = $todoId;`
                );
                try {
                    const refRows = await refQuery.executeAsync({ $todoId: row.id });
                    references = (await refRows.getAllAsync()).map((ref: any) => ({
                        name: ref.name,
                        url: ref.url,
                    }));
                } finally {
                    await refQuery.finalizeAsync();
                }

                const data = {
                    ...row,
                    group: group ? group : null,
                    habit: habit ? habit : null,
                    references,
                };
                //console.log(data);
                return data;
            })
        );

        // return mapped task.
        return taskDetails.map(mapDBToTask);

    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
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

// Example query
const exampleQuery = async (db: SQLiteDatabase, dueDate: Date) => {
    const formattedDate = format(dueDate, 'yyyy-MM-dd');
    const query = `SELECT * FROM todos WHERE strftime('%Y-%m-%d', due_at) = '2023-10-10';`;
    const statement = await db.prepareAsync(query);
    try {
        const result = await statement.executeAsync();
        const rows = await result.getAllAsync();
        console.log(`Fetched ${rows.length} tasks for the example query`);
        return rows;
    } catch (error) {
        console.error('Error executing example query:', error);
        throw error;
    } finally {
        await statement.finalizeAsync();
    }
};

