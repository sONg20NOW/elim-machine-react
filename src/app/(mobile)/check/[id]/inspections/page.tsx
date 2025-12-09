'use client'

import { memo, useCallback, useContext, useEffect, useRef, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Box, Card, IconButton, Pagination, Typography } from '@mui/material'

import MobileHeader from '@/app/(mobile)/_components/MobileHeader'
import type {
  MachineInspectionPageResponseDtoType,
  machineProjectEngineerDetailDtoType,
  successResponseDtoType
} from '@core/types'
import { auth } from '@core/utils/auth'
import AddInspectionModal from '../_components/AddInspectionModal'
import { isMobileContext } from '@/components/ProtectedPage'
import ProjectInfoCard from '../_components/ProjectInfoCard'
import useProjectSummaryStore from '@core/utils/useProjectSummaryStore'
import { printErrorSnackbar } from '@core/utils/snackbarHandler'

export interface inspectionSummaryType {
  machineProjectName: string
  machineProjectId: string
  beginDate: string
  endDate: string
  engineerNames: string[]
}

export default function InspectionsPage() {
  const params = useParams()
  const machineProjectId = params?.id as string

  const router = useRouter()

  const isMobile = useContext(isMobileContext)

  const [inspections, setInspections] = useState<MachineInspectionPageResponseDtoType[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const disabled = loading || error

  // 페이지네이션
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)

  // 페이지 변경 시 스크롤 업을 위한 Ref
  const listRef = useRef<HTMLDivElement>(null)

  // 설비 추가 모달
  const [participatedEngineerList, setParticipatedEngineerList] = useState<machineProjectEngineerDetailDtoType[]>()

  const projectSummaryData = useProjectSummaryStore(set => set.projectSummary)

  useEffect(() => {
    // 해당 페이지에 접속했는데 localStorage에 정보가 없다면 뒤로 가기
    if (!projectSummaryData) router.back()
  }, [projectSummaryData, router])

  // 참여기술진 목록 가져오기
  const getParticipatedEngineerList = useCallback(async () => {
    try {
      const response = await auth.get<{
        data: { machineProjectEngineerResponseDtos: machineProjectEngineerDetailDtoType[] }
      }>(`/api/machine-projects/${machineProjectId}/machine-project-engineers`)

      setParticipatedEngineerList(response.data.data.machineProjectEngineerResponseDtos)
    } catch (error) {
      printErrorSnackbar(error)
    }
  }, [machineProjectId])

  useEffect(() => {
    if (!participatedEngineerList) {
      getParticipatedEngineerList()
    }
  }, [getParticipatedEngineerList, participatedEngineerList])

  // 데이터 불러오기
  const getFilteredInspectionList = useCallback(async () => {
    const queryParams = new URLSearchParams()

    setLoading(true)
    setError(false)

    try {
      queryParams.set('page', page.toString())
      queryParams.set('size', size.toString())

      // axios GET 요청
      const response = await auth.get<{ data: successResponseDtoType<MachineInspectionPageResponseDtoType[]> }>(
        `/api/machine-projects/${machineProjectId}/machine-inspections?${queryParams.toString()}`
      )

      const result = response.data.data

      // 상태 업데이트 (engineernames만 따로 빼서)
      setInspections(result.content ?? [])
      if (page !== result.page.number) setPage(result.page.number)
      if (size !== result.page.size) setSize(result.page.size)
      setTotalElements(result.page.totalElements)
      setTotalPages(result.page.totalPages)

      // 페이지가 바뀔 떄마다 맨 위 스크롤로
      if (listRef.current) {
        listRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      printErrorSnackbar(error, '데이터 조회에 실패했습니다.')
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [page, size, machineProjectId])

  useEffect(() => {
    getFilteredInspectionList()
  }, [getFilteredInspectionList])

  // 설비 선택 핸들러
  const handleInspectionClick = async (inspection: MachineInspectionPageResponseDtoType) => {
    if (!inspection?.machineInspectionId) return
    router.push(`/check/${machineProjectId}/inspections/${inspection?.machineInspectionId}`)
  }

  // 설비 카드 컴포넌트
  const InspectionInfoCard = memo(({ inspection }: { inspection: MachineInspectionPageResponseDtoType }) => {
    const engineerCnt = inspection.engineerNames.length

    return (
      <Card
        sx={{ mb: 5, display: 'flex', gap: !isMobile ? 5 : 0 }}
        elevation={10}
        onClick={() => handleInspectionClick(inspection)}
      >
        <div className='flex-1'>
          <i className='tabler-photo-bolt w-full h-full' />
        </div>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            px: !isMobile ? 5 : 2,
            py: !isMobile ? 10 : 5,
            gap: !isMobile ? 3 : 1,
            flex: !isMobile ? 3 : 2
          }}
        >
          <Typography variant={isMobile ? 'h6' : 'h4'} sx={{ fontWeight: 600 }}>
            {inspection.machineInspectionName ?? '이름없는 설비'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: !isMobile ? 2 : 0 }}>
            {inspection.checkDate && inspection.checkDate !== '' ? (
              <Typography sx={{ fontWeight: 500 }}>{inspection.checkDate}</Typography>
            ) : (
              <Typography sx={{ color: 'lightgray' }}>점검날짜</Typography>
            )}
            {inspection.location && inspection.location !== '' ? (
              <Typography sx={{ fontWeight: 500 }}>{inspection.location}</Typography>
            ) : (
              <Typography sx={{ color: 'lightgray' }}>점검위치</Typography>
            )}
            <Typography>
              {engineerCnt > 2
                ? inspection.engineerNames
                    .slice(0, 2)
                    .join(', ')
                    .concat(`외 ${engineerCnt - 2}명`)
                : engineerCnt === 0
                  ? '배정된 점검진 없음'
                  : inspection.engineerNames.join(', ')}
            </Typography>
          </Box>
        </Box>
      </Card>
    )
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <MobileHeader
        left={
          <IconButton sx={{ p: 0 }} onClick={() => router.back()}>
            <i className='tabler-chevron-left text-white text-3xl' />
          </IconButton>
        }
        title={`설비목록(${totalElements})`}
        right={
          participatedEngineerList && (
            <AddInspectionModal
              disabled={disabled}
              getFilteredInspectionList={getFilteredInspectionList}
              machineProjectId={machineProjectId}
            />
          )
        }
      />

      <ProjectInfoCard machineProjectId={machineProjectId} projectSummaryData={projectSummaryData} />
      {/* 스크롤이 생기는 메인 영역 */}
      <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto', p: 5 }}>
        {inspections.length > 0 ? (
          inspections.map(inspection => (
            <InspectionInfoCard key={inspection.machineInspectionId} inspection={inspection} />
          ))
        ) : (
          <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
            <div className='flex flex-col gap-3 items-center'>
              <Typography variant='h5'>해당 프로젝트에는 설비가 존재하지 않습니다.</Typography>
              <Typography>우측 상단 + 버튼으로 추가해주세요.</Typography>
            </div>
          </Box>
        )}
      </Box>
      <Pagination
        sx={{ alignSelf: 'center', py: 1 }}
        count={totalPages}
        page={page + 1}
        onChange={(_, value) => setPage(value - 1)}
        showFirstButton
        showLastButton
      />
    </Box>
  )
}
