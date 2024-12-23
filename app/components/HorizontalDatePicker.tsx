import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import { eachWeekOfInterval, subDays, addDays, eachDayOfInterval, format, isSameDay } from 'date-fns';


const dates = eachWeekOfInterval(
  {
    start: subDays(new Date(), 16), // 16 days before Today
    end: addDays(new Date(), 14), // 14 days after Today
  },
  { weekStartsOn: 0 } // Sunday
).reduce((acc: Date[][], cur) => {
  const allDays = eachDayOfInterval({
    start: cur,
    end: addDays(cur, 6), // Index (0-Sunday, 6-Saturday)
  });
  acc.push(allDays);
  return acc;
}, []);


export default function HorizontalDatePicker() {
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today's date

  return (
    <View style={styles.container}>
      {/* Header displaying the selected date */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Selected Date: {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
        </Text>
      </View>

      {/* Weekly Date Pager */}
      <PagerView
        style={styles.pagerView}
        initialPage={Math.floor(dates.length / 2)} // Start at the week containing today's date
      >
        {dates.map((week, i) => (
          <View key={i} style={styles.weekContainer}>
            {week.map((day, j) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <View key={j} style={styles.dayContainer}>
                  <Text
                    style={[
                      styles.weekDayText,
                      isSelected && styles.selectedText,
                      isToday && !isSelected && styles.todayText,
                    ]}
                  >
                    {format(day, 'EE')}
                  </Text>
                  <Text
                    style={[
                      styles.dateText,
                      isSelected && styles.selectedDate,
                      !isSelected && styles.defaultDate,
                    ]}
                    onPress={() => setSelectedDate(day)} // Update selected date on press
                  >
                    {day.getDate()}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#1e90ff',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pagerView: {
    flex: 1,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  dayContainer: {
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 8,
    borderRadius: 20,
    textAlign: 'center',
  },
  selectedText: {
    color: '#1e90ff',
  },
  todayText: {
    color: '#32cd32',
  },
  selectedDate: {
    backgroundColor: '#e0f7ff',
    color: '#1e90ff',
  },
  defaultDate: {
    color: '#333',
  },
});
