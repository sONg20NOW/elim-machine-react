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

import CustomTextField from '@core/components/mui/TextField'

import type {
  MachineEngineerOptionListResponseDtoType,
  MachineEngineerOptionResponseDtoType,
  MachineFilterType,
  MachineProjectPageDtoType,
  successResponseDtoType
} from '@/app/_type/types'
import { HEADERS, createInitialSorting } from '@/app/_constants/table/TableHeader'
import TableFilters from '@/app/_components/table/TableFilters'
import { MACHINE_FILTER_INFO } from '@/app/_constants/filter/MachineFilterInfo'
import SearchBar from '@/app/_components/SearchBar'
import BasicTable from '@/app/_components/table/BasicTable'
import AddMachineProjectModal from './_components/addMachineProjectModal'
import { PageSizeOptions } from '@/app/_constants/options'
import { MachineInitialFilters } from '@/app/_constants/MachineProjectSeed'
import { handleApiError } from '@/utils/errorHandler'

// datepicker 한글화
dayjs.locale('ko')

// 현장점검 기간 버튼 옵션
const periodOptions = [1, 3, 6]

export default function MachinePage() {
  const router = useRouter()

  const [data, setData] = useState<MachineProjectPageDtoType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const disabled = loading || error

  const [totalCount, setTotalCount] = useState(0)

  const [projectName, setProjectName] = useState('')

  const [region, setRegion] = useState('')

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(30)

  const [addMachineModalOpen, setAddMachineModalOpen] = useState(false)

  const [filters, setFilters] = useState(MachineInitialFilters)

  const [fieldBeginDate, setFieldBeginDate] = useState<Dayjs | null>(null)
  const [fieldEndDate, setFieldEndDate] = useState<Dayjs | null>(null)

  const [dateTrigger, setDateTrigger] = useState(true)

  const [sorting, setSorting] = useState(createInitialSorting<MachineProjectPageDtoType>)

  const [engineers, setEngineers] = useState<MachineEngineerOptionResponseDtoType[]>()

  // ! 선택 삭제 기능 구현
  // const [showCheckBox, setShowCheckBox] = useState(false)
  // const [checked, setChecked] = useState<Set<number>>(new Set([]))

  // 페이지 첫 로딩 시 localstorage에 headerKeyword가 있으면 해당 키워드를 이름으로 검색
  const headerKeyword = localStorage.getItem('headerKeyword')

  useEffect(() => {
    if (headerKeyword) {
      setProjectName(headerKeyword)
      localStorage.removeItem('headerKeyword')
    }
  }, [headerKeyword])

  const getEngineers = useCallback(async () => {
    setLoading(true)
    setError(false)

    try {
      const response = await axios.get<{ data: MachineEngineerOptionListResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers/options`
      )

      const data = response.data.data

      setEngineers(data.engineers)
    } catch (error) {
      handleApiError(error, '엔지니어 옵션을 불러오는 데 실패했습니다.')
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getEngineers()
  }, [getEngineers])

  const MACHINE_FILTER_INFO_WITH_ENGINEERS = {
    ...MACHINE_FILTER_INFO,
    engineerName: {
      ...MACHINE_FILTER_INFO.engineerName,
      options: engineers?.map(engineer => {
        return { value: engineer.engineerName, label: engineer.engineerName }
      })
    }
  }

  function ToggleDate() {
    setDateTrigger(prev => !prev)
  }

  // 기계설비현장 리스트 호출 API 함수
  const getFilteredData = useCallback(async () => {
    setLoading(true)
    setError(false)

    // 데이터 페치에 사용되는 쿼리 URL
    const queryParams = new URLSearchParams()

    try {
      Object.keys(filters).map(prop => {
        const key = prop as keyof MachineFilterType

        filters[key] ? queryParams.set(prop, filters[key] as string) : queryParams.delete(prop)
      })

      sorting.sort
        ? queryParams.append('sort', `${sorting.target},${sorting.sort}`.toString())
        : queryParams.delete('sort')

      projectName ? queryParams.set('projectName', projectName) : queryParams.delete('projectName')

      region ? queryParams.set('region', region) : queryParams.delete('region')

      fieldBeginDate
        ? queryParams.set('fieldBeginDate', fieldBeginDate.format('YYYY-MM-DD'))
        : queryParams.delete('fieldBeginDate')
      fieldEndDate
        ? queryParams.set('fieldEndDate', fieldEndDate.format('YYYY-MM-DD'))
        : queryParams.delete('fieldEndDate')

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
  }, [filters, sorting, page, size, projectName, region, dateTrigger])

  // 필터 변경 시 API 호출
  useEffect(() => {
    getFilteredData()
  }, [filters, getFilteredData])

  // 기계설비현장 선택 핸들러
  const handleMachineProjectClick = async (machineProject: MachineProjectPageDtoType) => {
    if (!machineProject?.machineProjectId) return

    try {
      router.push(`/machine/${machineProject.machineProjectId}`)
    } catch (error) {
      handleApiError(error, '프로젝트 정보를 불러오는 데 실패했습니다.')
    }
  }

  function onClickMonth(month: number) {
    if (month === 0) {
      setFieldBeginDate(null)
      setFieldEndDate(null)
    } else {
      const currentTime = dayjs()

      setFieldEndDate(currentTime)

      setFieldBeginDate(currentTime.subtract(month, 'month'))
    }

    ToggleDate()
  }

  // // 설비현장 체크 핸들러 (다중선택)
  // const handleCheckMachineProject = (user: MachineProjectPageDtoType) => {
  //   const machineProjectId = user.machineProjectId
  //   const checked = isChecked(user)

  //   if (!checked) {
  //     setChecked(prev => {
  //       const newSet = new Set(prev)

  //       newSet.add(machineProjectId)

  //       return newSet
  //     })
  //   } else {
  //     setChecked(prev => {
  //       const newSet = new Set(prev)

  //       newSet.delete(machineProjectId)

  //       return newSet
  //     })
  //   }
  // }

  // const handleCheckAllMachineProjects = (checked: boolean) => {
  //   if (checked) {
  //     setChecked(prev => {
  //       const newSet = new Set(prev)

  //       data.forEach(machineProject => newSet.add(machineProject.machineProjectId))

  //       return newSet
  //     })
  //   } else {
  //     setChecked(new Set<number>())
  //   }
  // }

  // const isChecked = (machineProject: MachineProjectPageDtoType) => {
  //   return checked.has(machineProject.machineProjectId)
  // }

  // // 여러 프로젝트 한번에 삭제
  // async function handleDeleteMachineProjects() {
  //   try {
  //     const list = Array.from(checked).map(machineProjectId => {
  //       return {
  //         machineProjectId: machineProjectId,
  //         version: data.find(machineProject => machineProject.machineProjectId === machineProjectId)!.version
  //       }
  //     })

  //     await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members`, {
  //       //@ts-ignore
  //       data: { memberDeleteRequestDtos: list }
  //     })

  //     handleSuccess('선택된 직원들이 성공적으로 삭제되었습니다.')
  //   } catch (error) {
  //     handleApiError(error)
  //   }
  // }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
      <Card className='relative'>
        <CardHeader title={`기계설비현장 (${totalCount})`} className='pbe-4' />
        {/* 필터바 */}
        <TableFilters<MachineFilterType>
          filterInfo={MACHINE_FILTER_INFO_WITH_ENGINEERS}
          filters={filters}
          onFiltersChange={setFilters}
          disabled={disabled}
          setPage={setPage}
        />
        {/* 필터 초기화 버튼 */}
        <Button
          startIcon={<i className='tabler-reload' />}
          onClick={() => {
            setFilters(MachineInitialFilters)
            setSorting(createInitialSorting<MachineProjectPageDtoType>)
          }}
          className='max-sm:is-full absolute right-8 top-8'
          disabled={disabled}
        >
          필터 초기화
        </Button>
        <div className='flex justify-between flex-col items-start  md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex gap-8 items-center'>
            <div className='flex gap-2 flex-wrap'>
              {/* 이름으로 검색 */}
              <SearchBar
                placeholder='이름으로 검색'
                setSearchKeyword={projectName => {
                  setProjectName(projectName)
                  setPage(0)
                }}
                disabled={disabled}
              />
              {/* 지역으로 검색 */}
              <SearchBar
                placeholder='지역으로 검색'
                setSearchKeyword={region => {
                  setRegion(region)
                  setPage(0)
                }}
                disabled={disabled}
              />
            </div>

            <div className='flex gap-4'>
              {/* 현장점검 기간 */}
              <div className='flex items-center gap-2 text-base'>
                <DatePicker
                  disabled={disabled}
                  label='점검 시작일'
                  value={fieldBeginDate}
                  format={'YYYY.MM.DD'}
                  onChange={date => setFieldBeginDate(dayjs(date))}
                  onAccept={ToggleDate}
                  showDaysOutsideCurrentMonth
                  slotProps={{ textField: { size: 'small' } }}
                  sx={{ p: 0, m: 0, width: 150 }}
                />
                <span>~</span>
                <DatePicker
                  disabled={disabled}
                  label='점검 종료일'
                  value={fieldEndDate}
                  format={'YYYY.MM.DD'}
                  onChange={date => setFieldEndDate(dayjs(date))}
                  onAccept={ToggleDate}
                  showDaysOutsideCurrentMonth
                  slotProps={{ textField: { size: 'small' } }}
                  sx={{ p: 0, m: 0, width: 150 }}
                />
              </div>
              <div className='flex gap-2'>
                {periodOptions.map(month => (
                  <Button
                    className='whitespace-nowrap'
                    onClick={() => onClickMonth(month)}
                    disabled={disabled}
                    key={month}
                    variant='contained'
                  >
                    {month}개월
                  </Button>
                ))}
                <Button
                  className='whitespace-nowrap'
                  onClick={() => onClickMonth(0)}
                  disabled={disabled}
                  variant='contained'
                >
                  전체
                </Button>
              </div>
            </div>
          </div>
          <div className='flex sm:flex-row max-sm:is-full items-start sm:items-center gap-10'>
            {/* 한번에 삭제
            {!showCheckBox ? (
              <Button variant='contained' onClick={() => setShowCheckBox(prev => !prev)}>
                선택 삭제
              </Button>
            ) : (
              <div className='flex gap-1'>
                <Button variant='contained' color='error' onClick={() => handleDeleteMachineProjects()}>
                  {`(${checked.size}) 삭제`}
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  onClick={() => {
                    setShowCheckBox(prev => !prev)
                    handleCheckAllMachineProjects(false)
                  }}
                >
                  취소
                </Button>
              </div>
            )} */}
            <div className='flex gap-3 itmes-center whitespace-nowrap'>
              {/* 페이지당 행수 */}
              <span className='grid place-items-center'>페이지당 행 수 </span>
              <CustomTextField
                select
                value={size.toString()}
                onChange={e => {
                  setSize(Number(e.target.value))
                  setPage(0)
                }}
                disabled={disabled}
              >
                {PageSizeOptions.map(pageSize => (
                  <MenuItem key={pageSize} value={pageSize}>
                    {pageSize}
                    {`\u00a0\u00a0`}
                  </MenuItem>
                ))}
              </CustomTextField>
            </div>
            {/* 기계설비현장 추가 버튼 */}
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddMachineModalOpen(!addMachineModalOpen)}
              className='max-sm:is-full whitespace-nowrap'
              disabled={disabled}
            >
              추가
            </Button>
          </div>
        </div>

        {/* 테이블 */}
        <BasicTable<MachineProjectPageDtoType>
          header={HEADERS.machine}
          data={data}
          handleRowClick={handleMachineProjectClick}
          page={page}
          pageSize={size}
          sorting={sorting}
          setSorting={setSorting}
          loading={loading}
          error={error}
          listException={['engineerNames']}

          // showCheckBox={showCheckBox}
          // isChecked={isChecked}
          // handleCheckItem={handleCheckMachineProject}
          // handleCheckAllItems={handleCheckAllMachineProjects}
        />

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
      </Card>
      {/* 생성 모달 */}
      {addMachineModalOpen && (
        <AddMachineProjectModal
          open={addMachineModalOpen}
          setOpen={setAddMachineModalOpen}
          reloadPage={() => getFilteredData()}
        />
      )}
    </LocalizationProvider>
  )
}
