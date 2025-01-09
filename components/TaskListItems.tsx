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
}

const TaskListItems = ({ db, item, setTasks, onDelete }: TaskListItemsProps) => {
    //const [isEditing, setIsEditing] = useState(false);
    //const [editedTask, setEditedTask] = useState<string>(item.task);

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
            <View style={styles.container}>
                {/* Checkbox */}
                <Pressable style={{ padding: 5 }} onPress={() => handleIsDone(item.id)}>
                    <Feather
                        name={item.done ? 'check-circle' : 'circle'}
                        size={24}
                        color={item.done ? 'grey' : 'black'}
                        style={{ marginRight: 10 }}
                    />
                </Pressable>

                <Text
                    style={[
                        styles.taskTitle,
                        { color: item.done ? 'grey' : 'black' },
                        { textDecorationLine: item.done ? 'line-through' : 'none' },
                    ]}
                >
                    {item.task}
                </Text>
            </View>
        </Swipeable>
    );
};

export default TaskListItems;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        marginHorizontal: 10,
        padding: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'lightgrey',
    },
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
