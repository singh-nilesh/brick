import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import React, { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Task } from '@/utils/customTypes';
import { SQLiteDatabase } from 'expo-sqlite';
import { markAsDone, markAsNotDone } from '@/utils/taskService';

interface TaskListItemsProps {
    db: SQLiteDatabase;
    item: Task;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    onDelete: () => void;
    onEdit: (newTask: string) => void;
}

const TodoListItems = ({ db, item, setTasks, onDelete, onEdit }: TaskListItemsProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState<string>(item.task);

    const handleIsDone = (id: number) => {
            setTasks((currentTasks) => {
                const updatedTasks = currentTasks.map((task) =>
                    task.id === id ? { ...task, done: !task.done } : task
                );
    
                // Perform database operation
                const taskToUpdate = updatedTasks.find((task) => task.id === id);
                if (taskToUpdate) {
                    (async () => {
                        if (taskToUpdate.done) {
                            await markAsDone(db, id);
                        } else {
                            await markAsNotDone(db, id);
                        }
                    })();
                }
    
                return updatedTasks;
            });
        };


    return (
        <Swipeable
            renderRightActions={() => (
                <View style={{ flexDirection: 'row' }}>
                    <Pressable style={styles.deleteIcon} onPress={onDelete}>
                        <MaterialCommunityIcons name="delete" size={27} color="black" />
                    </Pressable>
                </View>
            )}
        >
            <View style={{ flexDirection: 'row' }}>
                {/* Checkbox */}
                <Pressable style={{ padding: 5 }} onPress={() => handleIsDone(item.id)}>
                    <Feather
                        name={item.done ? 'check-circle' : 'circle'}
                        size={24}
                        color={item.done ? 'grey' : 'black'}
                        style={{ marginRight: 10 }}
                    />
                </Pressable>

                {/* Editable task title */}

                {isEditing ? (
                    <TextInput
                        value={editedTask}
                        onChangeText={setEditedTask}
                        style={[styles.taskTitle, styles.input]}
                        autoFocus
                        onBlur={() => {
                            if (editedTask.trim().length > 0) {
                                onEdit(editedTask.trim());
                            } else {
                                setEditedTask(item.task);
                            }
                            setIsEditing(false);
                        }}
                    />
                ) : (
                    <Pressable style={{}} onPress={() => setIsEditing(!isEditing)}>
                        <Text
                            style={[
                                styles.taskTitle,
                                { color: item.done ? 'grey' : 'black' },
                                { textDecorationLine: item.done ? 'line-through' : 'none' },
                            ]}
                        >
                            {item.task}
                        </Text>
                    </Pressable>
                )}
            </View>
        </Swipeable>
    );
};

export default TodoListItems;

const styles = StyleSheet.create({
    taskTitle: {
        fontFamily: 'InterSemi',
        fontSize: 20,
        color: 'black',
        flex: 1,
        paddingRight: 40,
    },
    input: {
        borderBottomWidth: 0,
        paddingVertical: 2,
        flex: 1,
    },
    deleteIcon: {
        backgroundColor: '#F8C4B4',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
});
