import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { Task, Todo } from '../utils/customTypes';
import ReferenceLinks from './ReferenceLinks';
import CalendarDatePicker from './CalenderDatePicker';
import { format, set } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import SubTaskList from './SubTaskList';
import { SQLiteDatabase } from 'expo-sqlite';
import { addSubtask, markAsDone, markAsNotDone } from '../utils/todoService';


interface EditTaskBottomSheetProps {

    db: SQLiteDatabase;
    task: Task | null;
    visible: boolean;
    onClose: (refreshDb: boolean) => void;
    onSave: (updatedTask: Task) => void;
}

const EditTaskBottomSheet: React.FC<EditTaskBottomSheetProps> = ({ task, visible, onClose, onSave, db }) => {
    if (!task) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState({ ...task });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showAddLinkModal, setShowAddLinkModal] = useState(false);
    const [newLink, setNewLink] = useState({ id: null, name: '', url: '' });
    const [refresh, setRefresh] = useState(false);

    const handleSave = () => {
        onSave(editedTask);
        setIsEditing(false);
    };

    const handleClose = () => {
        onClose(refresh);
        setIsEditing(false);
    }

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

    // function to remove a link, temporary until save
    const handelRemoveLink = (id: number | null, name: string) => {
        if (id) {
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

    // Subtask Handler
    const newTodoTemplate = {
        id: 0,
        title: '',
        status: false,
        task_id: editedTask.id,
        dueAt: null,
    };

    // remove a Subtask, temporary until save
    const handelRemoveSubtask = (item: Todo) => {
        setEditedTask((obj) => ({
            ...obj,
            subtasks: obj.subtasks.filter((subtask) => subtask.id != item.id)
        }));
    }

    // Function to add a new todo
    const handleAddTodo = async (newTodo: string) => {
        const newId = await addSubtask(db, editedTask.id, newTodo)
        if (newId !== -1) {
            setEditedTask(
                (obj) => ({
                    ...obj,
                    subtasks: [...obj.subtasks, { ...newTodoTemplate, id: newId, title: newTodo }]
                })
            )
        }
        setRefresh(true);
    };

    // mak sub task as done
    const handleIsDone = async (item: Todo) => {
        const newStatus = !item.status;
        if (newStatus) {
            await markAsDone(db, item.id, true);

        } else {
            await markAsNotDone(db, item.id, true);
        }

        setEditedTask(
            (obj) => ({
                ...obj,
                subtasks: obj.subtasks.map((subtask) => subtask.id === item.id ? {...subtask, status:newStatus} : subtask)
            })
        )
        setRefresh(true);
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
                            <Text style={[styles.tag, { backgroundColor: '#F3D6FB' }]}>Habit</Text>
                        ) : (
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
                            <TouchableOpacity onPress={() => setShowDatePicker(true)}
                                style={{ flexDirection: 'row', alignItems: 'center' }}>
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


                    {/* Subtask */}
                    <Text style={styles.subHeader}>Subtasks:</Text>
                    <View style={styles.subContainer}>
                        <SubTaskList
                            task_id={editedTask.id}
                            subtasks={editedTask.subtasks || []}
                            db={db}
                            isEditing={isEditing}
                            onAdd={(newTodo: string) => handleAddTodo(newTodo)}
                            //onEdit={(newTitle: string, item: Todo) => handelEditSubtask(item, newTitle)}
                            onDelete={(item: Todo) => handelRemoveSubtask(item)}
                            onMarkDone={(item: Todo) => handleIsDone(item)}
                        />
                    </View>


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
                        <Text style={{ color: 'darkgrey', fontSize: 13 }}>{task.comment || 'Add a comment'}</Text>
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
                    <View style={styles.subContainer}>
                        <ReferenceLinks links={editedTask.references} isEditing={isEditing} onRemove={(id, name) => handelRemoveLink(id, name)} />
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
                onRequestClose={handleClose}
            >
                <KeyboardAvoidingView
                    style={styles.backdrop}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <TouchableOpacity style={styles.touchableArea} onPress={handleClose} />

                    {/* Task Details */}
                    {renderItem()}

                    {/* Date Picker */
                        <CalendarDatePicker
                            selectedDate={editedTask.dueAt || new Date()}
                            visible={showDatePicker}
                            onClose={() => setShowDatePicker(false)}
                            setSelectedDate={(date) => setEditedTask((obj) => ({ ...obj, dueAt: date }))}
                        />}

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
        height: '85%',
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
    subContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
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
