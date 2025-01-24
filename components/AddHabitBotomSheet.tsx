import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Group, Habit } from '@/utils/customTypes';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface AddHabitBottomSheetProps {
    groups: Group[];
    visible: boolean;
    onClose: () => void;
    onSave: (habit: any) => void;
}

const AddHabitBottomSheet: React.FC<AddHabitBottomSheetProps> = ({ groups, visible, onClose, onSave}) => {

    const HabitInit:Habit = {
        title: '',
        groupId: null,
        interval: 1,
        byWeekDay: [] as number[],
        dtStart: new Date(),
        dtEnd: new Date(),
        id: 0,
        createdAt: new Date()
    }
    const [newHabit, setNewHabit] = useState<Habit>(HabitInit);

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const handleSave = () => {
        if (!newHabit.title.trim()) {
            alert('Title is required');
            return;
        }
        else if (!newHabit.groupId) {
            alert('Group is required');
            return;
        }
        else if (newHabit.byWeekDay.length === 0) {
            alert('Select at least one day of the week');
            return;
        }
        
        onSave(newHabit);
    };

    const handleDayToggle = (day: number) => {
        setNewHabit((prev) => ({
            ...prev,
            byWeekDay: prev.byWeekDay.includes(day)
                ? prev.byWeekDay.filter((d) => d !== day)
                : [...prev.byWeekDay, day],
        }));
    };

    const handleDateChange = (dateType: 'dtStart' | 'dtEnd', selectedDate: Date | undefined) => {
        if (selectedDate) {
            setNewHabit((prev) => ({
                ...prev,
                [dateType]: selectedDate,
            }));
        }
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
    };

    const renderHabits = () => {
        return (
            <View style={styles.modalView}>
                <Text style={styles.header}>Add New Habit</Text>

                {/* Habit Title */}
                <TextInput
                    style={styles.input}
                    placeholder="Habit Title"
                    value={newHabit.title}
                    onChangeText={(text) => setNewHabit((prev) => ({ ...prev, title: text }))}
                />

                {/* Group Selection */}
                <Text style={styles.label}>Group:</Text>
                <ScrollView horizontal style={styles.hs_Container}>
                    {groups.map((group) => (
                        <TouchableOpacity
                            key={group.id}
                            style={[
                                styles.hs_Button,
                                group.id === newHabit.groupId && styles.hs_selectedButton,
                            ]}
                            onPress={() => setNewHabit((prev) => ({ ...prev, groupId: group.id }))}
                        >
                            <Text style={styles.hs_ButtonText}>{group.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Interval */}
                <Text style={styles.label}>Interval:</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Interval (1 or higher)"
                    value={newHabit.interval ? newHabit.interval.toString() : ''}
                    onChangeText={(text) =>
                        setNewHabit((prev) => ({ ...prev, interval: parseInt(text)}))
                    }
                />

                {/* Select Days of the Week */}
                <Text style={styles.label}>Days of the Week:</Text>
                <View style={styles.hs_Container}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(
                        (day, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.hs_Button,
                                newHabit.byWeekDay.includes(index) && styles.hs_selectedButton,
                                ]}
                                onPress={() => handleDayToggle(index)}
                            >
                                <Text
                                    style={[
                                        styles.hs_ButtonText,
                                        newHabit.byWeekDay.includes(index) && styles.hs_selectedButton,
                                    ]}
                                >
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>

                {/* Start Date */}
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartDatePicker(true)}
                >
                    <Text style={styles.dateButtonText}>
                        Start Date: {format(newHabit.dtStart, 'dd MMM yyyy')}
                    </Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                    <DateTimePicker
                        value={newHabit.dtStart}
                        mode="date"
                        display="default"
                        onChange={(event, date) => handleDateChange('dtStart', date)}
                    />
                )}

                {/* End Date */}
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
                    <Text style={styles.dateButtonText}>
                        End Date: {format(newHabit.dtEnd, 'dd MMM yyyy')}
                    </Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                    <DateTimePicker
                        value={newHabit.dtEnd}
                        mode="date"
                        display="default"
                        onChange={(event, date) => handleDateChange('dtEnd', date)}
                    />
                )}

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <SafeAreaView>
            <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
                <KeyboardAvoidingView
                    style={styles.backdrop}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <TouchableOpacity style={styles.touchableArea} onPress={() => {
                        onClose();
                        setNewHabit(HabitInit);
                    }} />
                    
                    {renderHabits()}

                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

export default AddHabitBottomSheet;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    touchableArea: {
        flex: 1,
    },
    modalView: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '75%',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    hs_Container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    hs_Button: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 7,
        margin: 5,
    },
    hs_selectedButton: {
        backgroundColor: '#ddd',
    },
    hs_ButtonText: {
        fontSize: 14,
    },
    dateButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
    },
    dateButtonText: {
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
