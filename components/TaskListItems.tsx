import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import React, { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Task } from '../utils/customTypes';
import { SQLiteDatabase } from 'expo-sqlite';
import { markAsDone, markAsNotDone } from '../utils/todoService';


interface TaskListItemsProps {
    db: SQLiteDatabase;
    item: Task;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    onDelete: () => void;
    onTaskPress: () => void;
}

const TaskListItems = ({ db, item, setTasks, onDelete, onTaskPress }: TaskListItemsProps) => {
    //const [isEditing, setIsEditing] = useState(false);
    //const [editedTask, setEditedTask] = useState<string>(item.task);

    const handleIsDone = (id: number) => {
        setTasks((currentTasks) => {
            const updatedTasks = currentTasks.map((task) =>
                task.id === id ? { ...task, status: !task.status } : task
            );

            // Perform database operation
            const taskToUpdate = updatedTasks.find((task) => task.id === id);
            if (taskToUpdate) {
                (async () => {
                    if (taskToUpdate.status) {
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
                        name={item.status ? 'check-circle' : 'circle'}
                        size={24}
                        color={item.status ? 'grey' : 'black'}
                        style={{ marginRight: 10 }}
                    />
                </Pressable>

                <Pressable style={{ flex: 1 }} onPress={onTaskPress}>
                    <Text
                        style={[
                            styles.taskTitle,
                            { color: item.status ? 'grey' : 'black' },
                            { textDecorationLine: item.status ? 'line-through' : 'none' },
                        ]}
                        numberOfLines={1} // Ensures single-line text
                        ellipsizeMode="tail" // Adds "..." if text overflows
                    >
                        {item.title}
                    </Text>
                </Pressable>
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
        fontSize: 18,
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
