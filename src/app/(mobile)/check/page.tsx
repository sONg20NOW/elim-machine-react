'use client'

// React Imports
import { useEffect, useState, useCallback, useRef, useContext } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'

import axios from 'axios'

// Component Imports
import {
  alpha,
  Box,
  Drawer,
  FormControlLabel,
  IconButton,
  Link,
  Pagination,
  styled,
  Switch,
  Typography
} from '@mui/material'

import type { MachineProjectPageDtoType, successResponseDtoType } from '@/app/_type/types'
import { handleApiError } from '@/utils/errorHandler'
import MobileHeader from '../_components/MobileHeader'
import SearchBar from '@/app/_components/SearchBar'
import { auth } from '@/lib/auth'
import { isMobileContext } from '@/app/_components/ProtectedPage'

export default function MachinePage() {
  const router = useRouter()

  const [data, setData] = useState<MachineProjectPageDtoType[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const disabled = loading || error

  // 페이지네이션
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)

  // 현장명 검색
  const [projectName, setProjectName] = useState('')

  // 전체현장 / 나의현장 토글
  const [myProject, setMyProject] = useState(false)

  const isMobile = useContext(isMobileContext)

  const [open, setOpen] = useState(false)

  // 페이지 변경 시 스크롤 업을 위한 Ref
  const listRef = useRef<HTMLDivElement>(null)

  // ! 나중에 accessToken 디코딩해서 실제 정보로
  const currentUser = {
    name: '테스트슈퍼관리자20',
    gradeDescription: '보조',
    engineerLicenseNum: '259-1004',
    companyName: '엘림주식회사(주)'
  }

  const CustomSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: '#593ca2d6',
      '&:hover': {
        backgroundColor: alpha('#ffffff82', theme.palette.action.hoverOpacity)
      }
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: '#ffffffff'
    }
  }))

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

      // 페이지가 바뀔 떄마다 맨 위 스크롤로
      if (listRef.current) {
        listRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      handleApiError(error, '필터링된 데이터를 불러오는 데 실패했습니다.')
      setError(true)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line
  }, [page, size, projectName, myProject])

  // API 호출
  useEffect(() => {
    getFilteredData()
  }, [getFilteredData])

  const handleLogout = async () => {
    try {
      // ! CSRF token 같이 넣어서 POST
      await auth.post(`/api/authentication/web/logout`)
    } catch (e) {
      handleApiError(e)
    } finally {
      localStorage.removeItem('accessToken')
      router.push('/login')
    }
  }

  // 기계설비현장 선택 핸들러
  const handleMachineProjectClick = async (machineProject: MachineProjectPageDtoType) => {
    if (!machineProject?.machineProjectId) return

    // ! 추후에 check/[id] 페이지에서 GET 할 때 가져오는 정보를 이용하도록.
    localStorage.setItem('inspectionCnt', machineProject.inspectionCount.toString())
    router.push(`/check/${machineProject.machineProjectId}`)
  }

  // 기계설비현장 카드
  function MachineProjectCard({ machineProject }: { machineProject: MachineProjectPageDtoType }) {
    const engineerCnt = machineProject.engineerNames.length

    return (
      <Card
        sx={{ mb: 5, display: 'flex', gap: !isMobile ? 5 : 0 }}
        elevation={10}
        onClick={() => handleMachineProjectClick(machineProject)}
      >
        <div className='w-fit flex-1'>
          <i className='tabler-photo w-full h-full' />
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
            {machineProject.machineProjectName !== '' ? machineProject.machineProjectName : '이름없는 현장'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: !isMobile ? 2 : 0 }}>
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
                : engineerCnt === 0
                  ? '배정된 점검진 없음'
                  : machineProject.engineerNames.join(', ')}
            </Typography>
          </Box>
        </Box>
      </Card>
    )
  }

  // 전체 현장 / 나의 현장 토글 버튼
  const ProjectToggle = () =>
    !isMobile ? (
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
        {myProject ? (
          <Card
            className='animate-slideRight'
            sx={{
              position: 'absolute',
              backgroundColor: 'primary.main',
              borderRadius: isMobile ? 1 : 10,
              width: isMobile ? '90%' : '47%',
              height: isMobile ? '45%' : '80%',
              boxShadow: 2,
              color: 'white'
            }}
          />
        ) : (
          <Card
            className='animate-slideLeft'
            sx={{
              position: 'absolute',
              backgroundColor: 'primary.main',
              borderRadius: isMobile ? 1 : 10,
              width: isMobile ? '90%' : '47%',
              height: isMobile ? '45%' : '80%',
              boxShadow: 2
            }}
          />
        )}

        <Button
          onClick={() => setMyProject(prev => !prev)}
          sx={!myProject ? { color: 'white', borderRadius: isMobile ? 1 : 10 } : { color: 'primary.main' }}
        >
          전체 현장
        </Button>
        <Button
          onClick={() => setMyProject(prev => !prev)}
          sx={myProject ? { color: 'white', borderRadius: isMobile ? 1 : 10 } : { color: 'primary.main' }}
        >
          나의 현장
        </Button>
      </Box>
    ) : (
      <FormControlLabel
        label={
          <Typography
            color='white'
            sx={{ fontWeight: 600, opacity: myProject ? '' : '60%', transition: 'ease-in-out all' }}
          >
            내 현장
          </Typography>
        }
        labelPlacement='start'
        control={<CustomSwitch checked={myProject} onClick={() => setMyProject(prev => !prev)} color='warning' />}
      />
    )

  return (
    <>
      {/* Drawer 부분 */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: { sx: { width: isMobile ? '80%' : '40%', borderTopRightRadius: 8, borderBottomRightRadius: 8 } },
          root: { sx: { position: 'relative' } }
        }}
        anchor='left'
      >
        <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', right: 0, top: 0 }}>
          <i className='tabler-x text-white' />
        </IconButton>
        <Box>
          <Box
            sx={{
              backgroundColor: 'primary.light',
              p: 2
            }}
          >
            {/* ! 유저 이미지로 변경 */}
            <div className='w-[70px] h-[70px] bg-white rounded-full m-3'>
              <i className='tabler-user text-[70px]' />
            </div>
            <div className='flex gap-2'>
              <Typography variant='h4' color='white'>
                {`[${currentUser.gradeDescription}] ${currentUser.name}`}
              </Typography>
            </div>
            <Typography variant='h5' color='white' sx={{ fontWeight: 300 }}>
              {currentUser.companyName}
            </Typography>

            <Typography variant='h5' color='white' sx={{ fontWeight: 300 }}>
              수첩발급번호: {currentUser.engineerLicenseNum}
            </Typography>
          </Box>
        </Box>
        <div className='flex flex-col justify-between h-full'>
          <Box sx={{ p: 5, mt: 5 }}>
            <Button
              fullWidth
              sx={{ display: 'flex', justifyContent: 'start', boxShadow: 4, color: 'dimgray', borderColor: 'dimgray' }}
              variant='outlined'
              onClick={() => handleLogout()}
            >
              <i className='tabler-logout text-[30px]' />
              <Typography variant='h4' sx={{ fontWeight: 600, marginLeft: 2 }} color='inherit'>
                로그아웃
              </Typography>
            </Button>
          </Box>
          <Link sx={{ textAlign: 'end', py: 3, px: 5 }} href='/machine'>
            웹으로 보기
          </Link>
        </div>
      </Drawer>

      {/* 렌더링 될 화면 */}
      <Box className='flex flex-col w-full' sx={{ height: '100dvh' }}>
        <MobileHeader
          left={
            <>
              <IconButton sx={{ boxShadow: 3, backgroundColor: 'white' }} onClick={() => setOpen(true)}>
                <i className='tabler-user' />
              </IconButton>
              {!isMobile && <ProjectToggle />}
            </>
          }
          title={`현장 목록(${totalElements})`}
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
          ref={listRef}
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
          sx={{ alignSelf: 'center', py: 1 }}
          count={totalPages}
          page={page + 1}
          onChange={(_, value) => setPage(value - 1)}
          showFirstButton
          showLastButton
        />
      </Box>
    </>
  )
}
