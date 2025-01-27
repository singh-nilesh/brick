import { SQLiteDatabase } from "expo-sqlite";
import { mapDBToHabit, mapDBToTask } from "./dbUtils";
import { format, formatISO } from 'date-fns';
import { Habit, Task } from "./customTypes";


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


// Generate Task Dynamically
const generateDynamicTasks = async (db: SQLiteDatabase, Habits: Habit[], dueDate: Date): Promise<any[]> => {
    if (Habits.length === 0) {
        return [];
    }

    // Normalize the DueAt to the start of the day (0,0,0,0)
    dueDate.setHours(0, 0, 0, 0);


    var taskList: any[] = [];
    for (let habit of Habits) {
        // normalize the habit start and end date
        habit.dtStart.setHours(0, 0, 0, 0);
        habit.dtEnd.setHours(0, 0, 0, 0);

        // check day of the week for the habit
        if (habit.byWeekDay.includes(dueDate.getDay())) {

            // compute as per interval, if the habit is due today
            let isDue: Boolean = false;

            // if the Start date is due today
            if (habit.dtStart.getTime() === dueDate.getTime()) {
                isDue = true;

                console.log('StartDate if-statement:', habit.dtStart, '\n DueDate if-statement:', dueDate);
            }
            else {
                const startOfStartWeek = new Date(habit.dtStart);
                startOfStartWeek.setDate(habit.dtStart.getDate() - habit.dtStart.getDay());

                const startOfDueWeek = new Date(dueDate);
                startOfDueWeek.setDate(dueDate.getDate() - dueDate.getDay());

                console.log('startOfStartWeek else:', startOfStartWeek, '\n startOfDueWeek else:', startOfDueWeek);

                const weeksSinceStart = Math.ceil((startOfDueWeek.getTime() - startOfStartWeek.getTime()) / (7 * 24 * 60 * 60 * 1000));

                // Check if the current week aligns with the interval
                if (weeksSinceStart % habit.interval === 0) {
                    isDue = true;
                }
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
                    created_at: formatISO(new Date()),
                    due_at: formatISO(dueDate),
                    completed_at: null,
                    is_deleted: 0,
                    deleted_at: null,
                    is_task: 1,
                    habit_id: habit.id,
                });
            }

        }
    }
    return taskList;
}

// Merge tasks and dynamic tasks
const mergeTasks = async (tasks: any[], dynamicTasks: any[], dueAt: Date, db: SQLiteDatabase): Promise<any[]> => {

    // Insert dynamic tasks if the due date is today
    if (dueAt.toDateString() === new Date().toDateString()) {
        const insertStmt = await db.prepareAsync(`INSERT INTO todos (title, group_id, due_at, habit_id, is_task, created_at)
                VALUES ( $title, $groupId, $dueAt, $habitId, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`);
        try {
            for (const Task of dynamicTasks) {
                await insertStmt.executeAsync({
                    $title: Task.title,
                    $groupId: Task.group_id,
                    $dueAt: dueAt.toISOString(),
                    $habitId: Task.habit_id,
                });
            }
        }
        finally {
            await insertStmt.finalizeAsync();
        }
    }
    return [...tasks, ...dynamicTasks];
};

// Get Tasks
export const getTasksForDate = async (db: SQLiteDatabase, dueDate: Date) => {
    const formattedDate = format(formatISO(dueDate), 'yyyy-MM-dd');
    console.log('Due Date:', formatISO(dueDate));
    console.log('formatted Due Date:', formattedDate);


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

        const habitQuery = await db.prepareAsync(`SELECT * FROM habits`);
        try {
            const habits = await habitQuery.executeAsync();
            habitRows = await habits.getAllAsync();

            // Filter habits that are Due today
            const HabitList = habitRows.map(mapDBToHabit).filter((habit) => {
                if ((habit.dtEnd >= dueDate) &&
                    (habit.dtStart <= dueDate) &&
                    (habit.id && !tasks.some((task: any) => task.habit_id === habit.id))
                ) return habit
            });
            if (HabitList.length > 0) {
                dynamicTasks = await generateDynamicTasks(db, HabitList, dueDate);
            }
            else {
                dynamicTasks = null;
            }

        } finally {
            await habitQuery.finalizeAsync();
        }

        // Merge the static and dynamic tasks
        var todoResult;
        dynamicTasks ? todoResult = mergeTasks(tasks, dynamicTasks, dueDate, db) : todoResult = tasks;

        // Fetch task details
        const taskDetails = await Promise.all(
            (await todoResult).map(async (row: any) => {
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

// get all Group
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


// Add Habit
export const addHabit = async (db: SQLiteDatabase, newHabit: Habit) => {
    const insertQuery = await db.prepareAsync(
        `INSERT INTO habits (group_id, title, interval, by_week_day, dt_start, dt_end) VALUES (?, ?, ?, ?, ?, ?)`);
    var HabitId: number;

    try {
        await insertQuery.executeAsync([
            newHabit.groupId,
            newHabit.title,
            newHabit.interval ?? 1,
            JSON.stringify(newHabit.byWeekDay),
            formatISO(newHabit.dtStart),
            formatISO(newHabit.dtEnd),
        ])
        console.log('Habit added successfully');
    }
    finally {
        await insertQuery.finalizeAsync();
    }
}