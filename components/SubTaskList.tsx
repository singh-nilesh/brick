import { ScrollView, StyleSheet, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Todo } from '@/utils/customTypes'
import { addSubtask, deleteSubtask, getSubtasks, markDeleted, updateSubtask } from '@/utils/todoService';
import FooterTaskInput from './FooterTaskInput';
import TodoListItems from './TodoListItems';
import { SQLiteDatabase } from 'expo-sqlite';

interface SubTaskListProps {
    task_id: number
    subtasks: Todo[]
    db: SQLiteDatabase
    setSubtasks: (todos: Todo[]) => void
}

const SubTaskList = ({ task_id, subtasks, setSubtasks, db }: SubTaskListProps) => {

    const [todos, setTodos] = useState<Todo[]>(subtasks);

    useCallback(() => {
        setSubtasks(todos);
    }
        , [setTodos])

    // function to refetch the subtasks
    const fetchSubtasks = async () => {
        setTodos(await getSubtasks(db, task_id));
    }


    // Function to delete a todo
    const DeleteTask = async (id: number) => {
        await deleteSubtask(db, id);
        fetchSubtasks();
    };

    // Function to update a todo
    const EditTask = async (item: Todo, Text: string) => {
        item.title = Text;
        await updateSubtask(db, item);
        fetchSubtasks();
    };

    // Function to add a new todo
    const handleAddTodo = async (newTodo: string) => {
        console.log(newTodo);
        await addSubtask(db, task_id, newTodo)
        fetchSubtasks();
    };

    return (
        <ScrollView
            style={styles.taskView}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
        >
            {todos.map((item) => (
                <TodoListItems
                    isSubtask={true}
                    key={item.id}
                    db={db}
                    item={item}
                    setTasks={setTodos}
                    onDelete={() => DeleteTask(item.id)}
                    onEdit={(newTask: string) => EditTask(item, newTask)}
                />
            ))}
            <FooterTaskInput onAdd={(newTodo: string) => handleAddTodo(newTodo)} />
        </ScrollView>
    );
}

export default SubTaskList

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    taskView: {
        flexDirection: 'column',
        backgroundColor: 'transparent',
    },
})