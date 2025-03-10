import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import React from 'react';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';

interface JsonGuideProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function JsonGuide({ isVisible, onClose }: JsonGuideProps) {

    const [goal, setGoal] = React.useState('');
    const [habitCount, setHabitsCount] = React.useState(2);
    const [tasksCount, setTasksCount] = React.useState(7);

    const manualText = `
User's Goal: ${goal}.
Generate:
1. goal: mentioned above. ie. ${goal}.
2. ${habitCount} habits that the user should follow weekly.
3. ${tasksCount} one-time tasks (milestones) to achieve the goal.

Habits:
- Include a title and which days of the week it should be followed (0-6).
- Optionally include a reference link.

Tasks:
- Include a title and the due date (as a day count from start).
- Optionally include a list of reference link.

Return the output as a JSON object.
note: use double-quotes for string values, "".
template:
{
  goal: "goal title",
  habits: [
    {
      title: "habit title",
      weekDates: [1, 3, 5],
      referenceLink: "https://realpython.com",
      },
],
    tasks: [
        {
        title: "task title",
        dueDay_count_from_start: 1,
        reference: [
        { "id": 1, "name": "Real Python", "url": "https://realpython.com" },
        { "id": 2, "name": "only Python", "url": "https://realpython.com" },
        ],
        },
    ],
    }  
`;

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(manualText);
        alert('User manual copied to clipboard!');
    };

    return (
        <Modal visible={isVisible} transparent animationType='slide' onRequestClose={onClose}>

            <View style={styles.backdrop}>

                <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />

                <View style={styles.modal}>
                    <Text style={styles.title}>How to use "Paste JSON"</Text>

                    <TextInput
                        style={styles.input}
                        value={goal}
                        onChangeText={setGoal}
                        placeholder="Enter your goal here"
                    />
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ padding: 10 }}> No.of Habits to add: </Text>

                        <TextInput
                            style={[styles.input, { width: 170 }]}
                            value={habitCount.toString()}
                            inputMode='numeric'
                            onChangeText={(text) => setHabitsCount(text ? parseInt(text) || 0 : 0)}
                            placeholder="Enter Number of Habits you want to add"
                        />
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ padding: 10 }}> No.of Tasks to add: </Text>

                        <TextInput
                            style={[styles.input, { width: 170 }]}
                            value={tasksCount.toString()}
                            inputMode='numeric'
                            onChangeText={(text) => setTasksCount(text ? parseInt(text) || 0 : 0)}
                            placeholder="Enter Number of Tasks you want to add"
                        />
                    </View>

                    <Text style={{ padding: 10 }}>
                        Copy the contents and Paste it, as prompt to any AI model of your liking, Chat gpt,
                        gemini, etc, then past the response in Paste JSON,
                        to generate your road-map, and get started on your journey.

                    </Text>

                    <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                        <Feather name="copy" size={24} color="white" />
                        <Text style={styles.buttonText}>Copy to Clipboard</Text>
                    </TouchableOpacity>

                    <ScrollView style={styles.textContainer}>
                        <Text style={{ paddingBottom: 30 }}>{manualText}</Text>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
        width: '95%',
        padding: 20,
        alignContent: 'center',
        alignSelf: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    textContainer: {
        height: 150,
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 8,
        marginBottom: 20,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 10,
    },
    input: {
        width: '100%',
        height: 45,
        borderWidth: 1,
        borderColor: '#CCC',
        backgroundColor: '#FFF',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 5,
    },
});
