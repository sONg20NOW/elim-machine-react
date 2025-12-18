'use client'

import type { SyntheticEvent } from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'

import { redirect, useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

import { CardContent, IconButton, Tab, Typography } from '@mui/material'
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
import useMachineProjectTabValueStore from '@/@core/hooks/zustand/useMachineProjectTabValueStore'
import {
  useGetEngineersOptions,
  useGetMachineProject,
  useGetMachineProjectScheduleTab,
  useMutateMachineProjectName
} from '@core/hooks/customTanstackQueries'
import isEditingContext from './isEditingContext'
import type { MachineProjectResponseDtoType, MachineProjectTabValueType } from '@/@core/types'
import { isMobileContext } from '@/@core/contexts/mediaQueryContext'

const Tabs = [
  { value: '현장정보', label: '현장정보' },
  { value: '점검일정/참여기술진', label: '점검일정/참여기술진' },
  { value: '설비목록', label: '설비목록' },
  { value: '전체사진', label: '전체사진' },
  { value: '특이사항', label: '특이사항' }
]

const MachineUpdatePage = () => {
  const isMobile = useContext(isMobileContext)

  const params = useParams()
  const machineProjectId = params?.id as string

  const { tabValue, setTabValue } = useMachineProjectTabValueStore(state => state)
  const [isEditing, setIsEditing] = useState(false)

  const { data: engineerList } = useGetEngineersOptions()
  const { data: machineProjectData, refetch: refetchMachineProjectData } = useGetMachineProject(machineProjectId)

  const { data: scheduleData, refetch: refetchScheduleData } = useGetMachineProjectScheduleTab(machineProjectId)

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue as MachineProjectTabValueType)
  }

  useEffect(() => {
    if (machineProjectId) {
      switch (tabValue) {
        case '현장정보':
          if (!machineProjectData) refetchMachineProjectData()
          break
        case '점검일정/참여기술진':
          if (!scheduleData) refetchScheduleData()
          break
        default:
          break
      }
    }
  }, [
    machineProjectId,
    tabValue,
    refetchMachineProjectData,
    refetchScheduleData,
    engineerList,
    machineProjectData,
    scheduleData
  ])

  return (
    <isEditingContext.Provider value={{ isEditing, setIsEditing }}>
      <Card className='h-full flex flex-col'>
        <div className={classNames('flex items-center justify-between', { 'p-0': isMobile, 'px-6 py-6': !isMobile })}>
          <CardHeader
            title={
              machineProjectData && (
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
                  <MachineProjectNameBox machineProjectData={machineProjectData} />
                </div>
              )
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
                {machineProjectData ? <BasicTabContent /> : <Typography>프로젝트 정보를 불러오는 중입니다.</Typography>}
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
                {machineProjectData ? <NoteTabContent /> : <Typography>특이사항 정보를 불러오는 중입니다.</Typography>}
              </TabPanel>
            </div>
          </TabContext>
        </CardContent>
      </Card>
    </isEditingContext.Provider>
  )
}

function MachineProjectNameBox({ machineProjectData }: { machineProjectData: MachineProjectResponseDtoType }) {
  const params = useParams()
  const machineProjectId = params?.id as string

  const { mutateAsync: mutateAsyncName } = useMutateMachineProjectName(machineProjectId)
  const [isEditingProjectName, setIsEditingProjectName] = useState(false)

  const {
    reset,
    register,
    handleSubmit,
    formState: { isDirty }
  } = useForm<{ name: string }>({
    defaultValues: {
      name: machineProjectData?.machineProjectName ?? ''
    }
  })

  const handleChangeProjectName = handleSubmit(
    useCallback(
      async data => {
        if (isDirty) {
          try {
            const newData = await mutateAsyncName({
              name: data.name,
              version: machineProjectData?.version ?? 0
            })

            reset({ name: newData.projectName })
            handleSuccess('프로젝트 이름이 변경되었습니다.')
          } catch (error) {
            handleApiError(error)
          }
        }
      },
      [isDirty, mutateAsyncName, reset, machineProjectData?.version]
    )
  )

  const cancelChangingProjectName = useCallback(() => {
    reset()
    setIsEditingProjectName(false)
  }, [reset, setIsEditingProjectName])

  return (
    <form className='flex items-center' onSubmit={handleChangeProjectName}>
      {!isEditingProjectName ? (
        <Typography color='black' variant='h4' sx={{ cursor: 'default' }}>
          {machineProjectData?.machineProjectName ?? ''}
        </Typography>
      ) : (
        <CustomTextField
          {...register('name')}
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
        {!isEditingProjectName ? <IconPencil /> : <IconCheck className='text-green-400 hover:text-green-500' />}
      </IconButton>
      {isEditingProjectName && (
        <IconButton type='button' onClick={cancelChangingProjectName}>
          <IconX className='text-red-400 hover:text-red-500' />
        </IconButton>
      )}
    </form>
  )
}

export default MachineUpdatePage
