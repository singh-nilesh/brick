import { View, Text } from 'react-native'
import React from 'react'
import HorizontalDatePicker from './components/HorizontalDatePicker'
import { format } from 'date-fns';

const index = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  return (
    <View className='flex-1'>

      <View>
        <Text>Selected Date: {format(selectedDate, 'EEEE, MMMM dd, yyyy')}</Text>
      </View>
      <HorizontalDatePicker/>
    </View>
  )
}

export default index