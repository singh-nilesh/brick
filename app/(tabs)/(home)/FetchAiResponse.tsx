import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface FetchAiResponseProps {
    isVisible: boolean;
    onClose: () => void;
}

const FetchAiResponse = ({ isVisible, onClose }: FetchAiResponseProps) => {
    const [goal, setGoal] = useState('');
    const [habitCount, setHabitsCount] = useState(2);
    const [tasksCount, setTasksCount] = useState(7);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // init your Gemini Api
    const geminiApiKey = process.env.GEMINI_API_KEY!;
    console.log("api -->",geminiApiKey);

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    var promptText = `
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
        - Optionally include a reference link.
        
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
                reference: null,
                },
            ],
            }  
        `;
    if (isRegenerating) {
        promptText = promptText + ` Regenerate an improved output, make it more structured and detailed.`;
    }

    // Function to send user message to Gemini
    const fetchResponse = async () => {
        if (!goal) {
            Alert.alert('Error', 'Please enter your goal.');
            return;
        }

        setIsLoading(true);
        try {
            // call Gemini Api to get a response
            const result = await model.generateContent(promptText);
            const response = JSON.parse(result.response.text());
            console.log(response);      

        } catch {
            Alert.alert('Error', 'Failed to generate a plan. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.modal}>
            {/* Back Button */}
            <AntDesign
                name="leftcircleo"
                size={30}
                color="black"
                style={styles.backButton}
                onPress={() => router.back()}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Generate AI-Powered Plan</Text>
                <Text style={styles.subtitle}>
                    Enter your goal below, specify the number of habits and tasks,
                    and let AI generate a structured plan for you!
                </Text>

                {/* Goal Input */}
                <Text style={styles.label}>Your Goal</Text>
                <TextInput
                    style={styles.input}
                    value={goal}
                    onChangeText={setGoal}
                    placeholder="e.g., Learn Python"
                    placeholderTextColor="#888"
                />

                {/* Habits Input */}
                <Text style={styles.label}>Number of Weekly Habits</Text>
                <TextInput
                    style={styles.input}
                    value={habitCount.toString()}
                    inputMode='numeric'
                    keyboardType="numeric"
                    onChangeText={(text) => setHabitsCount(text ? parseInt(text) || 0 : 0)}
                    placeholder="e.g., 3"
                    placeholderTextColor="#888"
                />

                {/* Tasks Input */}
                <Text style={styles.label}>Number of One-time Tasks</Text>
                <TextInput
                    style={styles.input}
                    value={tasksCount.toString()}
                    inputMode='numeric'
                    keyboardType="numeric"
                    onChangeText={(text) => setTasksCount(text ? parseInt(text) || 0 : 0)}
                    placeholder="e.g., 5"
                    placeholderTextColor="#888"
                />

                {/* Generate Button */}
                <TouchableOpacity style={styles.generateButton} onPress={fetchResponse}>
                    <Text style={styles.buttonText}>Generate Plan</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default FetchAiResponse;

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        paddingVertical: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    label: {
        alignSelf: 'flex-start',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        color: '#444',
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#CCC',
        backgroundColor: '#FFF',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    generateButton: {
        width: '100%',
        backgroundColor: 'black',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
    },
});
