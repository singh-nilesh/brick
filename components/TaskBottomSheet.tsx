import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Task } from '@/utils/customTypes';
import ReferenceLinks from './ReferenceLinks';
import { format } from 'date-fns';

interface TaskBottomSheetProps {
    task: Task | null;
    visible: boolean;
    onClose: () => void;
}

const TaskBottomSheet: React.FC<TaskBottomSheetProps> = ({ task, visible, onClose }) => {
    if (!task) return null;

    const Task_details = () => {
        return (
            <ScrollView style={{ margin: 20 }}>

                <MaterialCommunityIcons name="close" size={40} color="white" style={styles.close}
                    onPress={() => onClose()}
                />

                <View style={{ flexDirection: 'row', gap: 10, height: 30, margin:5 }}>
                    {task.group? <Text style={[styles.tag, styles.websiteTag]}>{task.group.title}</Text> : <></>}
                    {task.habit? <Text style={[styles.tag, styles.designTag]}>{task.habit.title}</Text> : <></>}
                </View>

                <View style={styles.container}>
                    {/* Title */}
                    <Text style={styles.Header}>{task.title}</Text>

                    {/* Status */}
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                        <Text style={styles.tag}>Status:</Text>
                        <Text style={[styles.tag, styles.standardTag]}>{task.status ? 'Completed' : "Pending"} </Text>
                    </View>


                    {/* Due Date */}
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                        <Text style={styles.tag}>Due date:</Text>
                        <Text style={[styles.tag, styles.standardTag]}>{task.dueAt ? format(task.dueAt, 'dd MMM') : 'No due date'} </Text>
                    </View>

                    {/* Description Label */}
                    <Text style={styles.subHeader}>Description:</Text>

                    {/* Description Content */}
                    <Text style={styles.description}>{task.description ? task.description: ' Add a description'}</Text>

                    {/* Comment Section */}
                    <Text style={styles.subHeader}>Comment:</Text>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Add a comment"
                        multiline
                    />

                    {/* Reference Links */}
                    <ReferenceLinks links={task.references} />
                </View>

            </ScrollView>
        )
    }

    return (
        <SafeAreaView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={styles.backdrop}>
                    <View style={styles.modalView}>

                        {/* Scrollable Task details */}
                        {Task_details()}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default TaskBottomSheet;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.6)"
    },
    modalView: {
        position: "absolute",
        height: "80%",
        width: "100%",
        backgroundColor: "black",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    close: {
        position: "absolute",
        top: -10,
        right: -10
    },

    tag: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        fontWeight: '600',
        fontSize: 14,
        textAlign: 'center',
    },
    standardTag: {
        backgroundColor: '#dddddd', // Light grey background
        color: 'black',              // Dark grey text color
    },
    websiteTag: {
        backgroundColor: '#F3D6FB', // Light pink background
        color: '#5B00A8',           // Purple text color
    },
    designTag: {
        backgroundColor: '#D5E9FA', // Light blue background
        color: '#1C3C87',           // Dark blue text color
    },


    container: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
    },
    Header: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
        marginTop: 5,
    },
    content_text: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: 'grey',
        marginBottom: 12,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        fontSize: 14,
    },
});