'use client'

import type { SyntheticEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

import { redirect, useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

import { CardContent, IconButton, Tab, Typography, useMediaQuery } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import classNames from 'classnames'

import PictureListTabContent from './_components/tabs/PictureListTabContent'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import CustomTextField from '@/@core/components/mui/TextField'
import DisabledTabWithTooltip from '@/@core/components/custom/DisabledTabWithTooltip'
import BasicTabContent from './_components/tabs/MachineProjectTabContent'
import ScheduleAndEngineerTabContent from './_components/tabs/ScheduleAndEngineerTabContent'
import NoteTabContent from './_components/tabs/NoteTabContent'
import InspectionListTabContent from './_components/tabs/InspectionListTabContent'
import type { MachineTabValue } from '@/@core/utils/useMachineTabValueStore'
import useMachineTabValueStore from '@/@core/utils/useMachineTabValueStore'
import { useGetEngineersOptions, useGetMachineProject, useGetScheduleTab } from '@/@core/hooks/customTanstackQueries'
import useMachineIsEditingStore from '@/@core/utils/useMachineIsEditingStore'
import { auth } from '@/lib/auth'

const Tabs = [
  { value: '현장정보', label: '현장정보' },
  { value: '점검일정/참여기술진', label: '점검일정/참여기술진' },
  { value: '설비목록', label: '설비목록' },
  { value: '전체사진', label: '전체사진' },
  { value: '특이사항', label: '특이사항' }
]

const MachineUpdatePage = () => {
  const isMobile = useMediaQuery('(max-width:600px)')

  const params = useParams()
  const machineProjectId = params?.id as string

  const { tabValue, setTabValue } = useMachineTabValueStore(state => state)
  const { isEditing } = useMachineIsEditingStore()

  const { data: engineerList } = useGetEngineersOptions()
  const { data: projectData, refetch: refetchProjectData } = useGetMachineProject(machineProjectId)
  const { data: scheduleData, refetch: refetchScheduleData } = useGetScheduleTab(machineProjectId)

  const [isEditingProjectName, setIsEditingProjectName] = useState(false)

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue as MachineTabValue)
  }

  const handleChangeProjectName = useCallback(
    async (projectName: string) => {
      try {
        await auth.put<{ data: { projectName: string; version: number } }>(
          `/api/machine-projects/${machineProjectId}/name`,
          {
            version: projectData?.version,
            name: projectName
          }
        )

        refetchProjectData()
        handleSuccess('프로젝트 이름이 변경되었습니다.')
      } catch (error) {
        handleApiError(error)
      }
    },
    [machineProjectId, projectData?.version, refetchProjectData]
  )

  useEffect(() => {
    if (machineProjectId) {
      switch (tabValue) {
        case '현장정보':
          if (!projectData) refetchProjectData()
          break
        case '점검일정/참여기술진':
          if (!scheduleData) refetchScheduleData()
          break
        default:
          break
      }
    }
  }, [machineProjectId, tabValue, refetchProjectData, refetchScheduleData, engineerList, projectData, scheduleData])

  return (
    <Card className='h-full flex flex-col'>
      <div className={classNames('flex items-center justify-between', { 'p-0': isMobile, 'px-6 py-5': !isMobile })}>
        <CardHeader
          title={
            <div
              className={classNames('flex gap-0  mt-1', {
                'flex-col text-left items-start': isMobile,
                'items-center': !isMobile
              })}
            >
              <Typography
                color='black'
                sx={{
                  fontSize: 25,
                  fontWeight: 500,
                  ':hover': { color: 'primary.main' },
                  alignItems: 'center',
                  display: 'flex'
                }}
                onClick={() => redirect('/machine')}
              >
                기계설비현장
                <i className='tabler-chevron-right' />
              </Typography>
              <div className='flex items-center'>
                {!isEditingProjectName ? (
                  <Typography color='black' sx={{ fontSize: 25, fontWeight: 500 }}>
                    {projectData?.machineProjectName ? (
                      projectData?.machineProjectName
                    ) : (
                      <span className='font-normal text-slate-400'>이름 없음</span>
                    )}
                  </Typography>
                ) : (
                  <CustomTextField
                    slotProps={{
                      input: { sx: { fontSize: 20 } },
                      htmlInput: { sx: { py: '0 !important' } }
                    }}
                    id={'projectNameInput'}
                    defaultValue={projectData?.machineProjectName ?? ''}
                  />
                )}
                <IconButton
                  onClick={() => {
                    if (isEditingProjectName) {
                      const projectNameInputElement = document.getElementById('projectNameInput') as HTMLInputElement

                      handleChangeProjectName(projectNameInputElement.value)
                    }

                    setIsEditingProjectName(prev => !prev)
                  }}
                >
                  <i className='tabler-pencil' />
                </IconButton>
              </div>
            </div>
          }
          sx={{ cursor: 'pointer', padding: 0 }}
        />
      </div>

      <CardContent className='flex-1 flex flex-col overflow-y-hidden p-0"'>
        <TabContext value={tabValue}>
          {/* 탭 목록 */}
          <TabList onChange={handleChange} aria-label='nav tabs example'>
            {Tabs.map(tab => {
              return isEditing && tabValue !== tab.value ? (
                <DisabledTabWithTooltip value={tab.value} label={tab.label} />
              ) : (
                <Tab key={tab.value} value={tab.value} label={tab.label} />
              )
            })}
          </TabList>
          <div className='flex-1 overflow-y-hidden pt-4'>
            <TabPanel value='현장정보' className='h-full'>
              {projectData ? <BasicTabContent /> : <Typography>프로젝트 정보를 불러오는 중입니다.</Typography>}
            </TabPanel>
            <TabPanel value='점검일정/참여기술진'>
              {scheduleData ? (
                <ScheduleAndEngineerTabContent />
              ) : (
                <Typography>점검일정 및 참여기술진 정보를 불러오는 중입니다.</Typography>
              )}
            </TabPanel>
            <TabPanel value='설비목록' className='h-full' keepMounted>
              <InspectionListTabContent />
            </TabPanel>
            <TabPanel value='전체사진' className='h-full' keepMounted>
              <PictureListTabContent />
            </TabPanel>
            <TabPanel value='특이사항'>
              {projectData ? <NoteTabContent /> : <Typography>특이사항 정보를 불러오는 중입니다.</Typography>}
            </TabPanel>
          </div>
        </TabContext>
      </CardContent>
    </Card>
  )
}

export default MachineUpdatePage
