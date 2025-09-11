'use client'

// React Imports
import { useEffect, useState, useCallback } from 'react'

import { redirect } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

import { toast } from 'react-toastify'

// Component Imports
import 'dayjs/locale/ko'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers/'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import CustomTextField from '@core/components/mui/TextField'

import type {
  MachineEngineerOptionListResponseDtoType,
  MachineFilterType,
  machineProjectPageDtoType
} from '@/app/_type/types'
import { HEADERS, createInitialSorting } from '@/app/_schema/TableHeader'
import TableFilters from '@/app/_components/table/TableFilters'
import { MACHINE_FILTER_INFO } from '@/app/_schema/filter/MachineFilterInfo'
import SearchBar from '@/app/_components/SearchBar'
import BasicTable from '@/app/_components/table/BasicTable'
import AddMachineProjectModal from './_components/addMachineProjectModal'

// datepicker 한글화
dayjs.locale('ko')

// 초기 필터링 값
const initialFilters: MachineFilterType = {
  projectStatus: '',
  companyName: '',
  engineerName: '' // ← engineerNames → engineerName
}

// 페이지 당 행수 선택 옵션
const PageSizeOptions = [1, 10, 30, 50]

// 현장점검 기간 버튼 옵션
const periodOptions = [1, 3, 6]

export default function MachinePage() {
  const [data, setData] = useState<machineProjectPageDtoType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const disabled = loading || error

  const [totalCount, setTotalCount] = useState(0)

  const [projectName, setProjectName] = useState('')

  const [region, setRegion] = useState('')

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(30)

  const [addMachineModalOpen, setAddMachineModalOpen] = useState(false)

  const [filters, setFilters] = useState(initialFilters)

  const [fieldBeginDate, setFieldBeginDate] = useState<Dayjs | null>(null)
  const [fieldEndDate, setFieldEndDate] = useState<Dayjs | null>(null)

  const [dateTrigger, setDateTrigger] = useState(true)

  const [sorting, setSorting] = useState(createInitialSorting<machineProjectPageDtoType>)

  const [engineers, setEngineers] = useState<string[]>()

  const fetchEngineers = useCallback(async () => {
    setLoading(true)
    setError(false)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers/options`, {
        method: 'GET'
      })

      const result = await response.json()
      const data = result?.data as MachineEngineerOptionListResponseDtoType

      // 데이터 반영하여 상태 변경
      setEngineers(data.engineers.map(engineer => engineer.engineerName))
    } catch (error) {
      toast.error(`Failed to fetch filtered data: ${error}`)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEngineers()
  }, [fetchEngineers])

  const MACHINE_FILTER_INFO_WITH_ENGINEERS = {
    ...MACHINE_FILTER_INFO,
    engineerName: {
      ...MACHINE_FILTER_INFO.engineerName,
      options: engineers?.map(engineer => {
        return { value: engineer, label: engineer }
      })
    }
  }

  function ToggleDate() {
    setDateTrigger(prev => !prev)
  }

  // 데이터 페치에 사용되는 쿼리 URL
  const queryParams = new URLSearchParams()

  // 기계설비현장 리스트 호출 API 함수
  const fetchFilteredData = useCallback(async () => {
    setLoading(true)
    setError(false)

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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects?${queryParams.toString()}`,
        {
          method: 'GET'
        }
      )

      const result = await response.json()

      setData(result?.data.content ?? [])
      setPage(result?.data.page.number)
      setSize(result?.data.page.size)
      setTotalCount(result?.data.page.totalElements)
    } catch (error) {
      toast.error(`Failed to fetch filtered data: ${error}`)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filters, sorting, page, size, projectName, region, dateTrigger])

  // 필터 변경 시 API 호출
  useEffect(() => {
    fetchFilteredData()
  }, [filters, fetchFilteredData])

  // 기계설비현장 선택 핸들러
  const handleMachineProjectClick = async (machineProject: machineProjectPageDtoType) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProject?.machineProjectId}`,
      {
        method: 'GET'
      }
    )

    const data = await response.json()

    if (response.ok) {
      redirect(`/machine/${machineProject?.machineProjectId}`)
    } else {
      toast.error(data.message)
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
      <Card>
        <CardHeader title='기계설비현장' className='pbe-4' />
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
            setFilters(initialFilters)
            setSorting(createInitialSorting<machineProjectPageDtoType>)
          }}
          className='max-sm:is-full absolute right-8 top-8'
          disabled={disabled}
        >
          필터 초기화
        </Button>
        <div className='flex justify-between flex-col items-start  md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex gap-8 items-center'>
            <div className='flex gap-2'>
              {/* 이름으로 검색 */}
              <SearchBar
                placeholder='이름으로 검색'
                onClick={projectName => {
                  setProjectName(projectName)
                  setPage(0)
                }}
                disabled={disabled}
              />
              {/* 지역으로 검색 */}
              <SearchBar
                placeholder='지역으로 검색'
                onClick={region => {
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
                  <Button onClick={() => onClickMonth(month)} disabled={disabled} key={month} variant='contained'>
                    {month}개월
                  </Button>
                ))}
                <Button onClick={() => onClickMonth(0)} disabled={disabled} variant='contained'>
                  전체
                </Button>
              </div>
            </div>
          </div>
          <div className='flex sm:flex-row max-sm:is-full items-start sm:items-center gap-10'>
            <div className='flex gap-3 itmes-center'>
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
              className='max-sm:is-full'
              disabled={disabled}
            >
              추가
            </Button>
          </div>
        </div>

        {/* 테이블 */}
        <BasicTable<machineProjectPageDtoType>
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
          handlePageChange={() => setPage(0)}
        />
      )}
    </LocalizationProvider>
  )
}
