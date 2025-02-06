import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, ToastAndroid } from 'react-native';
import WeekDaysPicker from '@/components/WeekDaysPicker';
import { Habit, Group, Task } from '@/utils/customTypes';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useSQLiteContext } from 'expo-sqlite';
import { addGroup } from '@/utils/taskService';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';


interface HabitProps {
    title: string;
    weekDates: number[];
    referenceLink: string | null;
}

interface TaskProps {
    title: string;
    dueDay_count_from_start: number;
    reference: string | null;
}

const GroupOverview = () => {

    const db = useSQLiteContext();
    const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);


    // Get JSON data from previous screen
    const params = useLocalSearchParams();
    var data = { goal: '', habits: [], tasks: [] };
    try {
        data = params.data ? JSON.parse(params.data as string) : { goal: '', habits: [] as HabitProps[], tasks: [] as TaskProps[] };
    }
    catch (error) {
        alert('Invalid JSON data');
    }

    // Map data to Group, Habit, and Tasks objects
    const mappedGroup: Group = {
        id: 0,
        title: 'New Roadmap',
        description: data.goal,
        bgColor: '#D1F8EF',
        textColor: '#000000',
    };

    const mappedHabits: Habit[] = data.habits.map((habit: HabitProps, index: number) => ({
        id: index, // Unique identifier for rendering
        title: habit.title,
        groupId: 0,
        createdAt: new Date(),
        interval: 1,
        byWeekDay: habit.weekDates.sort((a, b) => a - b), // Ensure sorted order
        dtStart: new Date(),
        dtEnd: new Date(new Date().setDate(new Date().getDate() + 30)), // Assuming a default duration
        referenceLink: habit.referenceLink?.toString() || null,
    }));

    const mappedTasks: Task[] = data.tasks.map((task: TaskProps, index: number) => ({
        id: index,
        groupId: 0,
        title: task.title,
        status: false,
        createdAt: new Date(),
        completedAt: null,
        dueAt: new Date(new Date().setDate(new Date().getDate() + task.dueDay_count_from_start)), // Fix access issue
        isDeleted: false,
        deletedAt: null,
        group: null,
        habit: null,
        references: task.reference ? [{ id: 0, name: 'init reference', url: task.reference }] : [],
        priority: 5, // Default priority value
    }));


    // Use separate state for goal, habits, and tasks
    const [group, setGroup] = useState<Group>(mappedGroup);
    const [habits, setHabits] = useState<Habit[]>(mappedHabits);
    const [tasks, setTasks] = useState<Task[]>(mappedTasks);


    // Handle habit change
    const handleHabitChange = (index: number, newWeekDays: number[]) => {
        const updatedHabits = habits.map((habit, i) =>
            i === index ? { ...habit, byWeekDay: newWeekDays.sort((a, b) => a - b) } : habit
        );
        setHabits(updatedHabits);
    };

    // function to save the group, habits, and tasks to the database
    const handelOnSave = async () => {
        await addGroup(db, group, habits, tasks);
        router.back();
    };

    // Handle opening the date picker
    const openDatePicker = (index: number) => {
        setSelectedTaskIndex(index);
        setShowDatePicker(true);
    };

    // Handle Due Date change
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate && selectedTaskIndex !== null) {
            setTasks((prevTasks) =>
                prevTasks.map((task, i) =>
                    i === selectedTaskIndex ? { ...task, dueAt: selectedDate } : task
                )
            );
        }
        setSelectedTaskIndex(null);
    };


    // Render habit component
    const renderHabit = (habit: Habit, index: number) => (
        <View style={styles.habitContainer} key={`habit-${index}`}>
            {/* Habit Title */}
            <Text style={styles.itemText}>{habit.title}</Text>

            <View style={{ flexDirection: 'row', gap: 8 }}>
                {habit.referenceLink ? (
                    <TouchableOpacity onPress={() => habit.referenceLink && Linking.openURL(habit.referenceLink)}>
                        <Text style={styles.linkText}>Reference</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.linkText}></Text>
                )}

                {/* Weekdays Picker */}
                <WeekDaysPicker habitObj={habit} onDayChange={(newWeekDays) => handleHabitChange(index, newWeekDays)} />
            </View>
        </View>
    );

    // Render task component (Updated)
    const renderTask = (task: Task, index: number) => (
        <View style={styles.itemContainer} key={`task-${index}`}>
            <Text style={styles.itemText}>{task.title}</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {task.references.length > 0 ? (
                    <TouchableOpacity onPress={() => Linking.openURL(task.references[0].url)}>
                        <Text style={styles.linkText}>Reference</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.linkText}></Text>
                )}

                <TouchableOpacity onPress={() => openDatePicker(index)}>
                    <Text style={{ fontSize: 11, color: '#D2665A', fontWeight: 'bold' }}>
                        {task.dueAt ? format(new Date(task.dueAt), 'MMM dd') : 'No due date'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                {/* Back Button */}
                <AntDesign name="leftcircleo" size={30} color="black"
                    onPress={() => router.back()}
                />

                <TouchableOpacity style={{ backgroundColor: 'white' }}>
                    <Text style={[styles.buttons, { color: 'black' }]}>regenerate</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.container}>
                <Text style={styles.goalTitle}>{group.description}</Text>

                <Text style={styles.sectionTitle}>Habits</Text>
                {habits.map(renderHabit)}

                <Text style={styles.sectionTitle}>Tasks</Text>
                {tasks.map(renderTask)}

                <View style={{ height: 200 }} />
            </ScrollView>

            <View style={{ alignItems: 'center' }}>
                <TouchableOpacity style={styles.floatingButtons}
                    onPress={() => {
                        handelOnSave();
                        router.back();
                    }}>
                    <Text style={[styles.buttons, { color: 'white', fontSize: 23 }]}>Save</Text>
                </TouchableOpacity>
            </View>


            {/* Date Picker */}
            {showDatePicker && selectedTaskIndex !== null && (
                <DateTimePicker
                    value={tasks[selectedTaskIndex]?.dueAt || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        paddingHorizontal: 20,
        backgroundColor: 'white'
    },
    goalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginVertical: 12,
    },
    itemContainer: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        elevation: 1,
    },
    habitContainer: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        elevation: 1,
    },
    itemText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    linkText: {
        fontSize: 14,
        width: 120,
        color: '#007BFF',
        marginTop: 4,
    },

    floatingButtons: {
        position: 'absolute',
        bottom: 20,
        height: 50,
        width: '90%',
        backgroundColor: 'black',
        padding: 7,
        borderRadius: 10,
        elevation: 5
    },
    buttons: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 18
    }
});

export default GroupOverview;
