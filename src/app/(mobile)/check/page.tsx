'use client'

// React Imports
import { useEffect, useState, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

import axios from 'axios'

// Component Imports
import 'dayjs/locale/ko'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import {
  AppBar,
  Box,
  ButtonGroup,
  Chip,
  Drawer,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'

import classNames from 'classnames'

import type {
  MachineEngineerOptionListResponseDtoType,
  MachineEngineerOptionResponseDtoType,
  MachineFilterType,
  MachineProjectPageDtoType,
  successResponseDtoType
} from '@/app/_type/types'
import { HEADERS, createInitialSorting } from '@/app/_constants/table/TableHeader'
import { MACHINE_FILTER_INFO } from '@/app/_constants/filter/MachineFilterInfo'
import SearchBar from '@/app/_components/SearchBar'
import BasicTable from '@/app/_components/table/BasicTable'
import AddMachineProjectModal from './_components/addMachineProjectModal'
import { handleApiError } from '@/utils/errorHandler'
import { auth } from '@/lib/auth'
import Footer from '../_components/Footer'

// datepicker 한글화
dayjs.locale('ko')

export default function MachinePage() {
  const router = useRouter()

  const [data, setData] = useState<MachineProjectPageDtoType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const disabled = loading || error

  const [open, setOpen] = useState(false)

  const [totalCount, setTotalCount] = useState(0)

  const [projectName, setProjectName] = useState('')

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

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

  // 페이지 첫 로딩 시 localstorage에 headerKeyword가 있으면 해당 키워드를 이름으로 검색
  const headerKeyword = localStorage.getItem('headerKeyword')

  useEffect(() => {
    if (headerKeyword) {
      setProjectName(headerKeyword)
      localStorage.removeItem('headerKeyword')
    }
  }, [headerKeyword])

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
      setTotalCount(result.page.totalElements)
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
      router.push(`/machine/${machineProject.machineProjectId}`)
    } catch (error) {
      handleApiError(error, '프로젝트 정보를 불러오는 데 실패했습니다.')
    }
  }

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

  function Header() {
    return !isMobile ? (
      <Box className='p-4 border-b items-center grid grid-cols-3' sx={{ backgroundColor: 'primary.light' }}>
        <div className='flex gap-2  overflow-visible items-center'>
          <IconButton sx={{ boxShadow: 3, backgroundColor: 'white' }} onClick={() => setOpen(true)}>
            <i className='tabler-user' />
          </IconButton>
          <Box
            sx={{
              border: '1px solid lightgray',
              borderRadius: 10,
              p: 1,
              display: 'flex',
              position: 'relative',
              backgroundColor: 'white'
            }}
          >
            <Card
              sx={{
                position: 'absolute',
                backgroundColor: 'primary.main',
                borderRadius: 10,
                width: '47%',
                height: '80%'
              }}
              className={`transition-transform duration-300 ease-in-out left-[50%] top-[50%] -translate-y-1/2 ${!myProject ? '-translate-x-full' : '-translate-x-0'}`}
            ></Card>
            <Button
              onClick={() => setMyProject(false)}
              sx={{
                ...(!myProject ? { color: 'white', boxShadow: 2, borderRadius: 10 } : { color: 'primary.main' })
              }}
            >
              전체 현장
            </Button>
            <Button
              onClick={() => setMyProject(true)}
              sx={{
                ...(myProject ? { color: 'white', boxShadow: 2, borderRadius: 10 } : { color: 'primary.main' })
              }}
            >
              나의 현장
            </Button>
          </Box>
        </div>
        <div className='flex gap-1 items-center justify-center relative'>
          <Typography color='white' variant='h4'>
            {`기계설비현장(${totalCount})`}{' '}
          </Typography>
        </div>
        {!isMobile && (
          <div className='flex justify-end'>
            <SearchBar
              placeholder='이름으로 검색'
              setSearchKeyword={projectName => {
                setProjectName(projectName)
                setPage(0)
              }}
              disabled={disabled}
            />
          </div>
        )}
      </Box>
    ) : (
      <Box className='p-4 border-b items-center grid grid-cols-4' sx={{ backgroundColor: 'primary.light' }}>
        <div className='flex gap-2 overflow-visible flex-col items-start'>
          <IconButton sx={{ boxShadow: 3, backgroundColor: 'white' }} onClick={() => setOpen(true)}>
            <i className='tabler-user' />
          </IconButton>
        </div>
        <div className='flex gap-1 items-center justify-center relative col-span-2'>
          <Typography color='white' variant='h4'>
            {`기계설비현장(${totalCount})`}
          </Typography>
        </div>
        <div className='flex justify-end'>
          <Box
            sx={{
              width: 'fit-content',
              border: '1px solid lightgray',
              borderRadius: 1,
              p: 1,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              backgroundColor: 'white'
            }}
          >
            <Card
              sx={{
                position: 'absolute',
                backgroundColor: 'primary.main',
                borderRadius: 1,
                width: '90%',
                height: '45%'
              }}
              className={`left-1 top-[50%] -translate-y-1/2 ${!myProject ? '-translate-y-full' : '-translate-y-0'}`}
            ></Card>
            <Button
              onClick={() => setMyProject(false)}
              sx={{
                ...(!myProject ? { color: 'white', boxShadow: 2, borderRadius: 1 } : { color: 'primary.main' })
              }}
            >
              전체 현장
            </Button>
            <Button
              onClick={() => setMyProject(true)}
              sx={{
                ...(myProject ? { color: 'white', boxShadow: 2, borderRadius: 1 } : { color: 'primary.main' })
              }}
            >
              나의 현장
            </Button>
          </Box>
        </div>
      </Box>
    )
  }

  function MachineProjectCard({ machineProject }: { machineProject: MachineProjectPageDtoType }) {
    const engineerCnt = machineProject.engineerNames.length

    return (
      <Card sx={{ mb: 5, display: 'flex', gap: 5 }} elevation={10}>
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
      {/* Drawer */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: { sx: { width: '40%', borderTopRightRadius: 8, borderBottomRightRadius: 8 } },
          root: { sx: { position: 'relative' } }
        }}
        anchor='left'
      >
        <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', right: 0, top: 0 }}>
          <i className='tabler-x text-white' />
        </IconButton>
        <Box>
          <Box sx={{ backgroundColor: 'primary.light', p: 2 }}>
            {/* ! 유저 이미지로 변경 */}
            <div className='w-[70px] h-[70px] bg-white rounded-full m-3'>
              <i className='tabler-user text-[70px]' />
            </div>
            <Typography variant='h5' color='white'>
              {currentUser.companyName}
            </Typography>
            <div className='flex gap-2'>
              <Typography variant='h4' color='white'>
                {`[${currentUser.gradeDescription}] ${currentUser.name}`}
              </Typography>
            </div>
            <Typography variant='h5' color='white'>
              수첩발급번호: {currentUser.engineerLicenseNum}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 5, mt: 5 }}>
          <Button
            fullWidth
            sx={{ display: 'flex', justifyContent: 'start', gap: 2, fontSize: 'large', color: 'dimgray' }}
            onClick={() => handleLogout()}
          >
            <i className='tabler-logout' />
            <Typography variant='inherit' sx={{ fontWeight: 600 }}>
              로그아웃
            </Typography>
          </Button>
        </Box>
      </Drawer>
      {/* 렌더링 될 화면 */}
      <Box className='flex flex-col w-full' sx={{ height: '100vh' }}>
        <Header />
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

        <TablePagination
          rowsPerPageOptions={[1, 10, 30, 50]} // 1 추가 (테스트용)
          component='div'
          count={totalCount}
          rowsPerPage={size}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={event => {
            const newPageSize = parseInt(event.target.value, 10)

            setPage(0)
            setSize(newPageSize)
          }}
          disabled={disabled}
          showFirstButton
          showLastButton
          labelRowsPerPage='페이지당 행 수:'
          labelDisplayedRows={({ from, to, count }) => `${count !== -1 ? count : `${to} 이상`}개 중 ${from}-${to}개`}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '.MuiTablePagination-toolbar': {
              paddingLeft: 2,
              paddingRight: 2
            }
          }}
        />
        <Footer />
      </Box>
    </LocalizationProvider>
  )
}
