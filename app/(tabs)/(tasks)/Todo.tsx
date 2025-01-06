import { View, Text, FlatList, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-expo';
import { Task } from '@/utils/customTypes';
import TaskListItems from '@/components/TaskListItems';
import { useSQLiteContext } from 'expo-sqlite';
import { addTodo, getTodos, markDeleted, updateTodo } from '@/utils/taskService';
import FooterTaskInput from '@/components/FooterTaskInput';

const Todo = () => {
    const { user } = useUser();
    const db = useSQLiteContext();
    const [todos, setTodos] = useState<Task[]>([]);
    const [refreshDB, setRefreshDB] = useState(false);


    // Hook to fetch todos from the database
    useEffect(() => {
        const fetchTodos = async () => {
            const todo_list = await getTodos(db) as Task[];
            //console.log(todo_list);
            setTodos(todo_list);
        };
        fetchTodos();
    }, [refreshDB]);


    // Function to delete a todo
    const DeleteTask = async (id: number) => {
        // setTodos((currentTodo) => currentTodo.filter((_, i) => i !== index));
        await markDeleted(db, id);
        setRefreshDB(!refreshDB);
    };

    // Function to delete a todo
    const EditTask = async (id: number, Text: string) => {
        await updateTodo(db, id, Text);
        setRefreshDB(!refreshDB);
    };

     // Function to add a new todo
     const handleAddTodo = async (newTodo: string) => {
        await addTodo(db, newTodo);
        setRefreshDB(!refreshDB);
    };


    return (
        <View>
            <FlatList
                style={styles.taskView}
                data={todos}
                contentContainerStyle={{ gap: 7 }}
                keyExtractor={(item) => item.id.toString()}

                renderItem={({ item, index }) =>
                    <TaskListItems
                        db={db}
                        item={item}
                        index={index}
                        setTasks={setTodos}
                        onDelete={() => DeleteTask(item.id)}
                        onEdit={(newTask:string) => EditTask(item.id, newTask)}
                    />
                }

                ListFooterComponent={() =>
                    <FooterTaskInput
                        onAdd={(newTodo: string) => handleAddTodo(newTodo)} />}
            />
        </View>
    )
}

export default Todo


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#white',
    },
    taskView: {
        flexDirection: 'column',
        backgroundColor: 'transparent',
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    taskTitle: {
        fontFamily: 'InterSemi',
        fontSize: 18,
        color: 'dimgray',
        flex: 1,
    },
});