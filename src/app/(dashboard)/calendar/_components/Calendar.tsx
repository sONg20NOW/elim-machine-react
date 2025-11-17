'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// MUI Imports
import { useRouter } from 'next/navigation'

import { useTheme } from '@mui/material/styles'

// Third-party imports
import type { Dispatch } from '@reduxjs/toolkit'

import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions } from '@fullcalendar/core'

// Type Imports
import { Typography } from '@mui/material'

import dayjs from 'dayjs'

import type { CalendarColors, CalendarType } from '@/types/apps/calendarTypes'

// Slice Imports
import { fetchEvents, filterEvents, updateEvent } from '@/redux-store/slices/calendar'
import UserModal from '../../member/_components/UserModal'
import useMachineTabValueStore from '@/@core/utils/useMachineTabValueStore'
import { useGetSingleMember } from '@/@core/hooks/customTanstackQueries'

type CalenderProps = {
  calendarStore: CalendarType
  calendarApi: any
  setCalendarApi: (val: any) => void
  calendarsColor: CalendarColors
  dispatch: Dispatch
  handleLeftSidebarToggle: () => void
  handleAddEventSidebarToggle: () => void
}

// const blankEvent: AddEventType = {
//   name: '',
//   start: '',
//   end: '',
//   allDay: false,
//   url: '',
//   extendedProps: {
//     calendar: '',
//     guests: [],
//     description: ''
//   },
//   type: ''
// }

const Calendar = (props: CalenderProps) => {
  // Props
  const { calendarStore, calendarApi, setCalendarApi, dispatch } = props

  // Refs
  const calendarRef = useRef<FullCalendar>(null)

  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [memberId, setMemberId] = useState('0')
  const { data: selectedUserData } = useGetSingleMember(memberId.toString())

  const setTabValue = useMachineTabValueStore(set => set.setTabValue)

  // Hooks
  const theme = useTheme()

  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current?.getApi())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // calendarOptions(Props)
  const calendarOptions: CalendarOptions = {
    events: calendarStore.events.map(event => ({
      ...event,
      end: dayjs(event.end?.toString()).add(1, 'day').format('YYYY-MM-DD')
    })),
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'title',
      end: 'today, prev,  next,'
    },
    datesSet(dateInfo) {
      const currentDate = dateInfo.view.calendar.getDate()
      const year = currentDate.getFullYear()

      const month = currentDate.getMonth() + 1

      // @ts-ignore
      dispatch(fetchEvents({ year, month }))
    },
    views: {
      week: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
      }
    },

    /*
      Enable dragging and resizing event
      ? Docs: https://fullcalendar.io/docs/editable
    */
    editable: false,

    /*
      Enable resizing event from start
      ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
    */
    eventResizableFromStart: true,

    /*
      Automatically scroll the scroll-containers during event drag-and-drop and date selecting
      ? Docs: https://fullcalendar.io/docs/dragScroll
    */
    dragScroll: true,

    /*
      Max number of events within a given day
      ? Docs: https://fullcalendar.io/docs/dayMaxEvents
    */
    dayMaxEvents: 10,

    /*
      Determines if day names and week names are clickable
      ? Docs: https://fullcalendar.io/docs/navLinks
    */
    navLinks: true,

    eventClassNames({ event }) {
      // @ts-ignore
      const colorName = event.extendedProps['colorCode']

      return [
        // Background Color
        `event-bg-[${colorName}] cursor-pointer`
      ]
    },

    eventContent(eventInfo) {
      return (
        <>
          <div className='flex gap-1 items-center'>
            {eventInfo.event.extendedProps['type'] === '생일' && <i className='tabler-cake' />}
            {eventInfo.event.extendedProps['type'] === '기계설비' && <i className='tabler-settings-filled' />}
            <Typography
              sx={{ overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              color='white'
              variant='h5'
            >
              {eventInfo.event.title}
            </Typography>
          </div>
        </>
      )
    },

    async eventClick({ event, jsEvent }) {
      jsEvent.preventDefault()

      if (event.extendedProps['type'] === '기계설비') {
        setTabValue('현장정보')
        router.push(`/machine/${event.id}`)
      } else if (event.extendedProps['type'] === '생일') {
        const memberId = event.id

        setMemberId(memberId)
        setOpen(true)
      }

      if (event.url) {
        // Open the URL in a new tab
        window.open(event.url, '_blank')
      }

      //* Only grab required field otherwise it goes in infinity loop
      //! Always grab all fields rendered by form (even if it get `undefined`)
      // event.value = grabEventDataFromEventApi(clickedEvent)
      // isAddNewEventSidebarActive.value = true
    },
    buttonText: {
      today: `오늘`
    },

    // customButtons: {
    //   goToday: {
    //     text: '오늘',
    //     icon: 'tabler-calendar',
    //     click: function () {
    //       if (calendarApi) {
    //         calendarApi.today()
    //       }
    //     }
    //   }
    // },

    // dateClick(info: any) {
    // const ev = { ...blankEvent }
    // ev.start = info.date
    // ev.end = info.date
    // ev.allDay = true
    // dispatch(selectedEvent(ev))
    // handleAddEventSidebarToggle()
    // },

    /*
      Handle event drop (Also include dragged event)
      ? Docs: https://fullcalendar.io/docs/eventDrop
      ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
    */
    eventDrop({ event: droppedEvent }: any) {
      dispatch(updateEvent(droppedEvent))
      dispatch(filterEvents())
    },

    /*
      Handle event resize
      ? Docs: https://fullcalendar.io/docs/eventResize
    */
    eventResize({ event: resizedEvent }: any) {
      dispatch(updateEvent(resizedEvent))
      dispatch(filterEvents())
    },

    locale: 'ko',
    direction: theme.direction
  }

  useEffect(() => {
    console.log(JSON.stringify(calendarOptions.events))
  }, [calendarOptions.events])

  return (
    <>
      <FullCalendar height='100%' ref={calendarRef} {...calendarOptions} />
      {open && selectedUserData && <UserModal open={open} setOpen={setOpen} selectedUserData={selectedUserData} />}
    </>
  )
}

export default Calendar
