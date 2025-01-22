import { SQLiteDatabase } from "expo-sqlite";
import { mapDBToTask } from "./dbUtils";
import { format, formatISO } from 'date-fns';
import { Task } from "./customTypes";


// Add Tasks
export const addTask = async (db: SQLiteDatabase, newTask: Task) => {
    console.log(newTask);
    
    const insertQuery = await db.prepareAsync(
        `INSERT INTO todos (group_id, title, description, comment, priority, due_at, is_task) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    var TaskId: number;

    try {
        TaskId = (
            await insertQuery.executeAsync([
                newTask.group?.id ?? null,
                newTask.title,
                newTask.description ?? '',
                newTask.comment ?? '',
                newTask.priority ?? 5,
                newTask.dueAt ? formatISO(newTask.dueAt) : null,
                1,
            ]))?.lastInsertRowId;
    }
    finally {
        await insertQuery.finalizeAsync();
    }

    // Add references
    if (newTask.references.length > 0) {
        const addRefQuery = await db.prepareAsync(
            `INSERT INTO reference (task_id, name, url) VALUES (?, ?, ?)`
        );
        try {
            newTask.references.forEach(async (ref) => {
                await addRefQuery.executeAsync([TaskId, ref.name, ref.url]);
            });
        } finally {
            await addRefQuery.finalizeAsync();
        }
    }
}

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

// Update Task
export const updateTask = async (db: SQLiteDatabase, oldTask: Task, newTask: Task) => {

    // compare old and new todo Entries
    if (oldTask.title !== newTask.title ||
        oldTask.status !== newTask.status ||
        oldTask.description !== newTask.description ||
        oldTask.dueAt !== newTask.dueAt ||
        oldTask.comment !== newTask.comment) {

        // Update the task
        const updateQuery = `
      UPDATE todos 
      SET title = ?, status = ?, description = ?, due_at = ?, comment = ? 
      WHERE id = ?`;

        const updateStatement = await db.prepareAsync(updateQuery);

        try {
            await updateStatement.executeAsync([
                newTask.title ?? '',
                newTask.status ? 1 : 0,
                newTask.description ?? '',
                newTask.dueAt ? formatISO(newTask.dueAt) : null,
                newTask.comment ?? '',
                oldTask.id,
            ]);
            console.log('Task updated successfully');
        }
        finally {
            await updateStatement.finalizeAsync();
        }
    }

    // Update references, loop through the reference list,
    const delRefs = oldTask.references.filter((ref) => !newTask.references.includes(ref));
    const addRefs = newTask.references.filter((ref) => ref.id === null);

    // Delete references
    if (delRefs.length > 0) {
        const delRefQuery = await db.prepareAsync(`DELETE FROM reference WHERE id = ?`);
        try {
            delRefs.forEach(async (ref) => {
                await delRefQuery.executeAsync([ref.id]);
            });
        } finally {
            await delRefQuery.finalizeAsync();
        }
    }

    // Add references
    if (addRefs.length > 0) {
        const addRefQuery = await db.prepareAsync(
            `INSERT INTO reference (task_id, name, url) VALUES (?, ?, ?)`
        );
        try {
            addRefs.forEach(async (ref) => {
                await addRefQuery.executeAsync([oldTask.id, ref.name, ref.url]);
            });
        } finally {
            await addRefQuery.finalizeAsync();
        }
    }
}


export const getGroups = async (db: SQLiteDatabase) => {
    const groupsQuery = await db.prepareAsync(
        `SELECT * FROM groups`
    );
    try {
        const groupsRows = await groupsQuery.executeAsync();
        const groups = await groupsRows.getAllAsync();
        const groupsList = groups.map((group: any) => ({
            id: group.id,
            title: group.title,
            description: group.description,
            bgColor: group.group_bgColor,
            textColor: group.group_textColor,
            newTaskCount: 0,
        }));
        return groupsList;
    } finally {
        await groupsQuery.finalizeAsync();
    }
}   