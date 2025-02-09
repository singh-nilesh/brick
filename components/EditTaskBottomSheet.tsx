import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { Task } from '@/utils/customTypes';
import ReferenceLinks from './ReferenceLinks';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';


//import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Progress from 'react-native-progress';


interface EditTaskBottomSheetProps {
    task: Task | null;
    visible: boolean;
    onClose: () => void;
    onSave: (updatedTask: Task) => void;
}

const EditTaskBottomSheet: React.FC<EditTaskBottomSheetProps> = ({ task, visible, onClose, onSave }) => {
    if (!task) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState({ ...task });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showAddLinkModal, setShowAddLinkModal] = useState(false);
    const [newLink, setNewLink] = useState({ id: null, name: '', url: '' });

    const handleSave = () => {
        onSave(editedTask);
        setIsEditing(false);
    };

    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setEditedTask((obj) => ({ ...obj, dueAt: selectedDate }));
        }
    };

    const handleAddLink = () => {
        if (newLink.name.trim() && newLink.url.trim()) {
            setEditedTask((obj) => ({
                ...obj,
                references: [...obj.references, newLink],
            }));
            setNewLink({ id: null, name: '', url: '' });
            setShowAddLinkModal(false);
        }
    };

    const handelRemoveLink = (id:number | null, name:string) => {
        if(id){
            setEditedTask((obj) => ({
                ...obj,
                references: obj.references.filter((link) => link.id != id)
            }));
        }
        else {
            setEditedTask((obj) => ({
                ...obj,
                references: obj.references.filter((link) => link.name != name)
            }));
        }

    }

    const renderItem = () => {
        return (
            <View style={styles.modalView}>
                <ScrollView
                    showsVerticalScrollIndicator={true}
                    style={{ marginBottom: 20 }}
                >
                    {/* Group and Habit Badges */}
                    <View style={styles.badgeContainer}>
                        {editedTask.group && (
                            <Text style={[styles.tag, { backgroundColor: editedTask.group.bgColor }]}>{editedTask.group.title}</Text>
                        )}
                        {editedTask.habit ? (
                            <Text style={[styles.tag, { backgroundColor: '#F3D6FB' }]}>Habit {editedTask.habit.id}</Text>
                        ):(
                            <Text style={[styles.tag, { backgroundColor: '#F3D6FB' }]}>Task</Text>
                        )}
                    </View>

                    {/* Task Header */}
                    {isEditing ? (
                        <TextInput
                            style={styles.Header}
                            value={editedTask.title}
                            onChangeText={(text) => setEditedTask((obj) => ({ ...obj, title: text }))}
                            placeholder="Task title"
                        />
                    ) : (
                        <Text style={styles.Header}>{task.title}</Text>
                    )}

                    {/* Task Status */}
                    <View style={styles.rowContainer}>
                        <Text style={styles.tag}>Status:</Text>
                        <Text style={[styles.tag, styles.standardTag]}>
                            {editedTask.status ? 'Completed' : 'Pending'}
                        </Text>
                        {isEditing && (
                            <Feather
                                name={editedTask.status ? 'check-circle' : 'circle'}
                                size={20} style={{ marginLeft: 10 }}
                                color="black"
                                onPress={() => setEditedTask((obj) => ({ ...obj, status: !obj.status }))}
                            />
                        )}
                    </View>

                    {/* Due Date */}
                    <View style={styles.rowContainer}>
                        <Text style={styles.tag}>Due date:</Text>
                        {isEditing ? (
                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                <Text style={[styles.tag, styles.standardTag]}>
                                    {editedTask.dueAt ? format(editedTask.dueAt, 'dd MMM') : 'Select date'}
                                </Text>
                                <Feather
                                    name="calendar"
                                    size={20} style={{ marginLeft: 10 }}
                                    color="black"
                                />
                            </TouchableOpacity>
                        ) : (
                            <Text style={[styles.tag, styles.standardTag]}>
                                {task.dueAt ? format(task.dueAt, 'dd MMM') : 'No due date'}
                            </Text>
                        )}
                    </View>

                    {/* Description */}
                    <Text style={styles.subHeader}>Description:</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={editedTask.description || ''}
                            onChangeText={(text) => setEditedTask((obj) => ({ ...obj, description: text }))}
                            placeholder="Add a description"
                            multiline
                        />
                    ) : (
                        <Text style={styles.description}>{task.description || 'Add a description'}</Text>
                    )}

                    {/* Comment */}
                    <Text style={styles.subHeader}>Comment:</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={editedTask.comment || ''}
                            onChangeText={(text) => setEditedTask((obj) => ({ ...obj, comment: text }))}
                            placeholder="Add a comment"
                            multiline
                        />
                    ) : (
                        <Text style={styles.description}>{task.comment || 'Add a comment'}</Text>
                    )}

                    {/* Reference Links */}
                    <View style={styles.rowContainer}>
                        <Text style={styles.subHeader}>Reference Links:</Text>
                        {isEditing && (
                            <MaterialIcons
                                name="add-link"
                                size={25} style={{ marginLeft: 10, paddingTop: 15 }}
                                color="grey"
                                onPress={() => setShowAddLinkModal(true)}
                            />
                        )}
                    </View>
                    <ReferenceLinks links={editedTask.references} isEditing={isEditing} onRemove={(id, name) => handelRemoveLink(id, name)} />


                    {/* Progress */}
                    <View style={{ flexDirection: 'column', gap: 10 }}>
                        <Text style={styles.subHeader}>Aim Progress </Text>
                        <Text style={{ color: 'grey' }}>30% completed</Text>
                        <Progress.Bar progress={0.3} width={300} animated={true} color='grey' />
                    </View>

                    {/* Save Button */}
                    {isEditing ? (
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    ) : (
                        <Feather
                            name="edit"
                            size={25}
                            color="black"
                            style={styles.editIcon}
                            onPress={() => setIsEditing(true)}
                        />
                    )}
                </ScrollView>
            </View>
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
                <KeyboardAvoidingView
                    style={styles.backdrop}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <TouchableOpacity style={styles.touchableArea} onPress={onClose} />

                    {/* Task Details */}
                    {renderItem()}

                    {/* Date Picker */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={editedTask.dueAt || new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}

                    {/* Add Link Modal */}
                    {showAddLinkModal && (
                        <Modal transparent={true} animationType="fade" visible={showAddLinkModal}>
                            <View style={styles.linkModalBackdrop}>
                                <View style={styles.linkModal}>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Name"
                                        value={newLink.name}
                                        onChangeText={(text) => setNewLink((obj) => ({ ...obj, name: text }))}
                                    />
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="URL"
                                        value={newLink.url}
                                        onChangeText={(text) => setNewLink((obj) => ({ ...obj, url: text }))}
                                    />
                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={styles.modalButton}
                                            onPress={handleAddLink}
                                        >
                                            <Text style={styles.modalButtonText}>Done</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.modalButton}
                                            onPress={() => (
                                                setShowAddLinkModal(false),
                                                setNewLink({ id: null, name: '', url: '' })
                                            )}
                                        >
                                            <Text style={styles.modalButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    )}
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

export default EditTaskBottomSheet;

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
        height: '75%',
        padding: 20,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    tag: {
        fontSize: 14,
        fontWeight: '600',
        borderRadius: 5,
        padding: 5,
    },
    standardTag: {
        backgroundColor: '#ddd',
    },
    habitTag: {
        backgroundColor: '#F3D6FB',
        color: '#5B00A8',
    },
    Header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 25,
    },
    subHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: 'black',
        padding: 10,
        marginTop: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    editIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    linkModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkModal: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalInput: {
        width: '100%',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 5,
    },
    modalButtonText: {
        color: '#fff',
    },
});
