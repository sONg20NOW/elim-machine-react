'use client'

import type { Dispatch, SetStateAction } from 'react'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Box, Button, CircularProgress, IconButton, InputLabel, TextField, Typography } from '@mui/material'

import axios from 'axios'

import { useForm } from 'react-hook-form'

import type {
  MachineInspectionPageResponseDtoType,
  MachineProjectResponseDtoType,
  MachineProjectScheduleAndEngineerResponseDtoType,
  successResponseDtoType
} from '@/app/_type/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import MobileHeader from '../../_components/MobileHeader'
import { auth } from '@/lib/auth'
import { isMobileContext } from '@/app/_components/ProtectedPage'
import ProjectInfoCard from './_components/ProjectInfoCard'

export const IsEditingContext = createContext<{ isEditing: boolean; setIsEditing: Dispatch<SetStateAction<boolean>> }>({
  isEditing: false,
  setIsEditing: () => null
})

export interface projectSummaryType {
  machineProjectName: string | null
  beginDate: string | null
  endDate: string | null
  engineerNames: string[] | null
}

interface ProjectFormType {
  machineProjectName: string | null
  requirement: string | null
  note: string | null
}

const CheckDetailPage = () => {
  const router = useRouter()

  const params = useParams()
  const machineProjectId = params?.id as string

  const isMobile = useContext(isMobileContext)

  // ! 대표 이미지, 마지막 업로드 추가
  const [projectSummaryData, setProjectSummaryData] = useState<projectSummaryType | undefined>(
    localStorage.getItem('projectSummary') !== null ? JSON.parse(localStorage.getItem('projectSummary')!) : undefined
  )

  const versionRef = useRef(0)

  const [inspectionCnt, setInspectionCnt] = useState(0)
  const [dotCnt, setDotCnt] = useState(0)

  const {
    register,
    formState: { isSubmitting, isDirty },
    handleSubmit,
    reset
  } = useForm<ProjectFormType>()

  useEffect(() => {
    if (projectSummaryData) return

    const dotIntervalId = setInterval(() => {
      setDotCnt(prev => (prev > 3 ? 0 : prev + 1))
    }, 1000)

    return () => {
      clearInterval(dotIntervalId)
    }
  }, [projectSummaryData])

  // 현장정보 불러오기
  const getProjectData = useCallback(async () => {
    try {
      const response = await axios.get<{ data: MachineProjectResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}`
      )

      return response.data.data
    } catch (error) {
      handleApiError(error, '프로젝트 정보를 불러오는 데 실패했습니다.')
    }
  }, [machineProjectId])

  // 설비 개수 불러오기
  const getInspectionCnt = useCallback(async () => {
    try {
      const response = await auth.get<{ data: successResponseDtoType<MachineInspectionPageResponseDtoType> }>(
        `/api/machine-projects/${machineProjectId}/machine-inspections`
      )

      return response.data.data.page.totalElements
    } catch (error) {
      handleApiError(error, '설비개수를 불러오는 데 실패했습니다.')

      return 0
    }
  }, [machineProjectId])

  // 점검일정/참여기술진 정보 불러오기
  const getScheduleData = useCallback(async () => {
    try {
      const response = await axios.get<{ data: MachineProjectScheduleAndEngineerResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/schedule-tab`
      )

      return response.data.data
    } catch (error) {
      handleApiError(error, '점검일정/참여기술진 정보를 불러오는 데 실패했습니다.')
    }
  }, [machineProjectId])

  const getProjectSummaryData = useCallback(async () => {
    const projectData = await getProjectData()
    const scheduleData = await getScheduleData()

    if (!(projectData && scheduleData)) return

    const { version, machineProjectName } = projectData
    const { beginDate, endDate, engineers } = scheduleData

    versionRef.current = version ?? 0

    setProjectSummaryData({
      machineProjectName: machineProjectName,
      beginDate: beginDate,
      endDate: endDate,
      engineerNames: engineers.map(v => v.engineerName)
    })

    setInspectionCnt(await getInspectionCnt())

    reset(projectData)
  }, [getProjectData, getScheduleData, getInspectionCnt, reset])

  // projectData와 scheduleData 중 썸네일에 필요한 정보를 projectSummaryData에 저장.
  useEffect(() => {
    getProjectSummaryData()
  }, [getProjectSummaryData])

  // projectSummaryData가 바뀔 때마다 localStorage에 저장.
  useEffect(() => {
    if (projectSummaryData) {
      localStorage.setItem('projectSummary', JSON.stringify(projectSummaryData))
    }
  }, [projectSummaryData])

  // ! api 하나로 통일
  const handleSave = useCallback(
    async (data: ProjectFormType) => {
      try {
        const response1 = await auth.put<{ data: { version: number } }>(`/api/machine-projects/${machineProjectId}`, {
          requirement: data.requirement,
          version: versionRef.current
        })

        versionRef.current = response1.data.data.version
        reset({ requirement: data.requirement })

        const response2 = await auth.put<{ data: { version: number } }>(
          `/api/machine-projects/${machineProjectId}/note`,
          { version: versionRef.current, note: data.note }
        )

        versionRef.current = response2.data.data.version
        reset({ note: data.note })

        // ! name은 version 반환을 안함..
        const response3 = await auth.put<{ data: { version: number } }>(
          `/api/machine-projects/${machineProjectId}/name`,
          {
            version: versionRef.current,
            name: data.machineProjectName
          }
        )

        versionRef.current = response3.data.data.version
        reset({ machineProjectName: data.machineProjectName })

        setProjectSummaryData(
          prev =>
            prev && {
              ...prev,
              machineProjectName: data.machineProjectName,
              requirement: data.requirement,
              note: data.note
            }
        )
        handleSuccess('변경사항이 저장되었습니다.')
      } catch (err) {
        handleApiError(err)
      }
    },
    [machineProjectId, reset]
  )

  // ! 마지막 업로드 정보 추가되면 추가, 실제 이미지로 변경.
  // ! 설비목록 실제로 받아오기.
  return (
    <form onSubmit={handleSubmit(data => handleSave(data))}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
        <MobileHeader
          left={
            <IconButton
              sx={{ p: 0 }}
              onClick={() => {
                router.back()
                localStorage.removeItem('projectSummary')
              }}
            >
              <i className='tabler-chevron-left text-white text-3xl' />
            </IconButton>
          }
          title='현장정보'
          right={
            <IconButton sx={{ p: 0 }} type='submit' disabled={isSubmitting || !isDirty}>
              {isDirty ? (
                <i className=' tabler-device-floppy text-white text-3xl animate-ring ' />
              ) : (
                <i className='tabler-device-floppy text-white text-3xl' />
              )}
            </IconButton>
          }
        />

        {projectSummaryData ? (
          <>
            <ProjectInfoCard canChange projectSummaryData={projectSummaryData} />
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <Box
                sx={{
                  py: !isMobile ? 10 : 4,
                  px: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: !isMobile ? 6 : 2
                }}
              >
                <div className='flex flex-col gap-1'>
                  <InputLabel sx={{ px: 2 }}>현장명</InputLabel>
                  <TextField
                    size={isMobile ? 'small' : 'medium'}
                    id='machineProjectName'
                    {...register('machineProjectName')}
                    fullWidth
                    hiddenLabel
                    slotProps={{ input: { sx: { fontSize: 18 } } }}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <InputLabel sx={{ px: 2 }}>관리주체 요청사항</InputLabel>
                  <TextField
                    size={isMobile ? 'small' : 'medium'}
                    id='requirement'
                    {...register('requirement')}
                    fullWidth
                    hiddenLabel
                    multiline
                    slotProps={{ input: { sx: { fontSize: 18 } } }}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <InputLabel sx={{ px: 2 }}>특이사항</InputLabel>
                  <TextField
                    size={isMobile ? 'small' : 'medium'}
                    id='note'
                    {...register('note')}
                    fullWidth
                    hiddenLabel
                    multiline
                    slotProps={{ input: { sx: { fontSize: 18 } } }}
                  />
                </div>
              </Box>
            </Box>
            <Box sx={{ py: 5, px: 8, boxShadow: 5 }}>
              <Button
                size={'large'}
                variant='contained'
                type='button'
                fullWidth
                sx={{ padding: !isMobile ? 4 : 2, fontSize: 20 }}
                onClick={() => router.push(`/check/${machineProjectId}/inspections`)}
              >
                설비목록 ({inspectionCnt})
              </Button>
            </Box>{' '}
          </>
        ) : (
          <Box height={'100%'} sx={{ display: 'grid', placeItems: 'center' }}>
            <div className='flex flex-col items-center gap-5'>
              <Typography>
                현장정보를 가지고 오고 있습니다
                {new Array(dotCnt)
                  .fill('.')
                  .map((v, idx) => (idx === 3 ? '!' : v))
                  .join('')}
              </Typography>
              <CircularProgress />
            </div>
          </Box>
        )}
      </Box>
    </form>
  )
}

export default CheckDetailPage
