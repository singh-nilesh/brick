import { Task } from "./customTypes";
import { format } from "date-fns";


//Converts a Task object to a database-compatible format.
/*
export const mapTaskToDB = (task: Task): Omit<Task, "id"> => ({
    task: task.task,
    done: task.done ? 1 : 0,
    createdAt: task.createdAt || format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    dueAt: task.dueAt || null,
    completedAt: task.completedAt || null,
    isDeleted: task.isDeleted ? 1 : 0,
    deletedAt: task.deletedAt || null,
    isTask: task.isTask ? 1 : 0,
});
*/

//Converts a database row to a Task object.
export const mapDBToTask = (row: any): Task => ({
    id: row.id,
    task: row.task,
    done: !!row.done,
    createdAt: row.created_at,
    dueAt: row.due_at || null,
    completedAt: row.completed_at || null,
    isDeleted: !!row.is_deleted,
    deletedAt: row.deleted_at || null,
    isTask: !!row.is_task,
});
