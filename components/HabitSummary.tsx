import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, eachDayOfInterval, isBefore, isAfter, isSameDay, parseISO } from 'date-fns';
import { Habit, Task } from '@/utils/customTypes';

interface HabitSummaryProps {
  habits: Habit[];
  tasks: Task[];
  showModal?: (task:Task) => void;
}

const getMarkedDates = (habit: Habit, tasks: Task[]) => {
  // Ensure dates are Date objects
  const start = habit.dtStart instanceof Date ? habit.dtStart : new Date(habit.dtStart);
  const end = habit.dtEnd instanceof Date ? habit.dtEnd : new Date(habit.dtEnd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const allDays = eachDayOfInterval({ start, end });
  const marked: Record<string, any> = {};
  
  for (const day of allDays) {
    const weekDay = day.getDay();
    
    // Calculate week difference similar to your data layer logic
    const startOfStartWeek = new Date(start);
    startOfStartWeek.setDate(start.getDate() - start.getDay());
    
    const startOfDueWeek = new Date(day);
    startOfDueWeek.setDate(day.getDate() - day.getDay());
    
    const weeksSinceStart = Math.ceil(
      (startOfDueWeek.getTime() - startOfStartWeek.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    
    // Check if this date should have a task according to habit recurrence pattern
    if (habit.byWeekDay.includes(weekDay) && weeksSinceStart % habit.interval === 0) {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Find a task for this habit on this day
      const task = tasks.find((t) => {
        const taskDueDate = t.dueAt instanceof Date 
          ? t.dueAt 
          : t.dueAt ? new Date(t.dueAt) : null;
        
        return t.habit?.id === habit.id && taskDueDate && isSameDay(taskDueDate, day);
      });


      
      if (task && task.status) {
        // Completed task - mark green
        marked[dateStr] = {
          marked: true,
          dotColor: 'green',
          selected: true,
          selectedColor: '#C6F6D5',
        };
      } else if (isAfter(day, today)) {
        // Future task - mark grey if not completed
        marked[dateStr] = {
          marked: true,
          dotColor: 'grey',
          selected: true,
          selectedColor: '#E2E8F0',
        };
      } else {
        // Past or today's task - mark red if not completed
        marked[dateStr] = {
          marked: true,
          dotColor: 'red',
          selected: true,
          selectedColor: '#FED7D7',
        };
      }
    }
  }
  
  return marked;
};

const HabitSummary = ({ habits, tasks, showModal }: HabitSummaryProps) => {

  return (
    <ScrollView>
      {habits.map((habit) => {
        // Filter tasks for this specific habit
        const tasksForHabit = tasks.filter((t) => t.habit?.id === habit.id);
        const markedDates = getMarkedDates(habit, tasksForHabit);
        
        return (
          <View key={habit.id} style={{ marginBottom: 20, padding: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
              {habit.title}
            </Text>
            <Calendar
              markedDates={markedDates}
              theme={{
                todayTextColor: '#3182CE',
                arrowColor: '#3182CE',
              }}
              onDayPress={(day) => {
                const task = tasksForHabit.find((t) => t.dueAt && isSameDay(t.dueAt, parseISO(day.dateString)));
                if (task) {
                  showModal && showModal(task);
                }
              }}            />
          </View>
        );
      })}
    </ScrollView>
  );
};

export default HabitSummary;