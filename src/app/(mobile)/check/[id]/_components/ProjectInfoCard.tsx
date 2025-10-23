import { useRef, useState } from 'react'

import { useParams } from 'next/navigation'

import { Box, IconButton, Typography } from '@mui/material'

import { useQuery } from '@tanstack/react-query'

import type { projectSummaryType } from '../page'
import { QUERY_KEYS } from '@/app/_constants/queryKeys'
import { auth } from '@/lib/auth'

import type { MachineProjectOverviewPicReadResponseDtoType } from '@/@core/types'
import { uploadPictures } from '@/@core/utils/uploadInspectionPictures'

export default function ProjectInfoCard({
  projectSummaryData,
  machineProjectId,
  canChange = false
}: {
  projectSummaryData: projectSummaryType
  machineProjectId: string
  canChange?: boolean
}) {
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // 대표사진 URL 가져오기
  const { data: OverViewPic } = useQuery({
    queryKey: QUERY_KEYS.MACHINE_PROJECT_PIC.GET_OVERVIEW(machineProjectId),
    queryFn: async () =>
      await auth.get<{ data: { machineProjectPics: MachineProjectOverviewPicReadResponseDtoType[] } }>(
        `/api/machine-projects/${machineProjectId}/machine-project-pics/overview`
      ),
    select: data => data.data.data.machineProjectPics,
    placeholderData: prev => prev
  })

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      // 새 파일의 객체 URL을 생성하여 상태에 저장
      const newImageUrl = URL.createObjectURL(file)

      uploadPictures(machineProjectId, inspectionId)
    }
  }

  // 배경 이미지를 결정하는 유틸리티 함수
  const getBackgroundImageStyle = () => {
    // 5. customBackgroundImage가 있으면 그 URL을 사용하고, 없으면 기본 이미지를 사용
    const imageUrl = OverViewPic?.[-1].presignedUrl ?? '/images/safety114_logo.png'

    // 배경 이미지 위에 어두운 오버레이를 유지하기 위해 linear-gradient와 결합
    return `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(${imageUrl})`
  }

  return (
    <Box
      sx={{
        height: 200,
        width: 'full',
        position: 'relative',

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
        {projectSummaryData?.machineProjectName ?? '현장명'}
      </Typography>
      <div className='flex flex-col gap-1 items-center'>
        <Typography
          width={'fit-content'}
          variant='inherit'
        >{`${projectSummaryData?.beginDate ?? '시작날짜'} ~ ${projectSummaryData?.endDate?.slice(5) ?? '종료날짜'}`}</Typography>
        {projectSummaryData.engineerNames && (
          <Typography width={'fit-content'} variant='inherit'>
            {(projectSummaryData?.engineerNames.length ?? 0) > 2
              ? `${projectSummaryData?.engineerNames.slice(0, 2).join(', ')} 외 ${projectSummaryData!.engineerNames.length - 2}명`
              : projectSummaryData?.engineerNames.length
                ? projectSummaryData?.engineerNames.join(', ')
                : '배정된 점검진 없음'}
          </Typography>
        )}
        <Typography width={'fit-content'} variant='inherit'>
          마지막 업로드: {'없음'}
        </Typography>
      </div>
      {canChange && (
        <div className='absolute right-1 top-1'>
          <IconButton
            size='large'
            type='button'
            onClick={handleCameraClick} // 7. 버튼 클릭 시 카메라 핸들러 호출
            sx={{
              color: 'white',
              opacity: '90%'
            }}
          >
            <i className='tabler-camera' />
          </IconButton>
          <input
            type='file'
            accept='image/*' // 이미지 파일만 허용
            capture='environment' // 모바일에서 후면 카메라를 우선적으로 사용하도록 지정
            ref={cameraInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }} // 화면에서 숨김
          />
        </div>
      )}
    </Box>
  )
}
