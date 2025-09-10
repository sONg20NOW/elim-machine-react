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
import DatePicker from 'react-datepicker'
import dateFormat from 'dateformat'

import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import AddMachineModal from './_components/addMachineProjectModal'
import type { MachineFilterType, machineProjectPageDtoType } from '@/app/_type/types'
import { HEADERS, createInitialSorting } from '@/app/_type/TableHeader'
import TableFilters from '@/app/_components/table/TableFilters'
import { MACHINE_FILTER_INFO } from '@/app/_schema/filter/MachineFilterInfo'
import SearchBar from '@/app/_components/SearchBar'
import BasicTable from '@/app/_components/table/BasicTable'

// 초기 필터링 값
const initialFilters: MachineFilterType = {
  projectStatus: '',
  companyName: '',
  engineerName: '', // ← engineerNames → engineerName
  region: ''
}

// 페이지 당 행수 선택 옵션
const PageSizeOptions = [1, 10, 30, 50]

// 현장점검 기간 버튼 옵션
const periodOptions = [1, 3, 6]

export default function MachinePage() {
  // 데이터 리스트
  const [data, setData] = useState<machineProjectPageDtoType[]>([])

  // 로딩 시도 중 = true, 로딩 끝 = false
  const [loading, setLoading] = useState(false)

  // 에러 발생 시 true
  const [error, setError] = useState(false)

  // 로딩이 끝나고 에러가 없으면 not disabled
  const disabled = loading || error

  // 전체 데이터 개수 => fetching한 데이터에서 추출
  const [totalCount, setTotalCount] = useState(0)

  // 이름 검색 인풋
  const [projectName, setProjectName] = useState('')

  // 페이지네이션 관련
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(30)

  // 모달 상태
  const [addMachineModalOpen, setAddMachineModalOpen] = useState(false)

  // 필터 상태 - 컬럼에 맞게 수정
  const [filters, setFilters] = useState(initialFilters)

  // 현장점검 기간 상태
  const [fieldBeginDate, setFieldBeginDate] = useState<Date>()
  const [fieldEndDate, setFieldEndDate] = useState<Date>()

  // 정렬 상태
  const [sorting, setSorting] = useState(createInitialSorting<machineProjectPageDtoType>)

  // 데이터 페치에 사용되는 쿼리 URL
  const queryParams = new URLSearchParams()

  // 기계설비현장 리스트 호출 API 함수
  const fetchFilteredData = useCallback(async () => {
    setLoading(true)
    setError(false)

    try {
      // 필터링
      Object.keys(filters).map(prop => {
        const key = prop as keyof MachineFilterType

        filters[key] ? queryParams.set(prop, filters[key] as string) : queryParams.delete(prop)
      })

      // 정렬
      sorting.sort
        ? queryParams.append('sort', `${sorting.target},${sorting.sort}`.toString())
        : queryParams.delete('sort')

      // 이름으로 검색
      projectName ? queryParams.set('projectName', projectName) : queryParams.delete('projectName')

      // TODO: 현장점검 필터링
      fieldBeginDate
        ? queryParams.set('fieldBeginDate', dateFormat(fieldBeginDate, 'yyyy-mm-dd'))
        : queryParams.delete('fieldBeginDate')
      fieldEndDate
        ? queryParams.set('fieldEndDate', dateFormat(fieldEndDate, 'yyyy-mm-dd'))
        : queryParams.delete('fieldEndDate')

      // 페이지 관련 설정
      queryParams.set('page', page.toString())
      queryParams.set('size', size.toString())

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects?${queryParams.toString()}`,
        {
          method: 'GET'
        }
      )

      const result = await response.json()

      // 데이터 반영하여 상태 변경
      setData(result?.data.content ?? [])
      console.log(result?.data.content ?? [])
      setPage(result?.data.page.number)
      setSize(result?.data.page.size)
      setTotalCount(result?.data.page.totalElements)
    } catch (error) {
      toast.error(`Failed to fetch filtered data: ${error}`)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filters, sorting, page, size, projectName, fieldBeginDate, fieldEndDate])

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

  //TODO: 현장점검기간 버튼 클릭 핸들러
  function onClickMonth(month: number) {}

  return (
    <>
      <Card>
        <CardHeader title='기계설비현장' className='pbe-4' />
        {/* 필터바 */}
        <TableFilters<MachineFilterType>
          filterInfo={MACHINE_FILTER_INFO}
          filters={filters}
          onFiltersChange={setFilters}
          disabled={disabled}
          setPage={setPage}
        />
        {/* 필터 초기화 버튼 */}
        <Button
          startIcon={<i className='tabler-reload' />}
          onClick={() => setFilters(initialFilters)}
          className='max-sm:is-full absolute right-8 top-8'
          disabled={disabled}
        >
          필터 초기화
        </Button>
        <div className='flex justify-between flex-col items-start  md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex gap-8 items-center'>
            {/* 이름으로 검색 */}
            <SearchBar
              onClick={projectName => {
                setProjectName(projectName)
                setPage(0)
              }}
              disabled={disabled}
            />
            <div className='flex gap-4'>
              {/* 현장점검 기간 */}
              <div className='flex items-center gap-2 text-base'>
                <DatePicker
                  disabled={disabled}
                  placeholderText='점검 시작일'
                  className='text-base text-center rounded-lg w-28 py-1 border-solid border-[1px] border-color-border'
                  dateFormat={'yyyy.MM.dd'}
                  selected={fieldBeginDate}
                  onChange={date => setFieldBeginDate(date ?? new Date())}
                />
                <span>~</span>
                <DatePicker
                  disabled={disabled}
                  placeholderText='점검 종료일'
                  className='text-base text-center rounded-lg w-28 py-1 border-solid border-[1px] border-color-border'
                  dateFormat={'yyyy.MM.dd'}
                  selected={fieldEndDate}
                  onChange={date => setFieldEndDate(date ?? new Date())}
                />
              </div>
              <div className='flex gap-2'>
                {periodOptions.map(month => (
                  <Button disabled={disabled} key={month} variant='contained'>
                    {month}개월
                  </Button>
                ))}
                <Button disabled={disabled} variant='contained'>
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
        <AddMachineModal
          open={addMachineModalOpen}
          setOpen={setAddMachineModalOpen}
          handlePageChange={() => setPage(0)}
        />
      )}
    </>
  )
}
