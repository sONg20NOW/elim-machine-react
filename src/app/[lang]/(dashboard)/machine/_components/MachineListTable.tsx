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
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { Input } from '@mui/material'

import { format } from 'date-fns'

import type { TextFieldProps } from '@mui/material/TextField'

import type { MachineType } from '@/types/apps/machineTypes'

// Component Imports
import TableFilters from './TableFilters'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import AddMachineModal from './addProjectModal'

type MachineTypeWithAction = MachineType & {
  action?: string
}

// Column Definitions
const columnHelper = createColumnHelper<MachineTypeWithAction>()

type CustomInputProps = TextFieldProps & {
  label: string
  end: Date | number
  start: Date | number
}

const MachineListTable = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<MachineType[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [addMachineModalOpen, setAddMachineModalOpen] = useState(false)

  // 필터 상태 - 컬럼에 맞게 수정
  const [filters, setFilters] = useState({
    projectStatusDescription: '',
    companyName: '',
    engineerName: [], // ← engineerNames → engineerName
    region: '',
    machineProjectName: '',
    fieldBeginDate: '',
    fieldEndDate: '', // ← number 타입이면 '' 대신 0
    reportDeadline: '', // ← number 타입이면 '' 대신 0
    page: 0,
    size: 30, // ← 타입이 string이면 '30'
    name: '', // ← 추가
    projectName: ''
  })

  // API 호출 함수
  const fetchFilteredData = useCallback(async (filterParams: any) => {
    setLoading(true)

    try {
      const queryParams = new URLSearchParams()

      if (filterParams.projectStatusDescription) {
        queryParams.append('projectStatus', filterParams.projectStatusDescription)
      }

      if (filterParams.region) {
        queryParams.append('region', filterParams.region)
      }

      if (filterParams.machineProjectName) {
        queryParams.append('machineProjectName', filterParams.machineProjectName)
      }

      if (filterParams.reportDeadline) {
        queryParams.append('reportDeadline', filterParams.reportDeadline)
      }

      if (filterParams.companyName) {
        queryParams.append('companyName', filterParams.companyName)
      }

      if (filterParams.engineerName) {
        queryParams.append('engineerName', filterParams.engineerName)
      }

      if (filterParams.fieldBeginDate) {
        const beginDateStr =
          typeof filterParams.fieldBeginDate === 'string'
            ? filterParams.fieldBeginDate
            : format(filterParams.fieldBeginDate, 'yyyy-MM-dd')

        console.log('Begin Date:', beginDateStr)
        queryParams.append('fieldBeginDate', beginDateStr)
      }

      if (filterParams.fieldEndDate) {
        const endDateStr =
          typeof filterParams.fieldEndDate === 'string'
            ? filterParams.fieldEndDate
            : format(filterParams.fieldEndDate, 'yyyy-MM-dd')

        queryParams.append('fieldEndDate', endDateStr)
      }

      // // 서버 API에 맞게 파라미터 설정
      queryParams.append('page', String(filterParams.page))
      queryParams.append('size', String(filterParams.size))

      // 필터 조건들 추가
      if (filterParams.projectName) {
        queryParams.append('projectName', filterParams.projectName)
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects?${queryParams.toString()}`,
        {
          method: 'GET'
        }
      )

      const result = await response.json()

      setData(result.data.content || [])

      // totalElements가 page 객체 안에 있는지 확인하고 설정
      const totalElements = result.data.page?.totalElements || 0

      // 첫 번째 페이지이거나 totalElements가 유효한 값이면 업데이트
      if (filterParams.page === 0 && totalElements > 0) {
        setTotalCount(totalElements)
        console.log('새로운 totalCount 설정:', totalElements)
      } else {
        console.log('기존 totalCount 유지 - page:', filterParams.page, 'totalElements:', totalElements)
      }
    } catch (error) {
      console.error('Failed to fetch filtered data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 필터 변경 시 API 호출
  useEffect(() => {
    fetchFilteredData(filters)
  }, [
    filters.projectStatusDescription,
    filters.region,
    filters.machineProjectName,
    filters.fieldBeginDate,
    filters.fieldEndDate,
    filters.reportDeadline,
    filters.page,
    filters.size,
    filters.companyName,
    filters.projectName,
    fetchFilteredData
  ])

  const columns = useMemo<ColumnDef<MachineTypeWithAction, any>[]>(
    () => [
      {
        id: 'id',
        header: '번호',
        cell: ({ row }) => <p>{row.original.machineProjectId}</p>
      },
      columnHelper.accessor('projectStatusDescription', {
        header: '상태',
        cell: ({ row }) => <div className='flex items-center gap-2'>{row.original.projectStatusDescription}</div>
      }),
      columnHelper.accessor('region', {
        header: '지역',
        cell: ({ row }) => <div className='flex items-center gap-2'>{row.original.region}</div>
      }),
      columnHelper.accessor('machineProjectName', {
        header: '현장명',
        cell: ({ row }) => <div className='flex items-center gap-2'>{row.original.machineProjectName}</div>
      }),
      columnHelper.accessor('fieldBeginDate', {
        header: '현장점검',
        cell: ({ row }) => <div className='flex items-center gap-2'>{row.original.fieldBeginDate}</div>
      }),
      columnHelper.accessor('fieldEndDate', {
        header: '점검종료',
        cell: ({ row }) => <div className='flex items-center gap-2'>{row.original.fieldEndDate}</div>
      }),
      columnHelper.accessor('reportDeadline', {
        header: '보고서마감',
        cell: ({ row }) => <div className='flex items-center gap-2'>{row.original.reportDeadline}</div>
      }),
      columnHelper.accessor('inspectionCount', {
        header: '설비',
        cell: ({ row }) => <div className='flex items-center gap-2'>{row.original.inspectionCount}</div>
      }),
      columnHelper.accessor('companyName', {
        header: '점검업체',
        cell: ({ row }) => <div className='flex items-center gap-2'>{row.original.companyName}</div>
      }),
      columnHelper.accessor('engineerNames', {
        header: '참여기술진',
        cell: ({ row }) => {
          const names = row.original.engineerNames
          const display = Array.isArray(names) ? names.join(', ') : names

          // 30글자 이상이면 ...으로 표시
          return (
            <div className='flex items-center gap-2'>
              {display.length > 30 ? display.slice(0, 10) + '...' : display}
            </div>
          )
        }
      }),
      columnHelper.accessor('grossArea', {
        header: '연면적(㎡)',
        cell: ({ row }) => <div className='flex items-center gap-2'>{row.original.grossArea}</div>
      }),
      columnHelper.accessor('tel', {
        header: '전화번호',
        cell: ({ row }) => <div className='flex items-center gap-2'>{row.original.tel}</div>
      })
    ],
    []
  )

  const filterFns = {
    fuzzy: (row: { getValue: (arg0: any) => any }, columnId: any, filterValue: string) => {
      const value = row.getValue(columnId)

      return value?.toString().toLowerCase().includes(filterValue.toLowerCase())
    }
  }

  const table = useReactTable({
    data: data as MachineType[],
    columns,
    manualFiltering: true,
    manualPagination: true,
    filterFns,
    state: {
      rowSelection
    },
    initialState: {
      pagination: {
        pageSize: filters.size
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel()
  })

  // 검색 핸들러
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      projectName: value,
      page: 0
    }))
  }

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (size: number) => {
    setFilters(prev => ({
      ...prev,
      size,
      page: 0
    }))
  }

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }))
  }

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
        <TableFilters filters={filters} onFiltersChange={setFilters} loading={loading} />

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

export default MachineListTable
