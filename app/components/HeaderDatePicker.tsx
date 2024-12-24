import React from 'react';
import { View, Text, Button } from 'react-native';
//import DateTimePicker from '@react-native-community/datetimepicker';

interface HeaderDatePickerProps {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
}

const HeaderDatePicker: React.FC<HeaderDatePickerProps> = ({
    selectedDate,
    setSelectedDate,
}: HeaderDatePickerProps) => {
    const [showPicker, setShowPicker] = React.useState(false);

    return (
        <View className='flex-row justify-between items-center'>
            <Text className='text-xl font-bold'>{selectedDate.toDateString()}</Text>
        </View>
    );
}

export default HeaderDatePicker
