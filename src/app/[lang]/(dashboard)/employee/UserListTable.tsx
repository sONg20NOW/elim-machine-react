'use client'

// React Imports
import { useEffect, useState, useMemo, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

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

import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import TableFilters from './TableFilters'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import UserModal from './UserModal'
import AddUserModal from './addUserModal'

type UsersTypeWithAction = UsersType & {
  action?: string
}

// Column Definitions
const columnHelper = createColumnHelper<UsersTypeWithAction>()

const UserListTable = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<UsersType[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')

  // States에 추가
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsersType | null>(null)
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false)

  // 필터 상태 - 컬럼에 맞게 수정
  const [filters, setFilters] = useState({
    search: '',
    roleDescription: '',
    companyName: '',
    officeDepartmentName: '',
    officePosition: '',
    memberStatusDescription: '',
    page: 0,
    pageSize: 30,
    careerYear: 0,
    contractType: '',
    laborForm: '',
    workForm: '',
    gender: '',
    foreignYn: ''
  })

  // API 호출 함수
  const fetchFilteredData = useCallback(async (filterParams: any) => {
    setLoading(true)

    try {
      const queryParams = new URLSearchParams()

      if (filterParams.roleDescription) {
        queryParams.append('roleDescription', filterParams.roleDescription)
      }

      if (filterParams.companyName) {
        queryParams.append('companyName', filterParams.companyName)
      }

      if (filterParams.officeDepartmentName) {
        queryParams.append('officeDepartmentName', filterParams.officeDepartmentName)
      }

      if (filterParams.officePosition) {
        queryParams.append('officePosition', filterParams.officePosition)
      }

      if (filterParams.careerYear) {
        queryParams.append('careerYear', filterParams.careerYear)
      }

      if (filterParams.contractType) {
        queryParams.append('contractType', filterParams.contractType)
      }

      if (filterParams.laborForm) {
        queryParams.append('laborForm', filterParams.laborForm)
      }

      if (filterParams.gender) {
        queryParams.append('gender', filterParams.gender)
      }

      if (filterParams.workForm) {
        queryParams.append('workForm', filterParams.workForm)
      }

      if (filterParams.foreignYn) {
        queryParams.append('foreignYn', String(filterParams.foreignYn))
      }

      // // 서버 API에 맞게 파라미터 설정
      queryParams.append('page', String(filterParams.page))

      queryParams.append('size', String(filterParams.pageSize))

      // 필터 조건들 추가
      if (filterParams.search) {
        queryParams.append('name', filterParams.search)
      }

      if (filterParams.memberStatusDescription) {
        queryParams.append('memberStatus', filterParams.memberStatusDescription)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members?${queryParams.toString()}`, {
        method: 'GET'
      })

      const result = await response.json()

      setData(result?.data.content ?? [])
      setTotalCount(result?.data.page.totalElements)
      console.log(result)
    } catch (error) {
      console.error('Failed to fetch filtered data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 필터 변경 시 API 호출
  useEffect(() => {
    fetchFilteredData(filters)
  }, [filters, fetchFilteredData])

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
    () => [
      ColumnAccessor('memberId', 'ID'),
      ColumnAccessor('roleDescription', '권한'),
      ColumnAccessor('name', '이름'),
      ColumnAccessor('staffNum', '사번'),
      ColumnAccessor('companyName', '소속'),
      ColumnAccessor('officeDepartmentName', '부서'),
      ColumnAccessor('officePositionDescription', '직위'),
      ColumnAccessor('age', '나이'),
      ColumnAccessor('email', '이메일'),
      ColumnAccessor('phoneNumber', '휴대폰'),
      ColumnAccessor('isTechnician', '기술인'),
      ColumnAccessor('joinDate', '입사일'),
      ColumnAccessor('careerYear', '근속년수'),
      ColumnAccessor('memberStatusDescription', '상태')
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
        pageSize: filters.pageSize
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
      search: value,
      page: 0
    }))
  }

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (pageSize: number) => {
    setFilters(prev => ({
      ...prev,
      pageSize,
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

  const oneUserClickedHandler = async (user: UsersType) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members/${user?.memberId}`, {
      method: 'GET'
    })

    const data = await response.json()

    setSelectedUser(data.data)
  }

  // 사용자 선택 핸들러
  const handleUserClick = (user: UsersType) => {
    oneUserClickedHandler(user)
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
              value={filters.pageSize}
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
          rowsPerPage={filters.pageSize}
          page={filters.page}
          onPageChange={(_, newPage) => handlePageChange(newPage)}
          onRowsPerPageChange={event => {
            const newPageSize = parseInt(event.target.value, 10)

            handlePageSizeChange(newPageSize)
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
        <UserModal open={userDetailModalOpen} setOpen={setUserDetailModalOpen} data={selectedUser} />
      )}
    </>
  )
}

export default UserListTable
