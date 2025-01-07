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
        task: row.task,
        done: !!row.done,
        createdAt: parseDateFromDB(row.created_at),
        dueAt: parseDateFromDB(row.due_at),
        completedAt: parseDateFromDB(row.completed_at),
        isDeleted: !!row.is_deleted,
        deletedAt: parseDateFromDB(row.deleted_at),
        isTask: !!row.is_task,
    };
}

// Define a function to map the Task object to a database row
export function mapTaskToDB(task: Task): any {
    return {
        task: task.task,
        done: task.done ? 1 : 0,
        created_at: formatDateForDB(task.createdAt || null),
        due_at: formatDateForDB(task.dueAt || null),
        completed_at: formatDateForDB(task.completedAt || null),
        is_deleted: task.isDeleted ? 1 : 0,
        deleted_at: formatDateForDB(task.deletedAt || null),
        is_task: task.isTask ? 1 : 0,
    };
}