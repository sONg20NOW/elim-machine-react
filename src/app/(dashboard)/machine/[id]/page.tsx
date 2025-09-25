'use client'

import type { Dispatch, ReactNode, SetStateAction, SyntheticEvent } from 'react'
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
import CustomTextField from '@/@core/components/mui/TextField'
import DeleteModal from '@/app/_components/modal/DeleteModal'
import DisabledTabWithTooltip from '@/app/_components/DisabledTabWithTooltip'

export const EngineerListContext = createContext<MachineEngineerOptionResponseDtoType[]>([])

export const IsEditingContext = createContext<{ isEditing: boolean; setIsEditing: Dispatch<SetStateAction<boolean>> }>({
  isEditing: false,
  setIsEditing: () => null
})

const Tabs = [
  { value: '현장정보', label: '현장정보' },
  { value: '점검일정/참여기술진', label: '점검일정/참여기술진' },
  { value: '설비목록', label: '설비목록' },
  { value: '전체사진', label: '전체사진' },
  { value: '특이사항', label: '특이사항' }
]

const MachineUpdatePage = () => {
  const router = useRouter()

  const params = useParams()
  const machineProjectId = params?.id as string

  const [projectData, setProjectData] = useState<MachineProjectResponseDtoType>()
  const [scheduleData, setScheduleData] = useState<MachineProjectScheduleAndEngineerResponseDtoType>()
  const [engineerList, setEngineerList] = useState<MachineEngineerOptionResponseDtoType[]>()
  const [tabValue, setTabValue] = useState<string>('현장정보')

  const [isEditingProjectName, setIsEditingProjectName] = useState(false)
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

      setEngineerList(response.data.data.engineers)
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
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
      if (!engineerList) getEngineerList()

      switch (tabValue) {
        case '현장정보':
          if (!projectData) getProjectData()
          break
        case '점검일정/참여기술진':
          if (!scheduleData) getScheduleData()
          break
        default:
          break
      }
    }
  }, [machineProjectId, tabValue, getProjectData, getScheduleData, engineerList, projectData, scheduleData])

  const Providers = ({ children }: { children: ReactNode }) => (
    <EngineerListContext.Provider value={engineerList ?? []}>
      <IsEditingContext.Provider value={{ isEditing, setIsEditing }}>{children}</IsEditingContext.Provider>
    </EngineerListContext.Provider>
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
            {!isEditingProjectName ? (
              <CardHeader title={projectData?.machineProjectName ?? ''} sx={{ padding: 0 }} />
            ) : (
              <CustomTextField id={'projectNameInput'} defaultValue={projectData?.machineProjectName ?? ''} />
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

          <Button
            variant='contained'
            color='error'
            onClick={() => {
              setShowDeleteModal(true)
            }}
          >
            설비현장 삭제
          </Button>
        </div>

        <CardContent>
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
            <TabPanel value='현장정보'>
              {projectData ? (
                <SiteInfoContent projectData={projectData} reloadData={getProjectData} />
              ) : (
                <Typography>프로젝트 정보를 불러오는 중입니다.</Typography>
              )}
            </TabPanel>
            <TabPanel value='점검일정/참여기술진'>
              {scheduleData && engineerList ? (
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
            <TabPanel value='설비목록'>
              <MachineContent machineProjectId={machineProjectId} />
            </TabPanel>
            <TabPanel value='전체사진'>
              <MachinePictures machineProjectId={machineProjectId} />
            </TabPanel>
            <TabPanel value='특이사항'>
              {projectData ? (
                <NoteContent id={machineProjectId} projectData={projectData} reloadData={getProjectData} />
              ) : (
                <Typography>특이사항 정보를 불러오는 중입니다.</Typography>
              )}
            </TabPanel>
          </TabContext>
        </CardContent>
      </Card>
      {showDeleteModal && (
        <DeleteModal
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          onDelete={handleDelete}
        />
      )}
    </Providers>
  )
}

export default MachineUpdatePage
