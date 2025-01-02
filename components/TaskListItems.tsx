import { View, Text, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import Feather from '@expo/vector-icons/Feather';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Task } from '@/utils/customTypes';


interface TaskListItemsProps {
    item: Task;
    index: number;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    onDelete: () => void;
}

const TaskListItems = ({ item, index, setTasks, onDelete }: TaskListItemsProps) => {

    const onItemPressed = (index: number) => {
        setTasks((currentTask) => {
            const updatedTasks = [...currentTask]; // create a copy of the current tasks, and destructure it(...)
            updatedTasks[index].done = !updatedTasks[index].done;
            return updatedTasks; // Return the updated tasks to SetTasks function
        });
    }


    return (
        <Swipeable
            renderRightActions={() => (
                <MaterialCommunityIcons
                    style={styles.deleteIcon}
                    name="delete" size={27} color="black"
                    onPress={onDelete}
                />
            )}
        >
            <Pressable
                style={styles.taskContainer}
                onPress={() => onItemPressed(index)}
            >
                <Feather
                    name={item.done ? 'check-circle' : 'circle'}
                    size={24}
                    paddingHorizontal={10}
                    color={item.done ? 'grey' : 'black'}
                />

                <Text
                    style={[styles.taskTitle,
                    { color: item.done ? 'grey' : 'black' },
                    { textDecorationLine: item.done ? 'line-through' : 'none' }]}
                >
                    {item.task}
                </Text>
            </Pressable>
        </Swipeable>
    )
}

export default TaskListItems

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
    }
});