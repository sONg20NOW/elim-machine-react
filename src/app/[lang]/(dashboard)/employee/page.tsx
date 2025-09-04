'use client'

// React Imports
import { useEffect, useState, useMemo, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

// Table

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { Input } from '@mui/material'

import { toast } from 'react-toastify'

import membersHeaders from '@/app/_components/table/headerTranslate.json'

import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import TableFilters from './_components/TableFilters'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import UserModal from './_components/UserModal'
import AddUserModal from './_components/addUserModal'

type UsersTypeWithAction = UsersType & {
  action?: string
}

// Column Definitions
const columnHelper = createColumnHelper<UsersTypeWithAction>()

const EmployeePage = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<UsersType[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [name, setName] = useState('')

  // States에 추가
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsersType | null>(null)
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false)

  // 필터 상태 - 컬럼에 맞게 수정
  const [filters, setFilters] = useState({
    name: '',
    roleDescription: '',
    companyName: '',
    officeDepartmentName: '',
    officePosition: '',
    memberStatus: '',
    page: 0,
    size: 30,
    careerYear: 0,
    contractType: '',
    laborForm: '',
    workForm: '',
    gender: '',
    foreignYn: ''
  })

  const queryParams = new URLSearchParams()

  // 기계설비 인력 리스트 호출 API 함수
  const fetchFilteredData = useCallback(
    async (filterParams: any) => {
      setLoading(true)

      try {
        Object.keys(filters).map(filter => {
          if (filterParams[filter]) {
            queryParams.set(filter, filterParams[filter])
          } else {
            queryParams.delete(filter)
          }
        })

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members?${queryParams.toString()}`,
          {
            method: 'GET'
          }
        )

        const result = await response.json()

        setData(result?.data.content ?? [])
        setTotalCount(result?.data.page.totalElements)
      } catch (error) {
        toast.error(`Failed to fetch filtered data: ${error}`)
      } finally {
        setLoading(false)
      }
    },
    [filters]
  )

  // 필터 변경 시 API 호출
  useEffect(() => {
    fetchFilteredData(filters)
  }, [filters, fetchFilteredData])

  // Column 생성 함수
  function ColumnAccessor(id: keyof UsersType, header: string) {
    return columnHelper.accessor(id, {
      header: header,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          {typeof row.original[id] === 'object' && row.original[id] !== null
            ? JSON.stringify(row.original[id])
            : row.original[id]}
        </div>
      ),
      id: id
    })
  }

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
    () =>
      (Object.keys(membersHeaders.members) as Array<keyof typeof membersHeaders.members>).map(key =>
        ColumnAccessor(key, membersHeaders.members[key])
      ),
    []
  )

  const filterFns = {
    fuzzy: (row: { getValue: (arg0: any) => any }, columnId: any, filterValue: string) => {
      const value = row.getValue(columnId)

      return value?.toString().toLowerCase().includes(filterValue.toLowerCase())
    }
  }

  const table = useReactTable({
    data: data as UsersType[],
    columns,
    getSortedRowModel: getSortedRowModel(),
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
  const handleNameChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      name: value,
      page: 0
    }))
  }

  // 페이지 크기 변경 핸들러
  const handleSizeChange = (size: number) => {
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
      page: page
    }))
  }

  // 사용자 선택 핸들러
  const handleUserClick = async (user: UsersType) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members/${user?.memberId}`, {
      method: 'GET'
    })

    const data = await response.json()

    setSelectedUser(data.data)
    setUserDetailModalOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader title='직원관리' className='pbe-4' />
        <TableFilters filters={filters} onFiltersChange={setFilters} loading={loading} />

        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex justify-center items-center gap-2'>
            <CustomTextField
              select
              value={filters.size}
              onChange={e => handleSizeChange(Number(e.target.value))}
              className='max-sm:w-full sm:is-[70px]'
              disabled={loading}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </CustomTextField>
            <Input
              value={name}
              onChange={e => setName(e.currentTarget.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleNameChange(name)
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
            <div className='text-color-primary-light hover:text-color-primary-dark grid place-items-center'>
              <i className='tabler-search' onClick={() => handleNameChange(name)} />
            </div>
          </div>

          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddUserModalOpen(!addUserModalOpen)}
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
                      {/* 오름차순, 내림차순 토글 */}
                      {header.isPlaceholder ? null : (
                        <div
                          key={header.id}
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {
                            <i
                              className={
                                {
                                  none: '',
                                  asc: 'tabler-chevron-up text-xl',
                                  desc: 'tabler-chevron-down text-xl'
                                }[String(header.column.getIsSorted() ? header.column.getIsSorted() : 'none')] ?? ''
                              }
                            />
                          }
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
                    <tr
                      key={row.memberId}
                      className={classnames({ selected: tableRow.getIsSelected() }, 'cursor-pointer hover:bg-gray-50')}
                      onClick={() => handleUserClick(row)}
                    >
                      {tableRow.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
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
            const newsize = parseInt(event.target.value, 10)

            handleSizeChange(newsize)
            handlePageChange(0)
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
      {addUserModalOpen && <AddUserModal open={addUserModalOpen} setOpen={setAddUserModalOpen} />}
      {userDetailModalOpen && selectedUser && (
        <UserModal
          open={userDetailModalOpen}
          setOpen={setUserDetailModalOpen}
          data={selectedUser}
          handlePageChange={() => handlePageChange(0)} //수정 시 데이터 리페치를 위한 상태
        />
      )}
    </>
  )
}

export default EmployeePage
