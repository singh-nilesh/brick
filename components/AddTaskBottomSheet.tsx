import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { Task, Group } from '../utils/customTypes';
import ReferenceLinks from './ReferenceLinks';
import CalendarDatePicker from './CalenderDatePicker';
import { format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';


interface AddTaskBottomSheetProps {
    groups: Group[];
    visible: boolean;
    onClose: () => void;
    onSave: (updatedTask: Task) => void;
}

const AddTaskBottomSheet: React.FC<AddTaskBottomSheetProps> = ({ groups, visible, onClose, onSave }) => {

    const emptyTask: Task = {
        id: 0,
        title: '',
        description: '',
        status: false,
        priority: 5,
        createdAt: new Date(),
        dueAt: new Date(),
        group: null,
        habit: null,
        references: [],
        comment: '',
        isDeleted: false
    };
    const [newTask, setNewTask] = useState<Task>(emptyTask);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showAddLinkModal, setShowAddLinkModal] = useState(false);
    const [newLink, setNewLink] = useState({ id: null, name: '', url: '' });

    const handleSave = () => {
        if(newTask.title.trim() === ''){
            alert('Please enter a title');
        } else {
        onSave(newTask);
        setNewTask(emptyTask);
        }
    };

    const handleDateChange = (selectedDate: Date) => {
        setShowDatePicker(false);
        setNewTask((obj) => ({ ...obj, dueAt: selectedDate }));
    };

    const handleAddLink = () => {
        if (newLink.name.trim() && newLink.url.trim()) {
            setNewTask((obj) => ({
                ...obj,
                references: [...obj.references, newLink],
            }));
            setNewLink({ id: null, name: '', url: '' });
            setShowAddLinkModal(false);
        }
    };

    const handelRemoveLink = (id: number | null, name: string) => {
        if (id) {
            setNewTask((obj) => ({
                ...obj,
                references: obj.references.filter((link) => link.id != id)
            }));
        }
        else {
            setNewTask((obj) => ({
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
                    <MaterialIcons name='close' size={35} style={styles.closeIcon} onPress={() => {
                        onClose();
                        setNewTask(emptyTask);
                    }} />


                    {/* Group Selection */}
                    <Text style={styles.subHeader}>Group:</Text>
                    <ScrollView horizontal style={styles.groupContainer}>
                        {groups.map((grp) => (
                            <TouchableOpacity
                                key={grp.id}
                                style={[
                                    styles.groupButton,
                                    {
                                        backgroundColor: grp.bgColor,
                                        borderColor: newTask.group?.id === grp.id ? 'black' : grp.bgColor,
                                        borderWidth: newTask.group?.id === grp.id ? 2 : 0,
                                        borderRadius: newTask.group?.id === grp.id ? 5 : 15,
                                    },
                                ]}
                                onPress={() => {
                                    const grpData = {
                                        id: grp.id,
                                        title: grp.title,
                                        bgColor: grp.bgColor,
                                        textColor: grp.textColor
                                    };
                                    setNewTask((obj) => ({
                                        ...obj,
                                        group: grpData
                                    }));
                                }}
                            >
                                <Text style={{ color: grp.textColor, fontWeight: 'bold' }}>
                                    {grp.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Task Header */}
                    <TextInput
                        style={styles.Header}
                        value={newTask.title}
                        onChangeText={(text) => setNewTask((obj) => ({ ...obj, title: text }))}
                        placeholder="Task title"
                    />

                    {/* Due Date */}
                    <View style={styles.rowContainer}>
                        <Text style={styles.tag}>Due date:</Text>
                        <>
                            <Text style={[styles.tag, styles.standardTag]}>
                                {newTask.dueAt ? format(newTask.dueAt, 'dd MMM') : 'Select date'}
                            </Text>
                            <Feather
                                name="calendar"
                                size={20} style={{ marginLeft: 10 }}
                                color="black"
                                onPress={() => setShowDatePicker(true)}
                            />
                        </>
                    </View>

                    {/* Priority Selection */}
                    <Text style={styles.subHeader}>Set Priority:</Text>
                    <View style={styles.priorityContainer}>
                        {[1, 2, 3, 4, 5].map((priority) => (
                            <TouchableOpacity
                                key={priority}
                                style={[
                                    styles.priorityButton,
                                    {
                                        backgroundColor: newTask.priority === priority ? 'black' : '#f0f0f0',
                                    },
                                ]}
                                onPress={() => setNewTask((obj) => ({ ...obj, priority }))}
                            >
                                <Text
                                    style={{
                                        color: newTask.priority === priority ? 'white' : 'black',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {priority}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Description */}
                    <Text style={styles.subHeader}>Description:</Text>
                    <TextInput
                        style={styles.input}
                        value={newTask.description || ''}
                        onChangeText={(text) => setNewTask((obj) => ({ ...obj, description: text }))}
                        placeholder="Add a description"
                        multiline
                    />

                    {/* Comment */}
                    <Text style={styles.subHeader}>Comment:</Text>

                    <TextInput
                        style={styles.input}
                        value={newTask.comment || ''}
                        onChangeText={(text) => setNewTask((obj) => ({ ...obj, comment: text }))}
                        placeholder="Add a comment"
                        multiline
                    />

                    {/* Reference Links */}
                    <View style={styles.rowContainer}>
                        <Text style={styles.subHeader}>Reference Links:</Text>

                        <MaterialIcons
                            name="add-link"
                            size={25} style={{ marginLeft: 10, paddingTop: 15 }}
                            color="grey"
                            onPress={() => setShowAddLinkModal(true)}
                        />
                    </View>
                    <ReferenceLinks links={newTask.references} isEditing={true} onRemove={(id, name) => handelRemoveLink(id, name)} />

                    {/* Save Button */}
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
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
                    <TouchableOpacity style={styles.touchableArea} onPress={() => {
                        onClose();
                    }} />


                    {/* Task Details */}
                    {renderItem()}

                    {/* Date Picker */}
                    {showDatePicker && (
                        <CalendarDatePicker selectedDate={newTask.dueAt || new Date()} setSelectedDate={handleDateChange} />
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

export default AddTaskBottomSheet;

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
        height: '80%',
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
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 25,
        borderBottomWidth: 1,

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
    closeIcon: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1,
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
    groupContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    groupButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        margin: 5,
    },
    priorityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    priorityButton: {
        padding: 10,
        borderRadius: 5,
        width: '18%',
        alignItems: 'center',
    },

});
