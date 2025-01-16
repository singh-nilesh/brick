import { SQLiteDatabase } from "expo-sqlite";
import * as FileSystem from 'expo-file-system';
import { format, formatISO } from "date-fns";


export async function migrateDbIfNeeded(db: SQLiteDatabase) {

    // for debugigng only
    //console.log(FileSystem.documentDirectory);


    const DATABASE_VERSION = 1;
    let result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    let currentDbVersion = result?.user_version ?? 0;

    // when --> Database is up to date
    if (currentDbVersion >= DATABASE_VERSION) {
        return;
    }

    // when --> new database
    if (currentDbVersion === 0) {
        await db.execAsync(`
        PRAGMA journal_mode = 'wal';
        PRAGMA foreign_keys = ON;


        CREATE TABLE IF NOT EXISTS groups (
           id INTEGER PRIMARY KEY,
           title TEXT NOT NULL,
           description TEXT,
           group_bgColor TEXT NOT NULL DEFAULT '#FFFFFF',
           group_textColor TEXT NOT NULL DEFAULT '#000000',
           new_task_count INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            group_id INTEGER NOT NULL DEFAULT 3 REFERENCES groups(id),
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            interval INTEGER NOT NULL DEFAULT 1,
            by_week_day TEXT NOT NULL DEFAULT '[]',
            by_month Integer DEFAULT 1,
            dt_start TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            dt_end TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT23:59:59Z', 'now'))
        );


        CREATE TABLE IF NOT EXISTS todos (
           id INTEGER PRIMARY KEY,
           group_id INTEGER NOT NULL DEFAULT 1 REFERENCES groups(id),
           title TEXT NOT NULL,
           description TEXT,
           comment TEXT,
           status INTEGER NOT NULL DEFAULT 0,
           priority INTEGER NOT NULL DEFAULT 5 CHECK(priority BETWEEN 1 AND 5),
           created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
           due_at TEXT,
           completed_at TEXT,
           is_deleted INTEGER NOT NULL DEFAULT 0,
           deleted_at TEXT,
           is_task INTEGER NOT NULL DEFAULT 0,
           habit_id INTEGER REFERENCES habits(id)
        );
      
        CREATE TABLE IF NOT EXISTS reference (
           id INTEGER PRIMARY KEY,
           task_id INTEGER NOT NULL REFERENCES todos(id),
           name TEXT NOT NULL,      
           url TEXT NOT NULL,
           created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );

        CREATE INDEX IF NOT EXISTS idx_todos_due_at ON todos(due_at);
        CREATE INDEX IF NOT EXISTS idx_todos_habit_id ON todos(habit_id);
        CREATE INDEX IF NOT EXISTS idx_todos_group_id ON todos(group_id);
        CREATE INDEX IF NOT EXISTS idx_todos_is_task ON todos(is_task); 
        

       `);


        // Insert Queries
        // groups
        await db.runAsync(  // Todo group
            'INSERT INTO groups (title, description, group_bgColor, group_textColor) VALUES (?, ?, ?, ?) RETURNING id',
            'Todos',                     // title
            'Default group for todos',  // description
            '#FFFFFF',                  // group_bgColor
            '#000000'                   // group_textColor
        );

        await db.runAsync( // Tasks group
            'INSERT INTO groups (title, description, group_bgColor, group_textColor) VALUES (?, ?, ?, ?) RETURNING id',
            'Tasks',                     // title
            'Default group for todos',  // description
            '#FFFFFF',                  // group_bgColor
            '#000000'                   // group_textColor
        );

        const habit_groupId = (
            await db.runAsync(
                'INSERT INTO groups (title, description, group_bgColor, group_textColor) VALUES (?, ?, ?, ?) RETURNING id',
                'Habits',
                'Trial group 1',
                '#AEEA94',
                '#000000'
            ))?.lastInsertRowId;

        console.log('Group- Habits:', habit_groupId);


        // habits
        const habitId = (
            await db.runAsync(
                'INSERT INTO habits (title, group_id, interval, by_week_day, dt_start, dt_end) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
                'Daily habits',  // title
                habit_groupId,                // group_id: habits
                1,                      // interval: 1
                '[0,1,2,3,4,5,6]',      // by_day: empty array
                formatISO(new Date()),  // dt_start: current timestamp
                formatISO(new Date())   // dt_end: current timestamp
            ))?.lastInsertRowId;


        // todos
        const todoId = (
            await db.runAsync(
                'INSERT INTO todos (title) VALUES (?) RETURNING id',
                'Initial todo entry',  // title
            ))?.lastInsertRowId;

        if (todoId != null) {
            // Insert initial data into reference
            await db.runAsync(
                'INSERT INTO reference (task_id, name, url, created_at) VALUES (?, ?, ?, ?)',
                todoId, // Foreign key linking to the todos table
                'User Guide', // name
                'https://docs.google.com/document/d/1d_TmPfLqCtashhviQN4AeTY6XV1kZyN4byTbltac-q4/edit?usp=sharing',
                formatISO(new Date()) // created_at: current timestamp
            );
        }


        // first habit-task in todos
        if (habitId != null) {
            await db.runAsync(
                'INSERT INTO todos (group_id, title, due_at, is_task, habit_id) VALUES (?, ?, ?, ?, ?)',
                habit_groupId, //groups habits
                'Daily habits', // title
                formatISO(new Date()), // due_at: current timestamp
                1, // task
                habitId // Foreign key linking to the habits table
            );
            console.log('Habit-task inserted');
        }

        // console.log('Tables created and initial data inserted');
        currentDbVersion = 1;
    }
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}