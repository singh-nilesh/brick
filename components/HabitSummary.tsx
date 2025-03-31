import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Habit, Task } from '../utils/customTypes'


interface HabitSummaryProps {
    taskList: Task[];
    habitList: Habit[];
    }

const HabitSummary = ({taskList, habitList}:HabitSummaryProps) => {
  return (
    <View>
      <Text style={styles.title}>Habit Summary</Text>
    </View>
  )
}

export default HabitSummary

const styles = StyleSheet.create({
    container: {
    },
    title: {
        fontSize: 25,
        textAlign: 'center',
        marginVertical: 10,
    }
})