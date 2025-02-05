import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { format, isPast, isToday, set } from 'date-fns';
import { Group, Task } from '@/utils/customTypes';
import { getGroups, getTasksByGroup, updateTask } from '@/utils/taskService';
import { useSQLiteContext } from 'expo-sqlite';
import TaskBottomSheet from '@/components/EditTaskBottomSheet';
import { useFocusEffect } from 'expo-router';

const getCircleColor = (dueDate: Date, done: boolean) => {
  if ((isPast(dueDate) || isToday(dueDate)) && done === true) return '#77B254'; // Green
  if ((isPast(dueDate) || isToday(dueDate)) && done === false) return '#F2B28C'; // Red
  return '#bdbdbd'; // Gray
};

const getLineColor = (date: Date | null) => {
  if (!date) return '#e0e0e0'; // Gray
  if (isPast(date) || isToday(date)) return 'black';
  return '#e0e0e0'; // Gray
};

const Progress = () => {
  const db = useSQLiteContext();
  const [Groups, setGroups] = useState<Group[]>([]);
  const [Tasks, setTasks] = useState<Task[]>([]);
  const [showTaskBottomSheet, setShowTaskBottomSheet] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [refreshDB, setRefreshDB] = useState(false);


  const fetchGroups = async () => {
    const group_list = (await getGroups(db)) as Group[];
    setGroups(group_list);
  };

  const fetchTasks = async () => {
    if (activeGroup) {
      const tasks = await getTasksByGroup(db, activeGroup);
      setTasks(tasks);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [db])
  );

  useEffect(() => {
    if (Groups.length > 0 && !activeGroup) {
      setActiveGroup(Groups[0]);
    }
  }, [Groups]);

  useEffect(() => {
    fetchTasks();
  }, [activeGroup, refreshDB]);

  // Update Task
      const handelUpdateTask = async (oldTask: Task, newTask: Task) => {
          if (!oldTask || !newTask) return;
          setShowTaskBottomSheet(false);
          setSelectedTask(null);
          await updateTask(db, oldTask, newTask);
          setRefreshDB(!refreshDB);
      }
  

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Group tabs bar*/}
      <View style={{ height: 50, backgroundColor: '#FFF', margin: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          {Groups.map((group, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tabButton, activeGroup?.title === group.title && styles.activeTabButton]}
              onPress={() => setActiveGroup(group)}
            >
              <Text style={[styles.tabText, activeGroup?.title === group.title && styles.activeTabText]}>
                {group.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Task List */}
      <View style={styles.container}>
        <FlatList
          data={Tasks}
          keyExtractor={(item, index) => `${item.id}-${index}`} // Ensures unique keys
          renderItem={({ item, index }) => {
            const circleColor = item.dueAt ? getCircleColor(new Date(item.dueAt), !!item.status) : '#bdbdbd';
            const nextTask = Tasks[index + 1];
            const lineColor = nextTask?.dueAt ? getLineColor(new Date(nextTask.dueAt)) : '#e0e0e0';

            return (
              <TouchableOpacity
                onPress={() => {
                  setSelectedTask(item);
                  setShowTaskBottomSheet(true);
                }}
               style={[styles.stepContainer, 
                {borderColor: item.dueAt && format(new Date(item.dueAt), 'yyyy-MM-dd') === format(new Date(Date.now()), 'yyyy-MM-dd') ? 'lightgrey' : 'transparent'}
               ]}>

                {/* Circle with dynamic status color */}
                <View style={[styles.dayContainer, { backgroundColor: circleColor,
                   borderBlockColor: item.dueAt && format(new Date(item.dueAt), 'yyyy-MM-dd') === format(new Date(Date.now()), 'yyyy-MM-dd') ? 'black' : 'transparent' }]}>
                  <Text style={styles.dayText}>{index + 1}</Text>
                </View>

                {/* Line connecting steps */}
                {index < Tasks.length - 1 && (
                  <View style={[styles.line, { backgroundColor: lineColor }]} />
                )}

                {/* Task details */}
                <View style={styles.stepDetails}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.date}>
                    {item.dueAt ? format(new Date(item.dueAt), 'MMM dd, yyyy') : 'No due date'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}

          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => setRefreshDB(!refreshDB)} />
          }
        />
      </View>

      <TaskBottomSheet
        task={selectedTask}
        visible={showTaskBottomSheet}
        onClose={() => {
          setShowTaskBottomSheet(false);
          setSelectedTask(null);
        }}
        onSave={(updatedTask) => selectedTask && handelUpdateTask(selectedTask, updatedTask)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderEndWidth: 2,
    borderBottomWidth: 2,
    marginBottom: 16,
    borderRadius: 15,
  },
  dayContainer: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dayText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  line: {
    width: 10,
    height: 55,
    marginLeft: 15,
    position: 'absolute',
    top: 40,
    zIndex: -1,
  },
  stepDetails: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#757575',
    marginVertical: 4,
  },
  scrollContainer: {
    flexDirection: 'row',
    padding: 5,
    backgroundColor: '#FFF',
  },
  tabButton: {
    backgroundColor: '#f7f7f7',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  tabText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  activeTabButton: {
    backgroundColor: 'black',
  },
  activeTabText: {
    color: '#FFF',
  },
});

export default Progress;
