'use client'

import type { ReactNode, SyntheticEvent } from 'react'
import { createContext, useCallback, useEffect, useState } from 'react'

import { redirect, useParams, useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

import { Button, CardContent, IconButton, Tab, Typography } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import axios from 'axios'

import SiteInfoContent from './_components/siteInfoContent'
import PlanContent from './_components/planContent'
import MachineContent from './_components/machineContent'
import MachinePictures from './_components/machinePictures'
import NoteContent from './_components/noteContent'
import type {
  MachineEngineerOptionListResponseDtoType,
  MachineEngineerOptionResponseDtoType,
  MachineProjectResponseDtoType,
  MachineProjectScheduleAndEngineerResponseDtoType
} from '@/app/_type/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import DefaultModal from '@/app/_components/DefaultModal'
import CustomTextField from '@/@core/components/mui/TextField'

export const EngineerOptionContext = createContext<MachineEngineerOptionResponseDtoType[]>([])

export const MachineProjectNameContext = createContext<string>('')

const MachineUpdatePage = () => {
  const router = useRouter()

  const params = useParams()
  const machineProjectId = params?.id as string

  const [projectData, setProjectData] = useState<MachineProjectResponseDtoType>()
  const [scheduleData, setScheduleData] = useState<MachineProjectScheduleAndEngineerResponseDtoType>()
  const [engineerOption, setEngineerOption] = useState<MachineEngineerOptionResponseDtoType[]>()
  const [value, setValue] = useState<string>('1')

  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // 현장정보 불러오기
  const getProjectData = useCallback(async () => {
    try {
      const response = await axios.get<{ data: MachineProjectResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}`
      )

      setProjectData(response.data.data)

      // handleSuccess('프로젝트 정보를 불러왔습니다.')
    } catch (error) {
      handleApiError(error, '프로젝트 정보를 불러오는 데 실패했습니다.')
    }
  }, [machineProjectId])

  // 점검일정/참여기술진 정보 불러오기
  const getScheduleData = useCallback(async () => {
    try {
      const response = await axios.get<{ data: MachineProjectScheduleAndEngineerResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/schedule-tab`
      )

      setScheduleData(response.data.data)

      // handleSuccess('점검일정/참여기술진 정보를 불러왔습니다.')
    } catch (error) {
      handleApiError(error, '점검일정/참여기술진 정보를 불러오는 데 실패했습니다.')
    }
  }, [machineProjectId])

  // 엔지니어 목록 가져오기
  const getEngineerList = async () => {
    try {
      const response = await axios.get<{ data: MachineEngineerOptionListResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers/options`
      )

      const options = response.data.data.engineers

      setEngineerOption(options)
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  const handleChangeProjectName = useCallback(
    async (projectName: string) => {
      try {
        await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/name`, {
          version: projectData?.version,
          name: projectName
        })
        getProjectData()
        handleSuccess('프로젝트 이름이 변경되었습니다.')
      } catch (error) {
        handleApiError(error)
      }
    },
    [machineProjectId, projectData?.version, getProjectData]
  )

  const handleDelete = async () => {
    try {
      if (!projectData) throw new Error()

      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}?version=${projectData.version}`
      )

      handleSuccess('해당 프로젝트가 삭제되었습니다.')
      router.push('/machine')
    } catch (error) {
      handleApiError(error)
    }
  }

  useEffect(() => {
    if (machineProjectId) {
      if (!engineerOption) getEngineerList()

      switch (value) {
        case '1':
          if (!projectData) getProjectData()
          break
        case '2':
          if (!scheduleData) getScheduleData()
          break
        default:
          break
      }
    }
  }, [machineProjectId, value, getProjectData, getScheduleData, engineerOption, projectData, scheduleData])

  const Providers = ({ children }: { children: ReactNode }) => (
    <EngineerOptionContext.Provider value={engineerOption ?? []}>
      <MachineProjectNameContext.Provider value={projectData?.machineProjectName ?? ''}>
        {children}
      </MachineProjectNameContext.Provider>
    </EngineerOptionContext.Provider>
  )

  return (
    <Providers>
      <Card>
        <div className='flex px-6 py-5 items-center justify-between'>
          <div className='flex gap-0 items-center'>
            <CardHeader
              title='기계설비현장'
              sx={{ cursor: 'pointer', padding: 0 }}
              slotProps={{ title: { sx: { ':hover': { color: 'primary.main' } } } }}
              onClick={() => redirect('/machine')}
            />
            <i className='tabler-chevron-right' />
            {!isEditing ? (
              <CardHeader title={projectData?.machineProjectName ?? ''} sx={{ padding: 0 }} />
            ) : (
              <CustomTextField id={'projectNameInput'} defaultValue={projectData?.machineProjectName ?? ''} />
            )}
            <IconButton
              onClick={() => {
                if (isEditing) {
                  const projectNameInputElement = document.getElementById('projectNameInput') as HTMLInputElement

                  handleChangeProjectName(projectNameInputElement.value)
                }

                setIsEditing(prev => !prev)
              }}
            >
              <i className='tabler-pencil' />
            </IconButton>
          </div>

          <Button
            variant='contained'
            color='error'
            onClick={() => {
              setShowDeleteModal(true)
            }}
          >
            삭제
          </Button>
        </div>

        <CardContent>
          <TabContext value={value}>
            <TabList onChange={handleChange} aria-label='nav tabs example'>
              <Tab value='1' label='현장정보' />
              <Tab value='2' label='점검일정 / 참여기술진' />
              <Tab value='3' label='설비목록' />
              <Tab value='4' label='전체사진' />
              <Tab value='5' label='특이사항' />
            </TabList>
            <TabPanel value='1'>
              {projectData ? (
                <SiteInfoContent projectData={projectData} reloadData={getProjectData} />
              ) : (
                <Typography>프로젝트 정보를 불러오는 중입니다.</Typography>
              )}
            </TabPanel>
            <TabPanel value='2'>
              {scheduleData && engineerOption ? (
                <PlanContent
                  scheduleData={scheduleData}
                  reloadData={async () => {
                    getEngineerList()
                    getScheduleData()
                  }}
                />
              ) : (
                <Typography>점검일정 및 참여기술진 정보를 불러오는 중입니다.</Typography>
              )}
            </TabPanel>
            <TabPanel value='3'>
              <MachineContent machineProjectId={machineProjectId} />
            </TabPanel>
            <TabPanel value='4'>
              <MachinePictures id={machineProjectId} />
            </TabPanel>
            <TabPanel value='5'>
              {projectData ? (
                <NoteContent id={machineProjectId} projectData={projectData} />
              ) : (
                <Typography>특이사항 정보를 불러오는 중입니다.</Typography>
              )}
            </TabPanel>
          </TabContext>
        </CardContent>
      </Card>
      {showDeleteModal && (
        <DefaultModal
          size='xs'
          open={showDeleteModal}
          setOpen={setShowDeleteModal}
          title={'정말 삭제하시겠습니까?'}
          headerDescription='삭제 후에는 되돌리지 못합니다.'
          primaryButton={
            <Button variant='contained' color='error' onClick={handleDelete} type='submit'>
              삭제
            </Button>
          }
          secondaryButton={
            <Button variant='tonal' color='secondary' type='reset' onClick={() => setShowDeleteModal(false)}>
              취소
            </Button>
          }
        />
      )}
    </Providers>
  )
}

export default MachineUpdatePage
