import { SQLiteDatabase } from "expo-sqlite";
import { mapDBToHabit, mapDBToTask } from "./dbUtils";
import { formatDateForDB } from "./dbUtils";
import { Group, Habit, Task } from "./customTypes";
import { ToastAndroid } from "react-native";

// Function to insert references
export const insertReferences = async (db: SQLiteDatabase, taskId: number | null, references: any[]) => {
    const validReferences = references.filter(ref => ref.url && ref.url.trim() !== '');
    if (validReferences.length > 0) {
        const insertRef = await db.prepareAsync(`INSERT INTO reference (task_id, name, url) VALUES (?, ?, ?)`);
        try {
            for (const ref of validReferences) {
                taskId
                    ? await insertRef.executeAsync([taskId, ref.name, ref.url])
                    : await insertRef.executeAsync([null, ref.name, ref.url]);
            }
        } finally {
            await insertRef.finalizeAsync();
        }
    }
}

// Function to delete references
export const deleteReferences = async (db: SQLiteDatabase, references: any[]) => {
    if (references.length > 0) {
        const delRefQuery = await db.prepareAsync(`DELETE FROM reference WHERE id = ?`);
        try {
            for (const ref of references) {
                await delRefQuery.executeAsync([ref.id]);
            }
        } finally {
            await delRefQuery.finalizeAsync();
        }
    }
}

