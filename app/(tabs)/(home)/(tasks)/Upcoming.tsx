import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import HorizontalDatePicker from '../../../../components/HorizontalDatePicker'
import HeaderDatePicker from '../../../../components/HeaderDatePicker';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import TaskListItems from '../../../../components/TaskListItems';
import { Task } from '../../../../utils/customTypes';
import EditTaskBottomSheet from '../../../../components/EditTaskBottomSheet';
import { getTasksForDate, updateTask } from '../../../../utils/taskService';
import { markDeleted } from '../../../../utils/todoService';


const Upcoming = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [tasks, setTasks] = useState<Task[]>([]);
    const db = useSQLiteContext();
    const [refreshDB, setRefreshDB] = useState(false);

    const [showTaskBottomSheet, setShowTaskBottomSheet] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const fetchTodos = async () => {
        const task_list = (await getTasksForDate(db, selectedDate)) as Task[];
        setTasks(task_list);
    };

    // Hook to fetch todos from the database
    useFocusEffect(
        useCallback(() => {
            fetchTodos();
        }, [db, refreshDB, selectedDate])
    );

    // Function to delete a todo
    const DeleteTask = async (id: number) => {
        // setTodos((currentTodo) => currentTodo.filter((_, i) => i !== index));
        await markDeleted(db, id);
        setRefreshDB(!refreshDB);
    };

    // Open Task details
    const openModal = (item: Task) => {
        setSelectedTask(item);
        setShowTaskBottomSheet(true);
    };

    //close Task details
    const closeModal = () => {
        setShowTaskBottomSheet(false);
        setSelectedTask(null);
    }

    // Update Task
    const handelUpdateTask = async (oldTask: Task, newTask: Task) => {
        if (!oldTask || !newTask) return;
        closeModal();
        await updateTask(db, oldTask, newTask);
        setRefreshDB(!refreshDB);
    }

    return (
        <View style={styles.container}>

            <HeaderDatePicker
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />
            <HorizontalDatePicker
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />

            <FlatList
                scrollEnabled={true}
                style={styles.taskView}
                data={tasks}
                contentContainerStyle={{ gap: 7 }}
                keyExtractor={(item) => (item.id.toString() + item.habit?.id.toString())}

                renderItem={({ item }) =>
                    <TaskListItems
                        db={db}
                        item={item}
                        setTasks={setTasks}
                        onDelete={() => DeleteTask(item.id)}
                        onTaskPress={() => openModal(item)}
                    />
                }
                ListFooterComponent={<View style={{ height: 100 }} />}

                refreshControl={
                    <RefreshControl refreshing={false} onRefresh={() => setRefreshDB(!refreshDB)} />
                }
            />

            <EditTaskBottomSheet
                task={selectedTask}
                visible={showTaskBottomSheet}
                onClose={closeModal}
                onSave={(updatedTask) => selectedTask && handelUpdateTask(selectedTask, updatedTask)}
            />
        </View>
    )
}

export default Upcoming

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#white',
    },
    taskView: {
        flex: 1,
        backgroundColor: 'white',
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    taskTitle: {
        fontFamily: 'InterSemi',
        fontSize: 18,
        color: 'dimgray',
        flex: 1,
    },
});