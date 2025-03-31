import { format } from 'date-fns';
import { Habit, Task, Todo } from './customTypes';

// Define the date format utility
export function formatDateForDB(date: Date | null): string | null {
    return date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
}

export function parseDateFromDB(date: string | null): Date | null {
    return date ? new Date(date) : null;
}

// Define a function to map a database row to the Task object
export const mapDBToTodo = (row: any): Todo => {
    let task_id = null;
    row.task_id ? task_id = row.task_id : null; 
    
    return {
        id: row.id,
        task_id: task_id,
        title: row.title,
        status: !!row.status,
        dueAt: row.due_at ? formatDateForDB(parseDateFromDB(row.due_at)) : null
    };
}



// Function to map a database row to the Task object
export const mapDBToTask = (dbRow: any): Task => {
    return {
        id: dbRow.id,
        title: dbRow.title,
        description: dbRow.description || null,
        comment: dbRow.comment || null,
        status: !!dbRow.status,
        priority: dbRow.priority,
        createdAt: dbRow.created_at ? parseDateFromDB(dbRow.created_at) : null,
        dueAt: dbRow.due_at ? parseDateFromDB(dbRow.due_at) : null,
        completedAt: dbRow.completed_at ? parseDateFromDB(dbRow.completed_at) : null,
        isDeleted: dbRow.is_deleted === 1,
        deletedAt: dbRow.deleted_at ? parseDateFromDB(dbRow.deleted_at) : null,
        dueAtTime: dbRow.due_at_time ? dbRow.due_at_time : null,
        subtasks: dbRow.subtasks ? dbRow.subtasks : [],
        group: dbRow.group
            ? {
                  id: dbRow.group_id,
                  title: dbRow.group.group_title,
                  bgColor: dbRow.group.group_bgColor,
                  textColor: dbRow.group.group_textColor,
              }
            : null,
        habit: dbRow.habit
            ? {
                  id: dbRow.habit_id,
                  title: dbRow.habit.habit_title,
              }
            : null,
        references: dbRow.references ? dbRow.references : [],
    };
};


// map Habits, dbToObj
export const mapDBToHabit = (dbRow: any): Habit => {
    return {
        id: dbRow.id,
        title: dbRow.title,
        groupId: dbRow.group_id,
        createdAt: parseDateFromDB(dbRow.created_at) as Date,
        interval: dbRow.interval,
        byWeekDay: JSON.parse(dbRow.by_week_day),
        dtStart: parseDateFromDB(dbRow.dt_start) as Date,
        dtEnd: parseDateFromDB(dbRow.dt_end) as Date,
        referenceLink: dbRow.reference_link,
    };
};