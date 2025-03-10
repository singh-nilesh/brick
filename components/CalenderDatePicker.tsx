import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

interface CalendarDatePickerProps {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    visible: boolean;
    onClose: () => void;
}

const CalendarDatePicker = ({ selectedDate, setSelectedDate, visible, onClose }: CalendarDatePickerProps) => {
    const handleDayPress = (day: { dateString: string }) => {
        setSelectedDate(new Date(day.dateString));
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.calendarContainer}>
                    <Calendar
                        onDayPress={handleDayPress}
                        markedDates={{
                            [format(selectedDate, 'yyyy-MM-dd')]: {
                                selected: true,
                                selectedColor: '#000',
                            },
                        }}
                        enableSwipeMonths = {true}
                    />
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default CalendarDatePicker;

const styles = StyleSheet.create({
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
