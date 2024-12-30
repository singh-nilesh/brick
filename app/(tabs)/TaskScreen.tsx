import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, TextInput } from 'react-native'
import React, { useState } from 'react'
import HorizontalDatePicker from '@/components/HorizontalDatePicker'
import HeaderDatePicker from '@/components/HeaderDatePicker';
import FooterTaskInput from '@/components/FooterTaskInput';
import TaskListItems from '@/components/TaskListItems';
import modalTask from '@/modal/modalTask';
import { useUser } from '@clerk/clerk-expo';

const dummyTasks: modalTask[] = [{
    title: 'Complete project report',
    date: new Date(),
    completed: false,
}, {
    title: 'Team meeting',
    date: new Date(),
    completed: true,
}, {
    title: 'Code review',
    date: new Date(),
    completed: false,
}, {
    title: 'Client presentation',
    date: new Date(),
    completed: true,
}, {
    title: 'Update documentation',
    date: new Date(),
    completed: false,
}, {
    title: 'Fix bugs',
    date: new Date(),
    completed: true,
}, {
    title: 'Plan next sprint',
    date: new Date(),
    completed: false,
}, {
    title: 'Deploy to production',
    date: new Date(),
    completed: true,
}
];


const TaskScreen = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { user } = useUser();
    
    const [tasks, setTasks] = useState<modalTask[]>(dummyTasks);


    // using a Filter, Instead of Splice, keeps the original array intact, 
    const DeleteTask = (index: number) => {
        setTasks((currentTask) => currentTask.filter((_, i) => i !== index));
    };
    
    return (
        <View style={styles.container}>
            <Text>Welcome, {user?.emailAddresses[0].emailAddress} 🎉</Text>
            <HeaderDatePicker
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />
            <HorizontalDatePicker
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />
            <FlatList
                style={styles.taskView}
                data={tasks}
                contentContainerStyle={{ gap: 7}}
                keyExtractor={(item) => item.title}

                renderItem={({ item, index }) => 
                    <TaskListItems
                        item={item}
                        index={index}
                        setTasks={setTasks}
                        onDelete={() => DeleteTask(index)}
                    />
                }

                ListFooterComponent={() =>
                    <FooterTaskInput
                        onAdd={(newTodo: string) => setTasks((currentTasks: modalTask[]) => [
                            ...currentTasks,
                            {
                                title: newTodo,
                                date: selectedDate,
                                completed: false,
                            },
                        ])} />}
            />
        </View>
    )
}

export default TaskScreen

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