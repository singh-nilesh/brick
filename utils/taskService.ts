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
                    `SELECT id,name,url FROM reference WHERE task_id = $todoId;`
                );
                try {
                    const refRows = await refQuery.executeAsync({ $todoId: row.id });
                    references = (await refRows.getAllAsync()).map((ref: any) => ({
                        id: ref.id,
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