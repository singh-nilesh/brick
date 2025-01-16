export interface Task {
    id: number;
    group_id: number;
    title: string;
    description?: string | null;
    comment?: string | null;
    status?: boolean | false;
    priority?: number | 5; // 5 is NO priority
    createdAt?: Date | null;
    dueAt?: Date | null;
    completedAt?: Date | null;
    isDeleted?: boolean;
    deletedAt?: Date | null;
    isTask?: boolean | false;
    habit_id?: number;
}
