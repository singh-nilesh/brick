import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import FeatherIcon from '@expo/vector-icons/Feather';

interface CalendarDatePickerProps {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
}

const CalendarDatePicker = ({ selectedDate, setSelectedDate }: CalendarDatePickerProps) => {
    const [showPicker, setShowPicker] = useState(false);

    const togglePicker = () => setShowPicker(prev => !prev);

    const handleDayPress = (day: { dateString: string }) => {
        setSelectedDate(new Date(day.dateString));
        setShowPicker(false);
    };

    return (
        <View>
            <TouchableOpacity style={styles.dateView} onPress={togglePicker}>
                <FeatherIcon name="calendar" size={24} color="#000" />
                <Text style={styles.dateText}>{format(selectedDate, 'MMMM dd, yyyy')}</Text>
            </TouchableOpacity>

            <Modal visible={showPicker} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.calendarContainer}>
                        <Calendar
                            onDayPress={handleDayPress}
                            markedDates={{
                                [format(selectedDate, 'yyyy-MM-dd')]: {
                                    selected: true,
                                    selectedColor: 'blue',
                                },
                            }}
                        />
                        <TouchableOpacity style={styles.closeButton} onPress={togglePicker}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CalendarDatePicker;

const styles = StyleSheet.create({
    dateView: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#000',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        alignItems: 'center',
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,
    },
    closeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
