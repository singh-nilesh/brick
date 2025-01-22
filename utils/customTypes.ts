
export interface Todo {
    id: number;
    title: string;
    status?: boolean | false;
    createdAt?: Date | null;
    completedAt?: Date | null;
    isDeleted?: boolean;
    deletedAt?: Date | null;
}


export interface Task {
    id: number;
    title: string;
    description?: string | null;
    comment?: string | null;
    status?: boolean | false;
    priority: number;
    createdAt?: Date | null;
    dueAt?: Date | null;
    completedAt?: Date | null;
    isDeleted: boolean;
    deletedAt?: Date | null;
    group: {
        id: number;
        title: string;
        bgColor: string;
        textColor: string;
    } | null;

    habit: {
        id: number;
        title: string;
    } | null;

    references: {
        id: number | null;
        name: string;
        url: string;
    }[];
}

export interface Group {
    id: number;
    title: string;
    description?: string | null;
    bgColor: string;
    textColor: string;
    newTaskCount: number;
}

export interface Habit {
    id: number;
    title: string;
    groupId: number | null;
    createdAt: Date;
    interval: number | 1;
    byWeekDay: number[];
    byMonth: number | 1;
    dtStart: Date;
    dtEnd: Date;
}
