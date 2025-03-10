import { View, FlatList, StyleSheet, RefreshControl } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Todo } from '../../../../utils/customTypes';
import TodoListItems from '../../../../components/TodoListItems';
import { useSQLiteContext } from 'expo-sqlite';
import { addTodo, getTodos, markDeleted, updateTodo } from '../../../../utils/todoService';
import FooterTaskInput from '../../../../components/FooterTaskInput';
import { useFocusEffect } from 'expo-router';

const TodoScreen = () => {
    const db = useSQLiteContext();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [refreshDB, setRefreshDB] = useState(false);


    const fetchTodos = async () => {
        const todo_list = (await getTodos(db)) as Todo[];
        setTodos(todo_list);
    };

    // Hook to fetch todos from the database
    useFocusEffect(
        useCallback(() => {
            fetchTodos();
        }, [db, refreshDB])
    );



    // Function to delete a todo
    const DeleteTask = async (id: number) => {
        // setTodos((currentTodo) => currentTodo.filter((_, i) => i !== index));
        await markDeleted(db, id);
        setRefreshDB(!refreshDB);
    };

    // Function to update a todo
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
        <View >
            <FlatList
                style={styles.taskView}
                data={todos}
                contentContainerStyle={{ gap: 7 }}
                keyExtractor={(item) => item.id.toString()}

                renderItem={({ item }) =>
                    <TodoListItems
                        db={db}
                        item={item}
                        setTasks={setTodos}
                        onDelete={() => DeleteTask(item.id)}
                        onEdit={(newTask: string) => EditTask(item.id, newTask)}
                    />
                }

                ListFooterComponent={() =>
                    <FooterTaskInput
                        onAdd={(newTodo: string) => handleAddTodo(newTodo)} />}

                refreshControl={
                    <RefreshControl refreshing={false} onRefresh={() => setRefreshDB(!refreshDB)} />
                }
            />
        </View>
    )
}

export default TodoScreen


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