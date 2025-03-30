import { View, StyleSheet, TextInput } from 'react-native'
import React, { useState } from 'react'
import Feather from '@expo/vector-icons/Feather';


interface FooterTaskInputProps {
    onAdd: (newTodo: string) => void;
}

const FooterTaskInput = ({ onAdd }: FooterTaskInputProps) => {

    const [newTask, setNewTask] = useState<string>('');
    return (
        <View style={styles.taskContainer}>
            <Feather
                name={'circle'}
                size={24}
                paddingHorizontal={10}
                color="gray"
            />

            <TextInput
                value={newTask}
                onChangeText={setNewTask}
                style={styles.input}
                placeholder="Todo ..."

                onEndEditing={() => {
                    if (newTask.length > 0) {
                        setNewTask('');
                        onAdd(newTask);
                    }
                }}
            />
        </View>
    )
}

export default FooterTaskInput

const styles = StyleSheet.create({

    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        paddingBottom: 10,
    },
    input: {
        fontFamily: 'InterSemi',
        fontSize: 18,
        color: 'grey',
        flex: 1,
    }
});