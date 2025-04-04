import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useMemo, useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { Habit, Task } from '../../../utils/customTypes';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { getHabitTask } from '../../../utils/taskService';
import { set } from 'date-fns';

const HabitSummary = () => {

  const db = useSQLiteContext();
  const [taskList, setTaskList] = useState<Task[]>([]);

  // Accept the habit list from the previous screen
  const { detail } = useLocalSearchParams();
  const habitDetail = detail ? JSON.parse(detail as string) as Habit : null;

  // Fetch the habit task from the database
  const fetchHabitTask = async () => {
    if (!habitDetail?.id) {
      throw new Error('Habit ID is undefined');
    }
    const habitList = await getHabitTask(db, habitDetail.id);
    setTaskList(habitList);
  }


  // test
  //console.log(' HabitSum 16 --> Habit List:', taskList);
  //console.log('Habit Detail:', habitDetail);


  // Calculate metrics for the habit
  const calculateMetrics = () => {
    // Mock data based on the image for demonstration
    return {
      score: 84,
      total: 43,
      bestStreak: 12,
      currentStreak: 4
    };
  };

  // Generate marked dates for the calendar
  const getMarkedDates = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const markedDates: { [date: string]: any } = {};

    // Mark the current date
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    markedDates[todayString] = { selected: true, selectedColor: '#9966FF' };

    // Mock completed dates (in a real app, use your actual data)
    for (let i = 1; i <= 30; i++) {
      if (Math.random() > 0.3) { // Randomly mark dates as completed for demo
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        // Don't overwrite the current date styling
        if (dateString !== todayString) {
          markedDates[dateString] = { marked: true, dotColor: '#9966FF' };
        }
      }
    }

    return markedDates;
  };

  // Generate graph data for the chart
  const generateGraphData = () => {
    // Mock data for demonstration
    return [65, 78, 62, 75, 85, 80];
  };

  // Memoize calculations to prevent recalculating on every render
  const metrics = useMemo(() => calculateMetrics(), []);//habitList]);
  const markedDates = useMemo(() => getMarkedDates(), []);
  const graphData = useMemo(() => generateGraphData(), []);

  // Get current month
  const getCurrentMonth = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[new Date().getMonth()]} ${new Date().getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      {/* Header with title and frequency */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Veggie breakfast</Text>
          <Text style={styles.leafIcon}>🌱</Text>
        </View>
        <Text style={styles.frequency}>Everyday</Text>
      </View>

      {/* Metrics Display */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{metrics.score}%</Text>
          <Text style={styles.metricLabel}>Score</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{metrics.total}</Text>
          <Text style={styles.metricLabel}>Total</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{metrics.bestStreak}</Text>
          <Text style={styles.metricLabel}>Best streak</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{metrics.currentStreak}</Text>
          <Text style={styles.metricLabel}>Streak</Text>
        </View>
      </View>

      {/* Month Display */}
      <Text style={styles.monthLabel}>{getCurrentMonth()}</Text>

      {/* Calendar Component */}
      <Calendar
        markedDates={markedDates}
        hideExtraDays={false}
        enableSwipeMonths={true}
        onDayPress={(day) => {
          console.log('Selected day', day);
          // Here you can implement logic to mark/unmark days
        }}
        style={styles.calendar}
      />

      {/* Analytics Section */}
      <View style={styles.analyticsHeader}>
        <Text style={styles.scoreText}>Score</Text>
        <Text style={styles.analyticsLink}>Analytics →</Text>
      </View>

      {/* Graph */}
      <View style={styles.graphContainer}>
        {/* Line Points */}
        {graphData.map((value, index) => (
          <View key={index} style={styles.graphPointContainer}>
            <View
              style={[
                styles.graphPoint,
                { bottom: `${value}%` }
              ]}
            />
            {index > 0 && (
              <View
                style={[
                  styles.graphLine,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default HabitSummary;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  leafIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  frequency: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricBox: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  metricLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  calendar: {
    borderRadius: 10,
    marginBottom: 20,
    height: 300,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 14,
    color: '#888888',
  },
  analyticsLink: {
    fontSize: 14,
    color: '#007AFF',
  },
  graphContainer: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    position: 'relative',
  },
  graphPointContainer: {
    position: 'relative',
    width: '16.66%',
    height: '100%',
    alignItems: 'center',
  },
  graphPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9966FF',
  },
  graphLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#9966FF',
    zIndex: -1,
  }
});