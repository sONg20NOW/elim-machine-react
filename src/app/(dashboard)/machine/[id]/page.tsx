'use client'

import type { Dispatch, ReactNode, SetStateAction, SyntheticEvent } from 'react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { redirect, useParams, useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

import { Button, CardContent, IconButton, Tab, Typography, useMediaQuery } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import axios from 'axios'

import classNames from 'classnames'

import PictureListTabContent from './_components/PictureListTabContent'
import type {
  MachineCategoryResponseDtoType,
  MachineEngineerOptionListResponseDtoType,
  MachineEngineerOptionResponseDtoType,
  machineProjectEngineerDetailDtoType,
  MachineProjectResponseDtoType,
  MachineProjectScheduleAndEngineerResponseDtoType
} from '@/app/_type/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import CustomTextField from '@/@core/components/mui/TextField'
import DeleteModal from '@/app/_components/modal/DeleteModal'
import DisabledTabWithTooltip from '@/app/_components/DisabledTabWithTooltip'
import BasicTabContent from './_components/BasicTabContent'
import ScheduleAndEngineerTabContent from './_components/ScheduleAndEngineerTabContent'
import NoteTabContent from './_components/NoteTabContent'
import InspectionListContent from './_components/InspectionListContent'

export const ListsContext = createContext<{
  engineerList: MachineEngineerOptionResponseDtoType[]
  categoryList: MachineCategoryResponseDtoType[]
  participatedEngineerList: machineProjectEngineerDetailDtoType[]
  getParticipatedEngineerList: () => void
}>({
  engineerList: [],
  categoryList: [],
  participatedEngineerList: [],
  getParticipatedEngineerList: () => null
})

export const UseListsContext = () => {
  const context = useContext(ListsContext)

  if (!context) throw new Error()

  if (!context.engineerList || !context.categoryList || !context.participatedEngineerList) {
    throw new Error()
  }

  return context
}

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
  const isMobile = useMediaQuery('(max-width:600px)')
  const router = useRouter()

  const params = useParams()
  const machineProjectId = params?.id as string

  const [projectData, setProjectData] = useState<MachineProjectResponseDtoType>()
  const [scheduleData, setScheduleData] = useState<MachineProjectScheduleAndEngineerResponseDtoType>()
  const [engineerList, setEngineerList] = useState<MachineEngineerOptionResponseDtoType[]>([])
  const [categoryList, setCategoryList] = useState<MachineCategoryResponseDtoType[]>([])
  const [participatedEngineerList, setParticipatedEngineerList] = useState<machineProjectEngineerDetailDtoType[]>([])

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
  const getEngineerList = useCallback(async () => {
    try {
      const response = await axios.get<{ data: MachineEngineerOptionListResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers/options`
      )

      setEngineerList(response.data.data.engineers)
    } catch (error) {
      handleApiError(error)
    }
  }, [])

  useEffect(() => {
    getEngineerList()
  }, [getEngineerList])

  // 카테고리 목록 가져오기
  const getCategoryList = useCallback(async () => {
    try {
      const response = await axios.get<{ data: { machineCategoryResponseDtos: MachineCategoryResponseDtoType[] } }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-categories`
      )

      setCategoryList(response.data.data.machineCategoryResponseDtos)
    } catch (error) {
      handleApiError(error)
    }
  }, [])

  useEffect(() => {
    getCategoryList()
  }, [getCategoryList])

  // 해당 프로젝트에 참여 중인 기술진 목록 가져오기
  const getParticipatedEngineerList = useCallback(async () => {
    try {
      const response = await axios.get<{
        data: { machineProjectEngineerResponseDtos: machineProjectEngineerDetailDtoType[] }
      }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-project-engineers`
      )

      setParticipatedEngineerList(response.data.data.machineProjectEngineerResponseDtos)
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId])

  useEffect(() => {
    getParticipatedEngineerList()
  }, [getParticipatedEngineerList])

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
    <ListsContext.Provider
      value={{
        categoryList: categoryList,
        engineerList: engineerList,
        participatedEngineerList: participatedEngineerList,
        getParticipatedEngineerList: getParticipatedEngineerList
      }}
    >
      <IsEditingContext.Provider value={{ isEditing, setIsEditing }}>{children}</IsEditingContext.Provider>
    </ListsContext.Provider>
  )

  return (
    <Providers>
      <Card>
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
                <div className='flex'>
                  {!isEditingProjectName ? (
                    <Typography color='black' sx={{ fontSize: 25, fontWeight: 500 }}>
                      {projectData?.machineProjectName ?? ''}
                    </Typography>
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
              </div>
            }
            sx={{ cursor: 'pointer', padding: 0 }}
          />

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
                <BasicTabContent projectData={projectData} reloadData={getProjectData} />
              ) : (
                <Typography>프로젝트 정보를 불러오는 중입니다.</Typography>
              )}
            </TabPanel>
            <TabPanel value='점검일정/참여기술진'>
              {scheduleData && engineerList ? (
                <ScheduleAndEngineerTabContent
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
              <InspectionListContent machineProjectId={machineProjectId} />
            </TabPanel>
            <TabPanel value='전체사진'>
              <PictureListTabContent machineProjectId={machineProjectId} />
            </TabPanel>
            <TabPanel value='특이사항'>
              {projectData ? (
                <NoteTabContent id={machineProjectId} projectData={projectData} reloadData={getProjectData} />
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
