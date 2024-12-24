import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import HorizontalDatePicker from './components/HorizontalDatePicker'
import HeaderDatePicker from './components/HeaderDatePicker';
import { format } from 'date-fns';

const index = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

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
    </View>
  )
}

export default index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});