export interface Task {
    id: number;
    task: string;
    done?: boolean;
    createdAt?: Date | null;
    dueAt?: Date | null;
    completedAt?: Date | null;
    isDeleted?: boolean;
    deletedAt?: Date | null;
    isTask?: boolean;
}
