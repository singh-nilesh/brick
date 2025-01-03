import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Task } from '@/utils/customTypes';
import { SQLiteDatabase } from 'expo-sqlite';
import { markAsDone, markAsNotDone } from '@/utils/taskService';



interface TaskListItemsProps {
    db: SQLiteDatabase;
    item: Task;
    index: number;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    onDelete: () => void;
}

const TaskListItems = ({ db, item, index, setTasks, onDelete }: TaskListItemsProps) => {

    const onItemPressed = (index: number) => {
        setTasks((currentTasks) => {
            const updatedTasks = [...currentTasks];
            const isDone = !updatedTasks[index].done; // Toggle state
            updatedTasks[index].done = isDone;

            // Anonymous async function call to 
            // Perform database operation
            (async () => {
                if (isDone) {
                    await markAsDone(db, updatedTasks[index].id);
                } else {
                    await markAsNotDone(db, updatedTasks[index].id);
                }
            })();
        
            return updatedTasks;
        });
    };


    return (
        <Swipeable
            renderRightActions={() => (
                <Pressable style={styles.deleteIcon} onPress={onDelete}>
                    <MaterialCommunityIcons name="delete" size={27} color="black" />
                </Pressable>
            )}
        >
            <Pressable
                style={styles.taskContainer}
                onPress={() => onItemPressed(index)}
            >
                <Feather
                    name={item.done ? 'check-circle' : 'circle'}
                    size={24}
                    color={item.done ? 'grey' : 'black'}
                    style={{ marginRight: 10 }} // Use style for spacing
                />

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
        </Swipeable>
    );
};

export default TaskListItems;

const styles = StyleSheet.create({
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
    deleteIcon: {
        backgroundColor: '#F8C4B4',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 5,
    },
});