// Add Tasks
export const addTask = async (db: SQLiteDatabase, newTask: Task) => {
    const insertQuery = await db.prepareAsync(
        `INSERT INTO todos (group_id, title, description, comment, priority, due_at, due_at_time, is_task) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    var TaskId: number;

    try {
        TaskId = (
            await insertQuery.executeAsync([
                newTask.group?.id ?? null,
                newTask.title,
                newTask.description ?? '',
                newTask.comment ?? '',
                newTask.priority ?? 5,
                newTask.dueAt ? formatDateForDB(newTask.dueAt) : null,
                newTask.dueAtTime ?? null,
                1,
            ])
        )?.lastInsertRowId;
    } finally {
        await insertQuery.finalizeAsync();
    }

    // Add references
    await insertReferences(db, TaskId, newTask.references);
}

// Generate Task Dynamically
const generateDynamicTasks = async (db: SQLiteDatabase, Habits: any[], dueDate: Date): Promise<any[]> => {
    if (Habits.length === 0) {
        return [];
    }

    var taskList: any[] = [];

    for (let habit of Habits) {

        // check day of the week for the habit
        if (habit.byWeekDay.includes(dueDate.getDay())) {

            let isDue: Boolean = false;

            const startOfStartWeek = new Date(habit.dtStart);
            startOfStartWeek.setDate(habit.dtStart.getDate() - habit.dtStart.getDay());

            const startOfDueWeek = new Date(dueDate);
            startOfDueWeek.setDate(dueDate.getDate() - dueDate.getDay());

            const weeksSinceStart = Math.ceil((startOfDueWeek.getTime() - startOfStartWeek.getTime()) / (7 * 24 * 60 * 60 * 1000));

            // Check if the current week aligns with the interval
            if (weeksSinceStart % habit.interval === 0) {
                isDue = true;
            }

            if (isDue) {
                taskList.push({
                    id: 0,
                    group_id: habit.groupId,
                    title: habit.title,
                    description: '',
                    comment: '',
                    status: 0,
                    priority: 5,
                    created_at: formatDateForDB(new Date()),
                    due_at: formatDateForDB(dueDate),
                    completed_at: null,
                    is_deleted: 0,
                    deleted_at: null,
                    is_task: 1,
                    habit_id: habit.id,
                    group: habit.groupId
                        ? {
                            group_title: habit.group_title,
                            group_bgColor: habit.group_bgColor,
                            group_textColor: habit.group_textColor,
                        } : null,
                    habit: {
                        habit_title: habit.title,
                    },
                    references: habit.referenceLink && habit.referenceLink.length > 0
                        ? [{ id: null, name: 'Habit Reference', url: habit.referenceLink.trim() }]
                        : [],
                });
            }
        }
    }
    return taskList;
}

// Merge tasks and dynamic tasks
const mergeTasks = async (tasks: any[], dynamicTasks: any[], dueAt: Date, db: SQLiteDatabase): Promise<any[]> => {
    dueAt.setHours(0, 0, 0, 0);

    // Insert dynamic tasks if the due date is today
    if (dueAt.toDateString() === new Date().toDateString()) {
        const insertStmt = await db.prepareAsync(`INSERT INTO todos (title, group_id, due_at, habit_id, is_task, created_at)
                VALUES ( $title, $groupId, $dueAt, $habitId, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`);

        try {
            for (const Task of dynamicTasks) {
                let lastTaskId = await (await insertStmt.executeAsync({
                    $title: Task.title,
                    $groupId: Task.group_id,
                    $dueAt: formatDateForDB(dueAt),
                    $habitId: Task.habit_id,
                }))?.lastInsertRowId;

                // Update the task id
                dynamicTasks[dynamicTasks.indexOf(Task)].id = lastTaskId;

                // Add references
                await insertReferences(db, lastTaskId, Task.references);
            }
        } finally {
            await insertStmt.finalizeAsync();
        }
    }
    return [...tasks, ...dynamicTasks];
};

// Get Tasks
export const getTasksForDate = async (db: SQLiteDatabase, dueDate: Date) => {
    const formattedDate = formatDateForDB(dueDate);

    try {
        // Fetch all tasks for the given date
        const todoQuery = await db.prepareAsync(
            `SELECT * FROM todos 
             WHERE is_deleted = 0 
               AND is_task = 1 
               AND strftime('%Y-%m-%d', due_at) = $date`
        );
        let tasks;
        try {
            const todoRows = await todoQuery.executeAsync({ $date: formattedDate });
            tasks = await todoRows.getAllAsync();
        } finally {
            await todoQuery.finalizeAsync();
        }

        // Fetch All habits
        let dynamicTasks;
        let habitRows

        const habitQuery = await db.prepareAsync(
            `SELECT habits.*, 
                    groups.title AS group_title, groups.group_bgColor, groups.group_textColor
            FROM habits 
            LEFT JOIN groups 
            ON habits.group_id = groups.id`);
        try {
            const habits = await habitQuery.executeAsync();
            habitRows = await habits.getAllAsync();

            // Filter habits that are Due today and already in DB
            const HabitList = (habitRows as any[])
                .map(habit => ({
                    ...mapDBToHabit(habit), // Map habit-specific fields
                    group_title: habit.group_title,
                    group_bgColor: habit.group_bgColor,
                    group_textColor: habit.group_textColor
                }))
                .filter(habit =>
                    habit.dtEnd >= dueDate &&
                    habit.dtStart <= dueDate &&
                    habit.id && !tasks.some((task: any) => task.habit_id === habit.id)
                );

            // Generate dynamic tasks
            (HabitList.length > 0)
                ? (dynamicTasks = await generateDynamicTasks(db, HabitList, dueDate))
                : dynamicTasks = null;

        } finally {
            await habitQuery.finalizeAsync();
        }

        // Fetch task details
        const taskDetails = await Promise.all(
            (await tasks).map(async (row: any) => {
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
                    let tempHabit = habitRows.find((habit: any) => habit.id === row.habit_id);
                    habit = {
                        id: row.habit_id,
                        title: (tempHabit as any).title,
                    }
                }

                // Fetch references
                const refQuery = await db.prepareAsync(
                    `SELECT id,name,url FROM reference WHERE task_id = $todoId;`
                );
                try {
                    const refRows = await refQuery.executeAsync({ $todoId: row.id });
                    references = (await refRows.getAllAsync())
                        .filter((ref: any) => ref.url && ref.url.trim() !== '')
                        .map((ref: any) => ({
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

        // Merge tasks and dynamic tasks
        const finalTasks = await mergeTasks(taskDetails, dynamicTasks ?? [], dueDate, db)

        // return mapped task.
        return (await finalTasks).map(mapDBToTask);

    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};



// get tasks & habits by group ->  PROGRESS PAGE
export const getFullGroup = async (db: SQLiteDatabase, selectedGroup: Group) => {
    const todoQuery = await db.prepareAsync(
        `SELECT * FROM todos WHERE group_id = $groupId AND is_task = 1 AND is_deleted = 0 AND habit_id IS NULL ORDER BY due_at`
    );
    try {
        const todoRows = await todoQuery.executeAsync({ $groupId: selectedGroup.id });
        const taskDetails = await Promise.all(
            (await todoRows.getAllAsync()).map(async (row: any) => {
                let group = selectedGroup;
                let habit = null;
                let references = null;

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
        const goalTasks = taskDetails.map(mapDBToTask);

        // Fetch habits
        const habitQuery = await db.prepareAsync(`SELECT * FROM habits WHERE group_id = $groupId`);
        const habits = await habitQuery.executeAsync({ $groupId: selectedGroup.id });
        const habitRows = await habits.getAllAsync();
        const habitList = habitRows.map(mapDBToHabit);


        // Return Group
        return { goalTasks, habitList };

    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
    finally {
        await todoQuery.finalizeAsync();
    }
}

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
                newTask.dueAt ? formatDateForDB(newTask.dueAt) : null,
                newTask.comment ?? '',
                oldTask.id,
            ]);
            console.log('Task updated successfully');
        } finally {
            await updateStatement.finalizeAsync();
        }
    }

    // Update references, loop through the reference list,
    const delRefs = oldTask.references.filter((ref) => !newTask.references.includes(ref));
    const addRefs = newTask.references.filter((ref) => ref.id === null);

    // Delete references
    await deleteReferences(db, delRefs);

    // Add references
    await insertReferences(db, oldTask.id, addRefs);
}

// get Group list
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
        }));
        return groupsList;
    } finally {
        await groupsQuery.finalizeAsync();
    }
}

// Add Habit
export const addHabit = async (db: SQLiteDatabase, newHabit: Habit) => {
    const insertQuery = await db.prepareAsync(
        `INSERT INTO habits (group_id, title, interval, by_week_day, dt_start, dt_end, reference_link) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    var HabitId: number;

    try {
        await insertQuery.executeAsync([
            newHabit.groupId,
            newHabit.title,
            newHabit.interval ?? 1,
            JSON.stringify(newHabit.byWeekDay),
            formatDateForDB(newHabit.dtStart),
            formatDateForDB(newHabit.dtEnd),
            newHabit.referenceLink ?? null,
        ]);
    }
    finally {
        await insertQuery.finalizeAsync();
    }
}

// get links for FEEDS PAGE
export const getRefLinks = async (db: SQLiteDatabase, from: Date, to: Date) => {
    const dt_from = formatDateForDB(from);
    const dt_to = formatDateForDB(to);

    const refQuery = await db.prepareAsync(
        `SELECT
        todos.id AS task_id,
        todos.title AS task_title,
        reference.name AS ref_name,
        reference.url AS ref_url
        FROM reference
        INNER JOIN todos ON reference.task_id = todos.id
        WHERE todos.due_at BETWEEN $dt_from AND $dt_to
        ORDER BY todos.due_at`
    );
    try {
        const refRows = await refQuery.executeAsync({ $dt_from: dt_from, $dt_to: dt_to });
        const refLinks = await refRows.getAllAsync();
        return refLinks.map((ref: any) => ({
            task_id: ref.task_id as number,
            task_title: ref.task_title as string,
            name: ref.ref_name as string,
            url: ref.ref_url as string,
        }));
    } finally {
        await refQuery.finalizeAsync();
    }
}

// get All group Summary,  User PROFILE PAGE
export const getGroupOverview = async (db: SQLiteDatabase) => {
    // LEFT join + WHERE  ==> INNER JOIN, (use AND instead of WHERE)
    const groupsQuery = await db.prepareAsync(
        `SELECT
            groups.id AS group_id,
            groups.title AS group_title,
            groups.description AS group_description,
            groups.group_bgColor AS group_bgColor,
            COUNT(todos.id) AS task_count,
            COUNT(todos.completed_at) AS completed_count
        FROM groups
        LEFT JOIN todos ON groups.id = todos.group_id 
            AND todos.is_task = 1 
            AND todos.is_deleted = 0 
            AND todos.habit_id IS NULL
        GROUP BY groups.id`
    );

    const habitsQuery = await db.prepareAsync(`SELECT count(id) AS habit_count FROM habits WHERE group_id = $groupId`);
    try {
        const groupsRows = await groupsQuery.executeAsync();
        const groups = await groupsRows.getAllAsync();
        let result = groups.map((group: any) => ({
            id: group.group_id,
            title: group.group_title,
            description: group.group_description,
            bgColor: group.group_bgColor,
            taskCount: group.task_count,
            completedTask: group.completed_count,
            habitCount: 0,
        }));

        for (let group of result) {
            const habitRows = await habitsQuery.executeAsync({ $groupId: group.id });
            const habits = await habitRows.getFirstAsync();
            group.habitCount = (habits as { habit_count: number }).habit_count;
        }

        return result;
    } finally {
        await habitsQuery.finalizeAsync();
        await groupsQuery.finalizeAsync();
    }
}

// Add Groups
export const addGroup = async (db: SQLiteDatabase, newGroup: Group, newHabits: Habit[] | null, newTasks: Task[] | null) => {
    const insertQuery = await db.prepareAsync(
        `INSERT INTO groups (title, description, group_bgColor, group_textColor) VALUES (?, ?, ?, ?)`);
    try {
        const groupId = await (await insertQuery.executeAsync([
            newGroup.title,
            newGroup.description ?? '',
            newGroup.bgColor,
            newGroup.textColor,
        ]))?.lastInsertRowId;

        // map group id to habits and tasks
        if (newHabits) {
            newHabits.forEach(async (habit) => {
                habit.groupId = groupId;
                await addHabit(db, habit);
            });
        }

        if (newTasks) {
            newTasks.forEach(async (task) => {
                task.group = {
                    id: groupId,
                    title: newGroup.title,
                    bgColor: newGroup.bgColor,
                    textColor: newGroup.textColor,
                };
                await addTask(db, task);
            });
        }

        // notify user
        ToastAndroid.show('Group added successfully', ToastAndroid.SHORT);
    }
    catch (error) {
        ToastAndroid.show('Unable to add group', ToastAndroid.SHORT);
    }
    finally {
        await insertQuery.finalizeAsync();
    }
}

// Delete Group -- this wont work you have to delete the references as well
export const deleteGroup = async (db: SQLiteDatabase, groupId: number) => {
    const getTaskId = await db.prepareAsync(`SELECT id FROM todos WHERE group_id = ?`);
    const delGroupQuery = await db.prepareAsync(`DELETE FROM groups WHERE id = ?`);
    const delHabitsQuery = await db.prepareAsync(`DELETE FROM habits WHERE group_id = ?`);
    const delTasksQuery = await db.prepareAsync(`DELETE FROM todos WHERE group_id = ?`);

    try {
        // Delete references
        const IdList = await (await getTaskId.executeAsync([groupId])).getAllAsync();
        for (let Id of IdList as { id: number }[]) {
            await db.execAsync(`DELETE FROM reference WHERE task_id = ${Id.id}`);
        }

        // Delete tasks, habits and group 
        await delHabitsQuery.executeAsync([groupId]);
        await delTasksQuery.executeAsync([groupId]);
        await delGroupQuery.executeAsync([groupId]);

        ToastAndroid.show('Group deleted successfully', ToastAndroid.SHORT);
    }
    catch (error) {
        console.error("Error deleting group:", error);
        ToastAndroid.show('Unable to delete group', ToastAndroid.SHORT);
    }
    finally {
        await delGroupQuery.finalizeAsync();
        await delHabitsQuery.finalizeAsync();
        await delTasksQuery.finalizeAsync();
    }
}


// fetch Bookmarks
export const getBookmarks = async (db: SQLiteDatabase) => {
    const bookmarkQuery = await db.prepareAsync(
        `SELECT id, name, url FROM reference WHERE task_id IS NULL`
    );
    try {
        const bookmarkRows = await bookmarkQuery.executeAsync();
        const bookmarks = await bookmarkRows.getAllAsync();
        return bookmarks.map((ref: any) => ({
            id: ref.id as number,
            name: ref.name as string,
            url: ref.url as string,
        }));
    } finally {
        await bookmarkQuery.finalizeAsync();
    }
}