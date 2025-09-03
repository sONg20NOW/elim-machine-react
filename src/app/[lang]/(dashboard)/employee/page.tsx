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
import { createColumnHelper, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { Input } from '@mui/material'

import { toast } from 'react-toastify'

// Component Imports
import TableFilters from './_components/TableFilters'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import UserModal from './_components/UserModal'
import AddUserModal from './_components/addUserModal'
import type { UsersType } from '@/app/_schema/types'
import { CustomizedTable } from '@/app/_components/table/CustomizedTable'
import { HEADERS } from '@/app/_constant/constants'
import type { EditUserInfoData } from '@/data/type/userInfoTypes'

const initialFilters = {
  roleDescription: '',
  companyName: '',
  officeDepartmentName: '',
  officePosition: '',
  memberStatus: '',
  careerYear: '',
  contractType: '',
  laborForm: '',
  workForm: '',
  gender: '',
  foreignYn: '',

  // 이름으로 검색
  name: '',

  // 고정
  page: 0,
  size: 30
}

// Column Definitions
const columnHelper = createColumnHelper<UsersType>()

// Column 생성 함수
/**
 * row.original = 해당 행의 원본 데이터 객체
 * @param id
 * 컬럼의 키로 사용되는 값
 * @param header
 * 테이블 헤더 텍스트
 * @returns
 */
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

const EmployeePage = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<UsersType[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [name, setName] = useState('')

  // States에 추가
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<EditUserInfoData | null>(null)
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false)

  // 필터 상태 - 컬럼에 맞게 수정
  const [filters, setFilters] = useState(initialFilters)

  const queryParams = new URLSearchParams()

  // 직원 리스트 호출 API 함수
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
        console.log(result?.data)
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

  // 컬럼 생성
  const columns = useMemo<ColumnDef<UsersType, string>[]>(
    () =>
      (Object.keys(HEADERS.members) as Array<keyof typeof HEADERS.members>).map(key =>
        ColumnAccessor(key, HEADERS.members[key])
      ),
    []
  )

  // 필터 함수
  const filterFns = {
    fuzzy: (row: { getValue: (arg0: any) => any }, columnId: any, filterValue: string) => {
      const value = row.getValue(columnId)

      return value?.toString().toLowerCase().includes(filterValue.toLowerCase())
    }
  }

  // table 인스턴스 생성
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

  // TODO: 현재 sort 기능 미구현으로 불가.
  // 정렬 시 마다 그에 맞게 데이터 페칭
  // const handleToggleSorting = async (headerId: string, isSorted: boolean | 'asc' | 'desc') => {
  //   if (isSorted) {
  //     try {
  //       const response = await fetch(
  //         `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members?${queryParams.toString()}`,
  //         {
  //           method: 'GET',
  //           body: JSON.stringify({ sort: [headerId, isSorted] })
  //         }
  //       )

  //       const result = await response.json()

  //       setData(result?.data.content ?? [])
  //       setTotalCount(result?.data.page.totalElements)
  //     } catch (error) {
  //       toast.error(`Failed to fetch filtered data: ${error}`)
  //     } finally {
  //       setLoading(false)
  //     }
  //   } else {
  //     fetchFilteredData(filters)
  //   }
  // }

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

    if (response.ok) {
      setSelectedUser(data.data)
      setUserDetailModalOpen(true)
    } else {
      toast.error(data.message)
    }
  }

  return (
    <>
      <Card>
        <Button
          startIcon={<i className='tabler-reload' />}
          onClick={() => setFilters(initialFilters)}
          className='max-sm:is-full absolute right-8 top-8'
          disabled={loading}
        >
          필터 초기화
        </Button>
        <CardHeader title='직원관리' className='pbe-4' />
        <TableFilters filters={filters} onFiltersChange={setFilters} loading={loading} />

        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex justify-center items-center gap-2'>
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
                padding: '3px 10px',
                borderTopRightRadius: 6,
                borderBottomRightRadius: 6,
                borderTopLeftRadius: 6,
                borderBottomLeftRadius: 6
              }}
              disableUnderline={true}
            />
            <Button
              variant={'contained'}
              className='text-color-primary-light  hover:text-color-primary-dark grid place-items-center p-[5px]'
            >
              <i className='tabler-search text-3xl text-white' onClick={() => handleNameChange(name)} />
            </Button>
          </div>

          <div className='flex sm:flex-row max-sm:is-full items-start sm:items-center gap-10'>
            <div className='flex gap-3 itmes-center'>
              <span className='grid place-items-center'>페이지당 행 수 </span>
              <CustomTextField
                select
                value={filters.size}
                onChange={e => handleSizeChange(Number(e.target.value))}
                className='gap-[5px]'
                disabled={loading}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </CustomTextField>
            </div>
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

        {/* 테이블 */}
        <CustomizedTable<UsersType> table={table} data={data} loading={loading} handleRowClick={handleUserClick} />
        {/* 페이지네이션 */}
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
      {addUserModalOpen && (
        <AddUserModal
          open={addUserModalOpen}
          setOpen={setAddUserModalOpen}
          handlePageChange={() => handlePageChange(0)}
        />
      )}
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
