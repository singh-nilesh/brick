import { View, Text, FlatList, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-expo';
import { Task } from '@/utils/customTypes';
import TaskListItems from '@/components/TaskListItems';
import { useSQLiteContext } from 'expo-sqlite';
import { getTodos } from '@/utils/taskService';

const Todo = () => {
    const { user } = useUser();
    const db = useSQLiteContext();
    const [todos, setTodos] = useState<Task[]>([]);

    // Hook to fetch todos from the database
    useEffect(() => {
        const fetchTodos = async () => {
            const todo_list = await getTodos(db) as Task[];
            console.log(todo_list);
            setTodos(todo_list);
        };
        fetchTodos();
    }, [db]);

    // Function to delete a task
    const DeleteTask = (index: number) => {
        setTodos((currentTodo) => currentTodo.filter((_, i) => i !== index));
    };

    return (
        <View>
            <Text>Welcome, {user?.emailAddresses[0].emailAddress} 🎉</Text>
            <FlatList
                style={styles.taskView}
                data={todos}
                contentContainerStyle={{ gap: 7 }}
                keyExtractor={(item) => item.id.toString()}

                renderItem={({ item, index }) =>
                    <TaskListItems
                        item={item}
                        index={index}
                        setTasks={setTodos}
                        onDelete={() => DeleteTask(index)}
                    />
                }
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