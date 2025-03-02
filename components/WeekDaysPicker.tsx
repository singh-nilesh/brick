import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Habit } from '../utils/customTypes';


interface WeekDaysPickerProps {
    habitObj: Habit ;
    onDayChange: (newWeekDays: number[]) => void;
}

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const WeekDaysPicker = ({ habitObj, onDayChange }: WeekDaysPickerProps) => {

    // Handle the day change
    const handleDayChange = (day: number) => {
        const updatedWeekDates = habitObj.byWeekDay.includes(day)
            ? habitObj.byWeekDay.filter((d) => d !== day) // Remove the selected day
            : [...habitObj.byWeekDay, day]; // Add the selected day

        // Sort the updated week dates
        updatedWeekDates.sort((a, b) => a - b);
        
        onDayChange(updatedWeekDates);
    };

    return (
        <View style={styles.weekContainer}>
            {daysOfWeek.map((day, idx) => (
                <TouchableOpacity
                    key={idx} // Fixed key placement issue
                    onPress={() => handleDayChange(idx)}
                >
                    <Text
                        style={[
                            styles.weekDay,
                            habitObj.byWeekDay.includes(idx) ? styles.selectedDay : styles.unselectedDay,
                        ]}
                    >
                        {day}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default WeekDaysPicker;

const styles = StyleSheet.create({
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
