import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { format } from 'date-fns';
import FeatherIcon from '@expo/vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';


interface HeaderDatePickerProps {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
}


const HeaderDatePicker = ({ selectedDate, setSelectedDate }:HeaderDatePickerProps) => {
    const [showPicker, setShowPicker] = useState(false);

    const togglePicker = () => setShowPicker(prev => !prev);

    const handleDateChange = (event: any, date?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (date) setSelectedDate(date);
    };

    const formattedDate = format(selectedDate, 'MMMM dd, yyyy');

    return (
        <View>
            <TouchableOpacity style={styles.dateView} onPress={togglePicker}>
                <FeatherIcon name="calendar" size={24} color="#000" />
                <Text style={styles.dateText}>{formattedDate}</Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="calendar"
                    onChange={handleDateChange}
                />
            )}
        </View>
    );
};

export default HeaderDatePicker;

const styles = StyleSheet.create({
    dateView: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
    },
    dateText: {
        fontSize: 23,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#000',
    },
});
