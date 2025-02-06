import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import React from 'react';

interface JsonInputProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (value: any) => void; // Ensure this receives parsed JSON
}

export default function JsonInput({ isVisible, onClose, onSave }: JsonInputProps) {
    const [jsonText, setJsonText] = React.useState('');

    const handleOnClose = () => {
        setJsonText('');
        onClose(); // Ensure modal closes properly
    };

    const handleSave = () => {
        try {
            const parsedJson = JSON.parse(jsonText); // Ensure it's valid JSON
            onSave(parsedJson);
            handleOnClose();
        } catch (error) {
            Alert.alert('Invalid JSON', 'Please enter a valid JSON format.');
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={handleOnClose} // Handle back button press
        >
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleOnClose}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Enter JSON</Text>
                    <TextInput
                        style={styles.input}
                        value={jsonText}
                        onChangeText={setJsonText}
                        placeholder="Enter JSON text here"
                        multiline
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSave}>
                        <Text style={styles.buttonText}>Generate Roadmap</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
        width: '90%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        height: 130,
        width: '100%',
        borderWidth: 1,
        borderColor: 'black',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        minHeight: 80,
    },
    button: {
        backgroundColor: 'black',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});
