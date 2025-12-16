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

import { IconCheck, IconChevronRight, IconPencil, IconX } from '@tabler/icons-react'

import { useForm } from 'react-hook-form'

import PictureListTabContent from './_components/tabs/PictureListTabContent'
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import CustomTextField from '@core/components/mui/TextField'
import DisabledTabWithTooltip from '@/app/(dashboard)/machine/[id]/_components/DisabledTabWithTooltip'
import BasicTabContent from './_components/tabs/MachineProjectTabContent'
import ScheduleAndEngineerTabContent from './_components/tabs/ScheduleAndEngineerTabContent'
import NoteTabContent from './_components/tabs/NoteTabContent'
import InspectionListTabContent from './_components/tabs/InspectionListTabContent'
import type { MachineTabValue } from '@/@core/hooks/zustand/useMachineTabValueStore'
import useMachineTabValueStore from '@/@core/hooks/zustand/useMachineTabValueStore'
import { useGetEngineersOptions, useGetMachineProject, useGetScheduleTab } from '@core/hooks/customTanstackQueries'
import { auth } from '@core/utils/auth'
import isEditingContext from './isEditingContext'

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
  const [isEditing, setIsEditing] = useState(false)

  const { data: engineerList } = useGetEngineersOptions()
  const { data: projectData, refetch: refetchProjectData } = useGetMachineProject(machineProjectId)
  const { data: scheduleData, refetch: refetchScheduleData } = useGetScheduleTab(machineProjectId)

  const [isEditingProjectName, setIsEditingProjectName] = useState(false)

  const {
    reset,
    register,
    handleSubmit,
    formState: { isDirty }
  } = useForm<{ machineProjectName: string }>({
    defaultValues: {
      machineProjectName: projectData?.machineProjectName ?? ''
    }
  })

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue as MachineTabValue)
  }

  const handleChangeProjectName = handleSubmit(
    useCallback(
      async data => {
        if (isDirty) {
          try {
            const response = await auth
              .put<{ data: { projectName: string; version: number } }>(
                `/api/machine-projects/${machineProjectId}/name`,
                {
                  version: projectData?.version,
                  name: data.machineProjectName
                }
              )
              .then(v => v.data.data)

            reset({ machineProjectName: response.projectName })
            refetchProjectData()
            handleSuccess('프로젝트 이름이 변경되었습니다.')
          } catch (error) {
            handleApiError(error)
          }
        }
      },
      [machineProjectId, projectData?.version, isDirty, reset, refetchProjectData]
    )
  )

  const cancelChangingProjectName = useCallback(() => {
    reset()
    setIsEditingProjectName(false)
  }, [reset, setIsEditingProjectName])

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
    <isEditingContext.Provider value={{ isEditing, setIsEditing }}>
      <Card className='h-full flex flex-col'>
        <div className={classNames('flex items-center justify-between', { 'p-0': isMobile, 'px-6 py-6': !isMobile })}>
          <CardHeader
            title={
              <div
                className={classNames('flex gap-0', {
                  'flex-col text-left items-start': isMobile,
                  'items-center': !isMobile
                })}
              >
                <Typography
                  variant='h4'
                  sx={{
                    ':hover': { color: 'primary.main' },
                    alignItems: 'center',
                    display: 'flex'
                  }}
                  onClick={() => redirect('/machine')}
                >
                  기계설비현장
                  <IconChevronRight />
                </Typography>
                <form className='flex items-center' onSubmit={handleChangeProjectName}>
                  {!isEditingProjectName ? (
                    <Typography color='black' variant='h4' sx={{ cursor: 'default' }}>
                      {projectData?.machineProjectName ?? ''}
                    </Typography>
                  ) : (
                    <CustomTextField
                      {...register('machineProjectName')}
                      slotProps={{
                        input: { sx: { fontSize: 20, width: 'fit-content' } },
                        htmlInput: { sx: { py: '0 !important' } }
                      }}
                    />
                  )}
                  <IconButton
                    type='submit'
                    onClick={() => {
                      setIsEditingProjectName(prev => !prev)
                    }}
                  >
                    {!isEditingProjectName ? (
                      <IconPencil />
                    ) : (
                      <IconCheck className='text-green-400 hover:text-green-500' />
                    )}
                  </IconButton>
                  {isEditingProjectName && (
                    <IconButton type='button' onClick={cancelChangingProjectName}>
                      <IconX className='text-red-400 hover:text-red-500' />
                    </IconButton>
                  )}
                </form>
              </div>
            }
            sx={{ cursor: 'pointer', padding: 0 }}
          />
        </div>

        <CardContent className='flex-1 flex flex-col overflow-y-hidden'>
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
            <div className='flex-1 overflow-y-hidden pt-6'>
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
              <TabPanel value='설비목록' className='h-full'>
                <InspectionListTabContent />
              </TabPanel>
              <TabPanel value='전체사진' className='h-full'>
                <PictureListTabContent />
              </TabPanel>
              <TabPanel value='특이사항'>
                {projectData ? <NoteTabContent /> : <Typography>특이사항 정보를 불러오는 중입니다.</Typography>}
              </TabPanel>
            </div>
          </TabContext>
        </CardContent>
      </Card>
    </isEditingContext.Provider>
  )
}

export default MachineUpdatePage
