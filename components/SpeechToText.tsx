import { View, Text, Button, Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import Voice from '@react-native-community/voice'

interface SpeechToTextProps {
    visible: boolean;
    closeModal: () => void;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ visible, closeModal }) => {

    const [isListening, setIsListening] = React.useState(false)
    const [recognizedText, setRecognizedText] = React.useState('')

    const startRecognition = async () => {
        try {
            await Voice.start('en-US')
            setIsListening(true)
            setRecognizedText('')
        }
        catch (e) {
            console.error("Error starting speech recognition:", e)
        }
    }

    const stopRecognition = async () => {
        try {
            await Voice.stop()
            setIsListening(false)
        }
        catch (e) {
            console.error("Error stopping speech recognition:", e)
        }
    }

    Voice.onSpeechResults = (event) => {
        const { value } = event
        if (value) {
            setRecognizedText(value[0])
            stopRecognition()
        }
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={closeModal}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Speech to Text</Text>
                    
                    <Button
                        title={isListening ? 'Listening...' : 'Start Listening'}
                        onPress={isListening ? stopRecognition : startRecognition}
                    />

                    <Text style={{ marginTop: 20, fontSize: 18, textAlign: 'center' }}>{recognizedText}</Text>

                    <TouchableOpacity onPress={closeModal} style={{ marginTop: 20, backgroundColor: 'red', padding: 10, borderRadius: 5 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

export default SpeechToText
