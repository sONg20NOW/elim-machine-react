'use client'

// React Imports
import { useEffect, useState, useMemo, useCallback, forwardRef } from 'react'

import Link from 'next/link'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import classnames from 'classnames'
import { flexRender } from '@tanstack/react-table'

import { Input } from '@mui/material'

import { format } from 'date-fns'

import type { TextFieldProps } from '@mui/material/TextField'

import { toast } from 'react-toastify'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import AddMachineModal from './_components/addProjectModal'
import type { MachineFilterType, machineProjectPageDtoType } from '@/app/_type/types'
import { InitialSorting } from '@/app/_type/TableHeader'

// TODO: initialFilters 뺴고 싹 다 정리
type CustomInputProps = TextFieldProps & {
  label: string
  end: Date | number
  start: Date | number
}

// 초기 필터링 값
const initialFilters: MachineFilterType = {
  projectStatusDescription: '',
  companyName: '',
  engineerName: '', // ← engineerNames → engineerName
  region: ''
}

// 페이지 당 행수 선택 옵션
const PageSizeOptions = [1, 10, 30, 50]

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
  // TODO: name으로 통일
  const [name, setName] = useState('')

  // 페이지네이션 관련
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(30)

  // 상세 페이지 관련
  const [addMachineModalOpen, setAddMachineModalOpen] = useState(false)

  // 필터 상태 - 컬럼에 맞게 수정
  const [filters, setFilters] = useState(initialFilters)

  // 정렬 상태
  const [sorting, setSorting] = useState(InitialSorting)

  // 데이터 페치에 사용되는 쿼리 URL
  const queryParams = new URLSearchParams()

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [rowSelection, setRowSelection] = useState({})

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
      name ? queryParams.set('name', name) : queryParams.delete('name')

      // TODO: 기간 필터링

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
      setPage(result?.data.page.number)
      setSize(result?.data.page.size)
      setTotalCount(result?.data.page.totalElements)
    } catch (error) {
      toast.error(`Failed to fetch filtered data: ${error}`)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filters, sorting, page, size, name])

  // 필터 변경 시 API 호출
  useEffect(() => {
    fetchFilteredData()
  }, [filters, fetchFilteredData])

  const CustomInput = forwardRef((props: CustomInputProps, ref) => {
    const { label, start, end, ...rest } = props

    const startDate = format(start, 'MM/dd/yyyy')
    const endDate = end !== null ? ` - ${format(end, 'MM/dd/yyyy')}` : null

    const value = `${startDate}${endDate !== null ? endDate : ''}`

    return <CustomTextField fullWidth inputRef={ref} {...rest} label={label} value={value} />
  })

  const handleOnChange = (dates: any) => {
    const [start, end] = dates

    setStartDate(start)
    setEndDate(end)

    setFilters(prev => ({
      ...prev,
      fieldBeginDate: start,
      fieldEndDate: end
    }))
  }

  return (
    <>
      <Card>
        <CardHeader title='기계설비현장' className='pbe-4' />
        <TableFilters filterInfo={} filters={filters} onFiltersChange={setFilters} loading={loading} />

        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex justify-center items-center gap-2'>
            <CustomTextField
              select
              value={filters.size}
              onChange={e => handlePageSizeChange(Number(e.target.value))}
              className='max-sm:is-full sm:is-[70px]'
              disabled={loading}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </CustomTextField>
            <Input
              value={search}
              onChange={e => setSearch(e.currentTarget.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  console.log('검색어:', e.currentTarget.value)
                  handleSearchChange(search)
                }
              }}
              placeholder='이름으로 검색'
              className='max-sm:is-full'
              disabled={loading}
              sx={{
                borderTop: '1px solid var(--mui-palette-customColors-inputBorder)',
                borderBottom: '1px solid var(--mui-palette-customColors-inputBorder)',
                borderLeft: '1px solid var(--mui-palette-customColors-inputBorder)',
                borderRight: '1px solid var(--mui-palette-customColors-inputBorder)',
                borderRadius: 0,
                background: 'transparent',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: 'var(--mui-palette-primary-main)'
                },
                '&.Mui-focused': {
                  borderColor: 'var(--mui-palette-primary-main)'
                },
                padding: '5px 10px',
                borderTopRightRadius: 6,
                borderBottomRightRadius: 6,
                borderTopLeftRadius: 6,
                borderBottomLeftRadius: 6
              }}
              disableUnderline={true}
            />
            <p>현장투입 기간: </p>
            <AppReactDatepicker
              selectsRange
              endDate={endDate as Date}
              selected={startDate}
              startDate={startDate as Date}
              id='date-range-picker'
              onChange={handleOnChange}
              shouldCloseOnSelect={false}
              customInput={<CustomInput label='' start={startDate as Date | number} end={endDate as Date | number} />}
            />
            <Button
              variant='contained'
              onClick={() => {
                console.log('1개월 버튼 클릭')
              }}
              className='max-sm:is-full'
              disabled={loading}
            >
              1개월
            </Button>
            <Button
              variant='contained'
              onClick={() => {
                console.log('1개월 버튼 클릭')
              }}
              className='max-sm:is-full'
              disabled={loading}
            >
              3개월
            </Button>
            <Button
              variant='contained'
              onClick={() => {
                console.log('1개월 버튼 클릭')
              }}
              className='max-sm:is-full'
              disabled={loading}
            >
              6개월
            </Button>
          </div>

          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddMachineModalOpen(!addMachineModalOpen)}
              className='max-sm:is-full'
              disabled={loading}
            >
              추가
            </Button>
          </div>
        </div>

        {/* 로딩 표시 */}
        {loading && <div className='text-center p-4'>Loading...</div>}

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-xl' />,
                            desc: <i className='tabler-chevron-down text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {data.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    {loading ? 'Loading...' : 'No data available'}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {data.map((row, index) => {
                  const tableRow = table.getRowModel().rows[index]

                  if (!tableRow) return null

                  return (
                    <tr key={row.machineProjectId} className='hover:bg-gray-50'>
                      {tableRow.getVisibleCells().map(cell => (
                        <td key={tableRow.id + '-' + cell.column.id}>
                          <Link href={`/en/machine/${row.machineProjectId}`}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Link>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>

        <TablePagination
          rowsPerPageOptions={[1, 10, 30, 50]} // 1 추가 (테스트용)
          component='div'
          count={totalCount}
          rowsPerPage={filters.size}
          page={filters.page}
          onPageChange={(_, newPage) => handlePageChange(newPage)}
          onRowsPerPageChange={event => {
            const newPageSize = parseInt(event.target.value, 10)

            handlePageSizeChange(newPageSize)
          }}
          disabled={loading}
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
      {addMachineModalOpen && <AddMachineModal open={addMachineModalOpen} setOpen={setAddMachineModalOpen} />}
    </>
  )
}
