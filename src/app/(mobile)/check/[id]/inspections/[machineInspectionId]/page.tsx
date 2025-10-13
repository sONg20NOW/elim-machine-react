'use client'

import { useContext, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Box, IconButton, Tab } from '@mui/material'

import TabList from '@mui/lab/TabList'

import TabContext from '@mui/lab/TabContext'

import TabPanel from '@mui/lab/TabPanel'

import MobileHeader from '@/app/(mobile)/_components/MobileHeader'
import { isMobileContext } from '@/app/_components/ProtectedPage'

type currentTabType = 'pictures' | 'info' | 'gallery' | 'camera'

export default function CheckInspectionDetailPage() {
  const router = useRouter()
  const inspectionName = '설비명'

  const isMobile = useContext(isMobileContext)

  const [currentTab, setCurrentTab] = useState<currentTabType>('pictures')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* 헤더 */}
      <MobileHeader
        left={
          <IconButton sx={{ p: 0 }} onClick={() => router.back()}>
            <i className='tabler-chevron-left text-white text-3xl' />
          </IconButton>
        }
        title={`${inspectionName}`}
      />
      {/* 본 컨텐츠 (스크롤 가능 영역)*/}
      <TabContext value={currentTab}>
        <Box sx={{ flex: 1 }}>
          <TabPanel value={'pictures'}>1</TabPanel>
          <TabPanel value={'info'}>2</TabPanel>
          <TabPanel value={'gallery'}>3</TabPanel>
          <TabPanel value={'camera'}>4</TabPanel>
        </Box>
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          <TabList
            sx={{ display: 'flex', px: isMobile ? '' : 20 }}
            centered
            onChange={(event: React.SyntheticEvent, newValue: currentTabType) => setCurrentTab(newValue)}
          >
            <Tab sx={{ flex: 1 }} value={'pictures'} label={<i className='tabler-photo text-4xl' />}></Tab>
            <Tab sx={{ flex: 1 }} value={'info'} label={<i className='tabler-info-circle text-4xl' />}></Tab>
            <Tab sx={{ flex: 1 }} value={'gallery'} label={<i className='tabler-library-photo text-4xl' />}></Tab>
            <Tab sx={{ flex: 1 }} value={'camera'} label={<i className='tabler-photo-sensor text-4xl' />}></Tab>
          </TabList>
        </Box>
      </TabContext>
    </Box>
  )
}
