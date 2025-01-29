import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import WeekDaysPicker from '@/components/WeekDaysPicker';

interface HabitProps {
    title: string,
    weekDates: number[],
    referenceLink: string | null
}

interface TaskProps {
    title: string,
    dueDay_count_from_start: number,
    reference: string | null
}

const GroupOverview = () => {
    const params = useLocalSearchParams();
    const data = params.data ? JSON.parse(params.data as string) : { goal: '', habits: [], tasks: [] };

    // Use separate state for goal, habits, and tasks
    const [goal, setGoal] = useState<string>(data.goal);
    const [habits, setHabits] = useState<HabitProps[]>(data.habits);
    const [tasks, setTasks] = useState<TaskProps[]>(data.tasks);

    const renderHabit = (habit: HabitProps, index: number) => {
        return (
            <View style={styles.habitContainer} key={`habit-${index}`}>
                {/* habit title */}
                <Text style={styles.itemText}>{habit.title}</Text>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {habit.referenceLink ? (
                        <TouchableOpacity onPress={() => habit.referenceLink && Linking.openURL(habit.referenceLink)}>
                            <Text style={styles.linkText}>Reference</Text>
                        </TouchableOpacity>
                    ) : (<Text style={styles.linkText}>No Reference</Text>)}


                    {/* Weekdays */}
                    <WeekDaysPicker habitObj={habit} onDayChange={(newHabit) => {
                        const updatedHabits = [...habits];
                        updatedHabits[index] = newHabit;
                        setHabits(updatedHabits);
                    }} />
                </View>
            </View>
        );
    };

    const renderTask = (task: TaskProps, index: number) => {
        return (
            <View style={styles.itemContainer} key={`task-${index}`}>
                <Text style={styles.itemText}>{task.title}</Text>
                {task.reference && (
                    <TouchableOpacity onPress={() => task.reference && Linking.openURL(task.reference)}>
                        <Text style={styles.linkText}>Reference</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.goalTitle}>{goal}</Text>

            <Text style={styles.sectionTitle}>Habits</Text>
            {habits.map(renderHabit)}

            <Text style={styles.sectionTitle}>Tasks</Text>
            {tasks.map(renderTask)}

            <View style={{ height: 90 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
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
    weekContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    weekDay: {
        fontSize: 14,
        borderRadius: 4,
        textAlign: 'center',
        width: 25,
        height: 20,
    },
    selectedDay: {
        backgroundColor: '#D1C4E9',
        color: '#673AB7',
        fontWeight: 'bold',
    },
    unselectedDay: {
        backgroundColor: '#E0E0E0',
        color: '#757575',
    },
});

export default GroupOverview;
