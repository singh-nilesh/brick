import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';
import axios from 'axios';

const FetchAiResponse = () => {
    const [goal, setGoal] = useState('');
    const [habitCount, setHabitsCount] = useState(2);
    const [tasksCount, setTasksCount] = useState(7);
    const [isLoading, setIsLoading] = useState(false);
    const [extraContent, setExtraContent] = useState('');

    const fetchResponse = async () => {
        if (!goal) {
            Alert.alert('Error', 'Please enter your goal.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post("https://brick-backend-production.up.railway.app/generate-plan", {
                goal,
                habitCount,
                tasksCount,
                extraContent
            });

            router.push({
                pathname: "/(tabs)/(home)/GroupOverview",
                params: { data: JSON.stringify(response.data) },
            });

        } catch (error) {
            console.error("API Error:", error);
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

                {/* Extra Content Input */}
                <Text style={styles.label}> Extra Context about yourself</Text>
                <TextInput
                    style={[styles.input, { height: 100 }]}
                    value={extraContent}
                    onChangeText={setExtraContent}
                    multiline={true}
                    maxLength={100}
                    placeholder="Optional, e.g., intermediate, student , etc."
                    placeholderTextColor="#888"
                />

                {/* Generate Button */}
                <TouchableOpacity
                    style={[styles.generateButton, isLoading && styles.disabledButton]}
                    onPress={fetchResponse}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Generate Plan</Text>
                    )}
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
    disabledButton: {
        backgroundColor: '#555', // Darker grey when disabled
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
