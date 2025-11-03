// MUI Imports
import Card from '@mui/material/Card'

// Component Imports
import CalendarWrapper from './_components/CalendarWrapper'

// Styled Component Imports
import AppFullCalendar from '@/libs/styles/AppFullCalendar'

const CalendarApp = () => {
  return (
    <Card className='overflow-visible h-full'>
      <AppFullCalendar className='app-calendar h-full'>
        <CalendarWrapper />
      </AppFullCalendar>
    </Card>
  )
}

export default CalendarApp
