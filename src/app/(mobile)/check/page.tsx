'use client'

// React Imports
import { useEffect, useState, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'

import axios from 'axios'

// Component Imports
import { Box, Pagination, Typography, useMediaQuery, useTheme } from '@mui/material'

import classNames from 'classnames'

import type { MachineProjectPageDtoType, successResponseDtoType } from '@/app/_type/types'
import { handleApiError } from '@/utils/errorHandler'
import MobileFooter from '../_components/MobileFooter'
import MobileHeader from '../_components/MobileHeader'
import SearchBar from '@/app/_components/SearchBar'

export default function MachinePage() {
  const router = useRouter()

  const [data, setData] = useState<MachineProjectPageDtoType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const disabled = loading || error

  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [projectName, setProjectName] = useState('')

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)

  const [myProject, setMyProject] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // ! 나중에 accessToken 디코딩해서 실제 정보로
  const currentUser = {
    name: '테스트슈퍼관리자20',
    gradeDescription: '보조',
    engineerLicenseNum: '259-1004',
    companyName: '엘림주식회사(주)'
  }

  // 기계설비현장 리스트 호출 API 함수
  const getFilteredData = useCallback(async () => {
    setLoading(true)
    setError(false)

    // 데이터 페치에 사용되는 쿼리 URL
    const queryParams = new URLSearchParams()

    try {
      projectName ? queryParams.set('projectName', projectName) : queryParams.delete('projectName')
      myProject ? queryParams.set('engineerName', currentUser.name) : queryParams.delete('engineerName')

      queryParams.set('page', page.toString())
      queryParams.set('size', size.toString())

      const response = await axios.get<{
        data: successResponseDtoType<MachineProjectPageDtoType[]>
      }>(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects?${queryParams.toString()}`)

      const result = response.data.data

      setData(result.content ?? [])
      setPage(result.page.number)
      setSize(result.page.size)
      setTotalElements(result.page.totalElements)
      setTotalPages(result.page.totalPages)
    } catch (error) {
      handleApiError(error, '필터링된 데이터를 불러오는 데 실패했습니다.')
      setError(true)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line
  }, [page, size, projectName, myProject])

  // 필터 변경 시 API 호출
  useEffect(() => {
    getFilteredData()
  }, [getFilteredData])

  // 기계설비현장 선택 핸들러
  const handleMachineProjectClick = async (machineProject: MachineProjectPageDtoType) => {
    if (!machineProject?.machineProjectId) return

    try {
      router.push(`/check/${machineProject.machineProjectId}`)
    } catch (error) {
      handleApiError(error, '프로젝트 정보를 불러오는 데 실패했습니다.')
    }
  }

  // 기계설비현장 카드 목록
  function MachineProjectCard({ machineProject }: { machineProject: MachineProjectPageDtoType }) {
    const engineerCnt = machineProject.engineerNames.length

    return (
      <Card
        sx={{ mb: 5, display: 'flex', gap: 5 }}
        elevation={10}
        onClick={() => handleMachineProjectClick(machineProject)}
      >
        <i className={classNames('tabler-photo', { 'text-[180px]': !isMobile, 'text-[130px]': isMobile })} />
        <Box sx={{ display: 'flex', flexDirection: 'column', px: 5, py: 10, gap: 3 }}>
          <Typography variant={isMobile ? 'h6' : 'h4'} sx={{ fontWeight: 600 }}>
            {machineProject.machineProjectName !== '' ? machineProject.machineProjectName : '이름없는 현장'}
          </Typography>
          <div className='flex flex-col gap-2'>
            <Typography sx={{ fontWeight: 500 }}>
              {machineProject.fieldBeginDate &&
                machineProject.fieldEndDate &&
                `${machineProject.fieldBeginDate} ~ ${machineProject.fieldEndDate.slice(5)}`}
            </Typography>
            <Typography>
              {engineerCnt > 2
                ? machineProject.engineerNames
                    .slice(0, 2)
                    .join(', ')
                    .concat(`외 ${engineerCnt - 2}명`)
                : machineProject.engineerNames.join(', ')}
            </Typography>
          </div>
        </Box>
      </Card>
    )
  }

  // 전체 현장 / 나의 현장 토글 버튼
  const ProjectToggle = () => (
    <Box
      sx={{
        border: '1px solid lightgray',
        borderRadius: isMobile ? 1 : 10,
        p: 1,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        position: 'relative',
        backgroundColor: 'white'
      }}
    >
      <Card
        sx={{
          position: 'absolute',
          backgroundColor: 'primary.main',
          borderRadius: isMobile ? 1 : 10,
          width: isMobile ? '90%' : '47%',
          height: isMobile ? '45%' : '80%'
        }}
        className={
          isMobile
            ? `left-1 top-[50%] -translate-y-1/2 ${!myProject ? '-translate-y-full' : 'translate-y-0'}`
            : `transition-transform duration-300 ease-in-out left-[50%] top-[50%] -translate-y-1/2 ${
                !myProject ? '-translate-x-full' : '-translate-x-0'
              }`
        }
      />
      <Button
        onClick={() => setMyProject(false)}
        sx={!myProject ? { color: 'white', boxShadow: 2, borderRadius: isMobile ? 1 : 10 } : { color: 'primary.main' }}
      >
        전체 현장
      </Button>
      <Button
        onClick={() => setMyProject(true)}
        sx={myProject ? { color: 'white', boxShadow: 2, borderRadius: isMobile ? 1 : 10 } : { color: 'primary.main' }}
      >
        나의 현장
      </Button>
    </Box>
  )

  return (
    <>
      {/* Drawer */}

      {/* 렌더링 될 화면 */}
      <Box className='flex flex-col w-full' sx={{ height: '100vh' }}>
        <MobileHeader
          left={<>{!isMobile && <ProjectToggle />}</>}
          title={`${myProject ? '내 현장' : '현장 목록'}(${totalElements})`}
          right={
            isMobile ? (
              <ProjectToggle />
            ) : (
              <SearchBar
                placeholder='현장명으로 검색'
                setSearchKeyword={projectName => {
                  setProjectName(projectName)
                  setPage(0)
                }}
                disabled={disabled}
              />
            )
          }
        />
        {/* 카드 리스트 */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 5
          }}
        >
          {data.map(machineProject => (
            <MachineProjectCard key={machineProject.machineProjectId} machineProject={machineProject} />
          ))}
        </Box>

        <Pagination
          sx={{ alignSelf: 'center' }}
          count={totalPages}
          page={page + 1}
          onChange={(_, value) => setPage(value - 1)}
          showFirstButton
          showLastButton
        />
        <MobileFooter />
      </Box>
    </>
  )
}
