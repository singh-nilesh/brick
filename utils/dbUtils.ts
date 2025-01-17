import { formatISO, parseISO } from 'date-fns';
import { Task } from './customTypes';

// Define the date format utility
function formatDateForDB(date: Date | null): string | null {
    return date ? formatISO(date) : null;
}

function parseDateFromDB(date: string | null): Date | null {
    return date ? parseISO(date) : null;
}

// Define a function to map a database row to the Task object
export function mapDBToTask(row: any): Task {
    return {
        id: row.id,
        group_id: row.group_id,
        title: row.title,
        description: row.description,
        comment: row.comment,
        status: !!row.status,
        priority: row.priority,
        createdAt: parseDateFromDB(row.created_at),
        dueAt: parseDateFromDB(row.due_at),
        completedAt: parseDateFromDB(row.completed_at),
        isDeleted: !!row.is_deleted,
        deletedAt: parseDateFromDB(row.deleted_at),
        isTask: !!row.is_task,
        habit_id: row.habit_id,
    };
}

// Define a function to map the Task object to a database row
export function mapTaskToDB(task: Task): any {
    return {
        group_id: task.group_id,
        title: task.title,
        description: task.description,
        comment: task.comment,
        status: task.status ? 1 : 0,
        priority: task.priority,
        created_at: formatDateForDB(task.createdAt || null),
        due_at: formatDateForDB(task.dueAt || null),
        completed_at: formatDateForDB(task.completedAt || null),
        is_deleted: task.isDeleted ? 1 : 0,
        deleted_at: formatDateForDB(task.deletedAt || null),
        is_task: task.isTask ? 1 : 0,
        habit_id: task.habit_id,
    };
}