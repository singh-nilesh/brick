import { View, Text, SectionList, StyleSheet } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { Task } from '@/utils/customTypes';
import TaskListItems from '@/components/TaskListItems';
import TaskBottomSheet from '@/components/TaskBottomSheet';
import { useSQLiteContext } from 'expo-sqlite';
import { getTasksForDate, markDeleted } from '@/utils/taskService';
import { useFocusEffect } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';


const Today = () => {
  const { user } = useUser();
  const db = useSQLiteContext();
  const [todos, setTodos] = useState<Task[]>([]);
  const [refreshDB, setRefreshDB] = useState(false);

  const [showTaskBottomSheet, setShowTaskBottomSheet] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTodos = async () => {
    const todo_list = (await getTasksForDate(db, new Date())) as Task[];
    setTodos(todo_list);
  };


  // Hook to fetch todos from the database
  useFocusEffect(
    useCallback(() => {
      fetchTodos();
    }, [db, refreshDB])
  );


  // Function to delete a todo
  const DeleteTask = async (id: number) => {
    await markDeleted(db, id);
    setRefreshDB(!refreshDB);
  };


  // Organize data for SectionList
  const sections = [
    {
      title: 'Assigned Tasks',
      data: todos.filter((task) => !task.status), // Tasks that are not completed
    },
    {
      title: 'Completed Tasks',
      data: todos.filter((task) => task.status), // Tasks that are completed
    },
  ];

  // Open Task
  const openModal = (item: Task) => {
    setSelectedTask(item);
    setShowTaskBottomSheet(true);
  };

  //close Task
  const closeModal = () => {
    setShowTaskBottomSheet(false);
    setSelectedTask(null);
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TaskListItems
            db={db}
            item={item}
            setTasks={setTodos}
            onDelete={() => DeleteTask(item.id)}
            onTaskPress={() => openModal(item)}
          />
        )}

        contentContainerStyle={{ gap: 7 }}

        renderSectionFooter={({ section }) =>
          section.title === 'Assigned Tasks' && section.data.length === 0 ? (
            <View style={{ alignItems: 'center', height: 100, justifyContent: 'center' }}>
              <Text >No tasks for today</Text>
            </View>
          ) : (
            <View style={{ height: 50 }} />
          )
        }
      />
      <TaskBottomSheet
        task={selectedTask}
        visible={showTaskBottomSheet}
        onClose={closeModal} />

    </View>
  );
};

export default Today;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: 'whitesmoke',
  },
  taskView: {
    flexDirection: 'column',
    backgroundColor: 'transparent',
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
  addIcon: {
    position: 'absolute',
    bottom: 180,
    right: 30,
  },
});
