import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PagerView from 'react-native-pager-view';
import { eachWeekOfInterval, subDays, addDays, eachDayOfInterval, format, isSameDay } from 'date-fns';


// Generate dates for 30 days
const dates = eachWeekOfInterval(
  {
    start: subDays(new Date(), 16),
    end: addDays(new Date(), 14),
  },
  { weekStartsOn: 0 }
).reduce((acc: Date[][], cur) => {
  const allDays = eachDayOfInterval({
    start: cur,
    end: addDays(cur, 6),
  });
  acc.push(allDays);
  return acc;
}, []);


// type safe, 
interface HorizontalDatePickerProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}


// main component
export default function HorizontalSwiper({
  selectedDate,
  setSelectedDate,
}: HorizontalDatePickerProps) {

  const initialPage = dates.findIndex(week =>
    week.some(day => isSameDay(day, selectedDate))
  );

  return (
    <View style={{ height: 60, backgroundColor: 'white', paddingBottom: 5, }}>
      <PagerView
      style={styles.pagerView}
        initialPage={initialPage !== -1 ? initialPage : Math.floor(dates.length / 2)}
      >
        {dates.map((week, i) => (
          <View key={i} style={styles.weekContainer}>
            {week.map((day, j) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <TouchableOpacity
                  key={j}
                  style={[styles.dayContainer, isSelected && styles.selectedDate]}
                  onPress={() => setSelectedDate(day)}
                >
                  <Text
                    style={[
                      styles.weekDayText,
                      isToday && !isSelected && styles.todayText,
                    ]}
                  >
                    {format(day, 'EE')}
                  </Text>
                  <Text
                    style={[
                      styles.dateText,
                      !isSelected && styles.defaultDate,
                      isToday && styles.todayText,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 45,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  dayContainer: {
    alignItems: 'center',
    height: 45,
    borderRadius: 10,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    borderRadius: 20,
    textAlign: 'center',
  },
  selectedText: {
    color: '#1e90ff',
  },
  todayText: {
    color: 'darkblue',
  },
  selectedDate: {
    backgroundColor: '#f0f0f0',
    borderColor: 'black',
    paddingHorizontal: 5,
    borderWidth: 2,
    color: '#1e90ff',
  },
  defaultDate: {
    color: '#333',
  },
});