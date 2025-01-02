import { View, Text, FlatList, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-expo';
import { Task } from '@/utils/customTypes';
import TaskListItems from '@/components/TaskListItems';

const Todo = () => {
    const { user } = useUser();
    const [todo, setTodo] = useState<Task[]>([]);

    const DeleteTask = (index: number) => {
        setTodo((currentTodo) => currentTodo.filter((_, i) => i !== index));
    };

    return (
        <View>
            <Text>Welcome, {user?.emailAddresses[0].emailAddress} 🎉</Text>
            <FlatList
                style={styles.taskView}
                data={todo}
                contentContainerStyle={{ gap: 7 }}
                keyExtractor={(item) => item.id.toString()}

                renderItem={({ item, index }) =>
                    <TaskListItems
                        item={item}
                        index={index}
                        setTasks={setTodo}
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