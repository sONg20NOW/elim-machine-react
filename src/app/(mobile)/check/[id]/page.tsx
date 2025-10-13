'use client'

import type { Dispatch, SetStateAction } from 'react'
import { createContext, useCallback, useEffect, useRef, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Box, Button, IconButton, InputLabel, TextField, Typography } from '@mui/material'

import axios from 'axios'

import { useForm } from 'react-hook-form'

import { toast } from 'react-toastify'

import type { MachineProjectResponseDtoType, MachineProjectScheduleAndEngineerResponseDtoType } from '@/app/_type/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import MobileHeader from '../../_components/MobileHeader'
import { auth } from '@/lib/auth'

export const IsEditingContext = createContext<{ isEditing: boolean; setIsEditing: Dispatch<SetStateAction<boolean>> }>({
  isEditing: false,
  setIsEditing: () => null
})

export interface thumbnailType {
  machineProjectName: string
  beginDate: string
  endDate: string
  engineerNames: string[]
}

const CheckDetailPage = () => {
  const router = useRouter()

  const params = useParams()
  const machineProjectId = params?.id as string

  const [projectData, setProjectData] = useState<MachineProjectResponseDtoType>()
  const [scheduleData, setScheduleData] = useState<MachineProjectScheduleAndEngineerResponseDtoType>()

  // ! 대표 이미지, 마지막 업로드 추가
  const [thumbnailData, setThumbnailData] = useState<thumbnailType>()

  // 1. 카메라로 찍은 이미지 URL을 저장할 상태 추가
  const [customBackgroundImage, setCustomBackgroundImage] = useState<string | null>(null)

  // 2. 숨겨진 <input type="file">에 접근하기 위한 ref 추가
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    formState: { isSubmitting },
    handleSubmit,
    reset
  } = useForm({
    defaultValues: {
      machineProjectName: '',
      requirement: '',
      note: ''
    }
  })

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

  useEffect(() => {
    getProjectData()
  }, [getProjectData])

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

  useEffect(() => {
    getScheduleData()
  }, [getScheduleData])

  // projectData와 scheduleData 중 썸네일에 필요한 정보를 thumbnailData에 저장.
  useEffect(() => {
    if (!projectData || !scheduleData) return
    const { machineProjectName } = projectData
    const { engineers, beginDate, endDate } = scheduleData

    setThumbnailData({ machineProjectName, engineerNames: engineers.map(v => v.engineerName), beginDate, endDate })
  }, [projectData, scheduleData])

  // thumbnailData가 바뀔 때마다 localStorage에 저장.
  useEffect(() => {
    localStorage.setItem('thumbnail', JSON.stringify(thumbnailData))
  }, [thumbnailData])

  useEffect(() => {
    reset({
      machineProjectName: projectData?.machineProjectName ?? '',
      requirement: projectData?.requirement ?? '',
      note: projectData?.note ?? ''
    })
  }, [projectData, reset])

  // ! api 하나로 통일
  const handleSave = useCallback(
    async (data: { machineProjectName: string; requirement: string; note: string }) => {
      try {
        if (!projectData) throw new Error()

        const { machineProjectName, requirement, note } = projectData
        const original = { machineProjectName, requirement, note }

        if (JSON.stringify(original) === JSON.stringify(data)) {
          toast.error('변경사항이 없습니다.', { autoClose: 1000 })

          return
        }

        const response = await auth.put<{ data: { version: number } }>(`/api/machine-projects/${machineProjectId}`, {
          ...projectData,
          requirement: data.requirement
        })

        await auth.put<{ data: { version: number } }>(`/api/machine-projects/${machineProjectId}/name`, {
          version: response.data.data.version,
          name: data.machineProjectName
        })

        const finalRes = await auth.put<{ data: { version: number } }>(
          `/api/machine-projects/${machineProjectId}/note`,
          {
            version: response.data.data.version + 1,
            note: data.note
          }
        )

        setProjectData(prev => ({
          ...prev,
          machineProjectName: data.machineProjectName,
          requirement: data.requirement,
          note: data.note,
          version: finalRes.data.data.version
        }))
        handleSuccess('변경사항이 저장되었습니다.')
      } catch (err) {
        handleApiError(err)
      }
    },
    [machineProjectId, projectData]
  )

  // 3. 카메라 버튼 클릭 핸들러: 숨겨진 <input type="file">을 클릭
  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  // 4. 이미지 파일 변경 핸들러: 찍은 사진을 읽어 배경 이미지로 설정
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      // 이전에 생성된 객체 URL이 있다면 메모리 누수를 막기 위해 해제 (Optional)
      if (customBackgroundImage) {
        URL.revokeObjectURL(customBackgroundImage)
      }

      // 새 파일의 객체 URL을 생성하여 상태에 저장
      const newImageUrl = URL.createObjectURL(file)

      setCustomBackgroundImage(newImageUrl)
      toast.success('대표 이미지가 변경되었습니다.')
    }
  }

  // 배경 이미지를 결정하는 유틸리티 함수
  const getBackgroundImageStyle = () => {
    // 5. customBackgroundImage가 있으면 그 URL을 사용하고, 없으면 기본 이미지를 사용
    const imageUrl = customBackgroundImage || '/images/pipe_info.png'

    // 배경 이미지 위에 어두운 오버레이를 유지하기 위해 linear-gradient와 결합
    return `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(${imageUrl})`
  }

  // ! 마지막 업로드 정보 추가되면 추가, 실제 이미지로 변경.
  // ! 설비목록 실제로 받아오기.
  return (
    <form onSubmit={handleSubmit(data => handleSave(data))}>
      {/* 6. 숨겨진 파일 입력 요소 (카메라 접근용) */}
      <input
        type='file'
        accept='image/*' // 이미지 파일만 허용
        capture='environment' // 모바일에서 후면 카메라를 우선적으로 사용하도록 지정
        ref={cameraInputRef}
        onChange={handleImageChange}
        style={{ display: 'none' }} // 화면에서 숨김
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <MobileHeader
          left={
            <IconButton onClick={() => router.back()}>
              <i className='tabler-chevron-left text-white text-3xl' />
            </IconButton>
          }
          title='현장정보'
          right={
            <div className='flex gap-4'>
              <Button
                variant='contained'
                type='submit'
                sx={{ boxShadow: 3, backgroundColor: 'white', color: 'gray' }}
                disabled={isSubmitting}
              >
                저장
              </Button>
              <IconButton
                type='button'
                onClick={handleCameraClick} // 7. 버튼 클릭 시 카메라 핸들러 호출
                sx={{
                  backgroundColor: 'white',
                  color: 'gray',
                  boxShadow: 3,
                  ':focus': { backgroundColor: 'lightgray !important' }
                }}
              >
                <i className='tabler-camera' />
              </IconButton>
            </div>
          }
        />

        <Box
          sx={{
            height: 200,
            width: 'full',

            // 8. customBackgroundImage 상태에 따라 배경 이미지 변경
            backgroundImage: getBackgroundImageStyle(),
            backgroundSize: 'cover',
            backgroundPosition: 'center',

            // backgroundBlendMode: 'normal',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            color: 'white',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            fontSize: 18,
            fontWeight: 500,
            boxShadow: 5
          }}
        >
          <Typography variant='inherit' sx={{ fontWeight: 600, fontSize: 24 }}>
            {thumbnailData?.machineProjectName ?? '현장명'}
          </Typography>
          <div className='flex flex-col gap-1 items-center'>
            <Typography
              width={'fit-content'}
              variant='inherit'
            >{`${thumbnailData?.beginDate ?? '시작날짜'} ~ ${thumbnailData?.endDate?.slice(5) ?? '종료날짜'}`}</Typography>
            <Typography width={'fit-content'} variant='inherit'>
              {(thumbnailData?.engineerNames.length ?? 0) > 2
                ? `${thumbnailData?.engineerNames
                    .slice(0, 2)
                    .join(', ')} 외 ${thumbnailData!.engineerNames.length - 2}명`
                : thumbnailData?.engineerNames
                  ? thumbnailData?.engineerNames.join(', ')
                  : '배정된 점검진 없음'}
            </Typography>
            <Typography width={'fit-content'} variant='inherit'>
              마지막 업로드: {'없음'}
            </Typography>
          </div>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Box sx={{ p: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className='flex flex-col gap-1'>
              <InputLabel sx={{ px: 2 }}>현장명</InputLabel>
              <TextField
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
            size='large'
            variant='contained'
            type='button'
            fullWidth
            sx={{ padding: 4, fontSize: 20 }}
            onClick={() => router.push(`/check/${machineProjectId}/inspections`)}
          >
            설비목록 ({2})
          </Button>
        </Box>
      </Box>
    </form>
  )
}

export default CheckDetailPage
