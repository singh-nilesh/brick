import { View, Text } from 'react-native'
import React from 'react'
import HorizontalDatePicker from './components/HorizontalDatePicker'
import HeaderDatePicker from './components/HeaderDatePicker';
import { format } from 'date-fns';

const index = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  return (
    <View className='flex-1'>

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