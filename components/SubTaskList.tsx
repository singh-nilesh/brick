import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { Todo } from '@/utils/customTypes'
import { addSubtask, updateSubtask } from '@/utils/todoService';
import FooterTaskInput from './FooterTaskInput';
import TodoListItems from './TodoListItems';
import { SQLiteDatabase } from 'expo-sqlite';
import { MaterialIcons } from '@expo/vector-icons';

interface SubTaskListProps {
    task_id: number
    subtasks: Todo[]
    db: SQLiteDatabase
    isEditing: boolean
    onAdd: (newTodo: string) => void
    onEdit?: (newTask: string, item: Todo) => void
    onMarkDone: (item:Todo) => void
    onDelete: (item:Todo) => void
}

const SubTaskList = ({ subtasks, isEditing,onDelete, onEdit, onMarkDone, onAdd, db }: SubTaskListProps) => {
    
    return (
        <View>
            {subtasks.map((item) => (
                <View
                    style={[styles.taskView, isEditing ?
                        { borderBottomWidth: 1, borderColor: "#f0f0f0" }: {}]}
                    key={item.id}>
                    <TodoListItems
                        isSubtask={true}
                        key={item.id}
                        db={db}
                        item={item}
                        markDone={(item) => onMarkDone(item)}
                        //onEdit={(newTitle, item) => onEdit(newTitle, item)}
                    />
                    {isEditing && (
                        <MaterialIcons
                        style={{ paddingTop: 5 }}
                            name="remove-circle-outline"
                            size={25}
                            color="red"
                            onPress={() => onDelete(item)}
                        />
                    )}

                </View>
            ))}
            <FooterTaskInput onAdd={(newTodo: string) => onAdd(newTodo)} />
        </View>
    );
}

export default SubTaskList

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    taskView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
})