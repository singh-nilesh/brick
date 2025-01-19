import { formatISO, parseISO } from 'date-fns';
import { Task, Todo } from './customTypes';

// Define the date format utility
function formatDateForDB(date: Date | null): string | null {
    return date ? formatISO(date) : null;
}

function parseDateFromDB(date: string | null): Date | null {
    return date ? parseISO(date) : null;
}

// Define a function to map a database row to the Task object
export function mapDBToTodo(row: any): Todo {
    return {
        id: row.id,
        title: row.title,
        status: !!row.status,
        createdAt: parseDateFromDB(row.created_at),
        completedAt: parseDateFromDB(row.completed_at),
        isDeleted: !!row.is_deleted,
        deletedAt: parseDateFromDB(row.deleted_at)
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
        createdAt: dbRow.created_at ? new Date(dbRow.created_at) : null,
        dueAt: dbRow.due_at ? new Date(dbRow.due_at) : null,
        completedAt: dbRow.completed_at ? new Date(dbRow.completed_at) : null,
        isDeleted: dbRow.is_deleted === 1, // Convert integer to boolean
        deletedAt: dbRow.deleted_at ? new Date(dbRow.deleted_at) : null,
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

