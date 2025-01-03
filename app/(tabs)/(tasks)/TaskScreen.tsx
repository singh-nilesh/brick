import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, TextInput } from 'react-native'
import React, { useState } from 'react'
import HorizontalDatePicker from '@/components/HorizontalDatePicker'
import HeaderDatePicker from '@/components/HeaderDatePicker';
import FooterTaskInput from '@/components/FooterTaskInput';
import TaskListItems from '@/components/TaskListItems';
import modalTask from '@/utils/modal/modalTask';
import { useUser } from '@clerk/clerk-expo';

const dummyTasks: modalTask[] = [{
    title: 'Complete project report',
    date: new Date(),
    completed: false,
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