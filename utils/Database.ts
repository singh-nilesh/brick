import { SQLiteDatabase } from "expo-sqlite";
import * as FileSystem from 'expo-file-system';
import { format } from "date-fns";


export async function migrateDbIfNeeded(db: SQLiteDatabase) {

    // for debugigng only
    console.log(FileSystem.documentDirectory);


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
        CREATE TABLE todos (
            id INTEGER PRIMARY KEY,
            task TEXT NOT NULL,
            done INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            due_at DATETIME,
            completed_at DATETIME,
            is_deleted INTEGER NOT NULL DEFAULT 0,
            deleted_at DATETIME,
            is_task INTEGER NOT NULL DEFAULT 0
        );`);

        await db.runAsync(
            'INSERT INTO todos (task, done, created_at, is_deleted, is_task) VALUES (?, ?, ?, ?, ?)',
            'Initial table entry', // Task text
            0,                 // done: false
            format(new Date(), "yyyy-MM-dd HH:mm:ss"), // created_at: current timestamp
            0,                 // is_deleted: false
            0                  // is_task: false
          );
          
          await db.runAsync(
            'INSERT INTO todos (task, done, created_at, is_deleted, is_task) VALUES (?, ?, ?, ?, ?)',
            'Add more todos ....', // Task text
            0,                     // done: false
            format(new Date(), "yyyy-MM-dd HH:mm:ss"), // created_at: current timestamp
            0,                     // is_deleted: false
            0                      // is_task: false
          );

        console.log('Table created');
        currentDbVersion = 1;
    }
    // if (currentDbVersion === 1) {
    //   Add more migrations
    // }
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}