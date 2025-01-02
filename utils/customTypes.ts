export interface Task {
    id: number; // Optional for new tasks
    task: string;
    done?: boolean; // Defaults to false
    createdAt?: string; // Defaults to current timestamp
    dueAt?: string | null; // Optional
    completedAt?: string | null; // Optional
    isDeleted?: boolean; // Defaults to false
    deletedAt?: string | null; // Optional
    isTask?: boolean; // Defaults to false
}
