import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { Todo } from '@/utils/customTypes'
import { addSubtask, getSubtasks, updateSubtask } from '@/utils/todoService';
import FooterTaskInput from './FooterTaskInput';
import TodoListItems from './TodoListItems';
import { SQLiteDatabase } from 'expo-sqlite';
import { MaterialIcons } from '@expo/vector-icons';

interface SubTaskListProps {
    task_id: number
    subtasks: Todo[]
    db: SQLiteDatabase
    isEditing: boolean
    updateSource: (Todos: Todo[]) => void
    onRemove: (id: number) => void
    refreshDb: (val: boolean) => void
}

const SubTaskList = ({ task_id, subtasks, isEditing, onRemove, refreshDb, updateSource, db }: SubTaskListProps) => {

    const [todos, setTodos] = useState<Todo[]>(subtasks);

    const newTodoTemplate = {
        id: 0,
        title: '',
        status: false,
        task_id: task_id,
        dueAt: null,
    };

    // Function to update a todo
    const EditTask = async (item: Todo, Text: string) => {
        item.title = Text;
        const res = await updateSubtask(db, item);
        if (res === 1) {
            setTodos(todos.map((todo) => {
                if (todo.id === item.id) {
                    return { ...todo, title: Text };
                }
                return todo;
            }));
        }
        updateSource(todos);
        refreshDb(true);
    };

    // Function to add a new todo
    const handleAddTodo = async (newTodo: string) => {
        const newId = await addSubtask(db, task_id, newTodo)
        if (newId !== -1) {
            const newTodoItem = { ...newTodoTemplate, id: newId, title: newTodo };
            setTodos([...todos, newTodoItem]);
        }
        updateSource(todos);
        refreshDb(true);
    };

    return (
        <View>
            {todos.map((item) => (
                <View
                    style={[styles.taskView, isEditing ?
                        { borderBottomWidth: 1, borderColor: "#f0f0f0" }: {}]}
                    key={item.id}>
                    <TodoListItems
                        isSubtask={true}
                        key={item.id}
                        db={db}
                        item={item}
                        updateTasks={setTodos}
                        refreshDb={refreshDb}
                        onEdit={(newTask: string) => EditTask(item, newTask)}
                    />
                    {isEditing && (
                        <MaterialIcons
                        style={{ paddingTop: 5 }}
                            name="remove-circle-outline"
                            size={25}
                            color="red"
                            onPress={() => onRemove(item.id)}
                        />
                    )}

                </View>
            ))}
            <FooterTaskInput onAdd={(newTodo: string) => handleAddTodo(newTodo)} />
        </View>
    );
}

export default SubTaskList

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    taskView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
})