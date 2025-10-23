'use client'

import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Box, Card, IconButton, Pagination, Typography } from '@mui/material'

import MobileHeader from '@/app/(mobile)/_components/MobileHeader'
import { handleApiError } from '@/utils/errorHandler'
import type {
  MachineInspectionPageResponseDtoType,
  MachineCategoryResponseDtoType,
  machineProjectEngineerDetailDtoType,
  successResponseDtoType
} from '@/@core/types'
import { auth } from '@/lib/auth'
import type { projectSummaryType } from '../page'
import AddInspectionModal from '../_components/AddInspectionModal'
import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import ProjectInfoCard from '../_components/ProjectInfoCard'

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
  const [open, setOpen] = useState(false)
  const [categoryList, setCategoryList] = useState<MachineCategoryResponseDtoType[]>()
  const [participatedEngineerList, setParticipatedEngineerList] = useState<machineProjectEngineerDetailDtoType[]>()

  // 해당 페이지에 접속했는데 localStorage에 정보가 없다면 뒤로 가기
  if (!localStorage.getItem('projectSummary')) router.back()

  // ! 로컬 스토리지에서 데이터 가져오기
  const projectSummaryData: projectSummaryType = JSON.parse(localStorage.getItem('projectSummary')!)

  // 카테고리 목록 가져오기
  const getCategoryList = useCallback(async () => {
    try {
      const response = await auth.get<{ data: { machineCategoryResponseDtos: MachineCategoryResponseDtoType[] } }>(
        `/api/machine-categories`
      )

      setCategoryList(response.data.data.machineCategoryResponseDtos)
    } catch (error) {
      handleApiError(error)
    }
  }, [])

  // 참여기술진 목록 가져오기
  const getParticipatedEngineerList = useCallback(async () => {
    try {
      const response = await auth.get<{
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
    if (!categoryList && open) {
      getCategoryList()
    }

    if (!participatedEngineerList && open) {
      getParticipatedEngineerList()
    }
  }, [open, getCategoryList, categoryList, getParticipatedEngineerList, participatedEngineerList])

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
      handleApiError(error, '데이터 조회에 실패했습니다.')
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
  function InspectionInfoCard({ inspection }: { inspection: MachineInspectionPageResponseDtoType }) {
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
            <Typography sx={{ fontWeight: 500 }}>{inspection.checkDate ?? '점검날짜'}</Typography>
            <Typography sx={{ fontWeight: 500 }}>{inspection.location ?? '설치위치'}</Typography>
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
  }

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
          <IconButton
            type='button'
            sx={{ boxShadow: 3, backgroundColor: 'white' }}
            disabled={disabled}
            onClick={() => setOpen(true)}
          >
            <i className='tabler-plus' />
          </IconButton>
        }
      />

      <ProjectInfoCard machineProjectId={machineProjectId} projectSummaryData={projectSummaryData} />
      {/* 스크롤이 생기는 메인 영역 */}
      <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto', p: 5 }}>
        {inspections.map(inspection => (
          <InspectionInfoCard key={inspection.machineInspectionId} inspection={inspection} />
        ))}
      </Box>
      <Pagination
        sx={{ alignSelf: 'center', py: 1 }}
        count={totalPages}
        page={page + 1}
        onChange={(_, value) => setPage(value - 1)}
        showFirstButton
        showLastButton
      />
      {open && categoryList && participatedEngineerList && (
        <AddInspectionModal
          open={open}
          setOpen={setOpen}
          machineProjectId={machineProjectId}
          getFilteredInspectionList={getFilteredInspectionList}
          categoryList={categoryList}
          participatedEngineerList={participatedEngineerList}
        />
      )}
    </Box>
  )
}
