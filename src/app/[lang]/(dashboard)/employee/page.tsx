'use client'

// React Imports
import { useEffect, useState, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

import { Input } from '@mui/material'

import { toast } from 'react-toastify'

// Component Imports
import TableFilters from './_components/TableFilters'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import UserModal from './_components/UserModal'
import AddUserModal from './_components/addUserModal'
import type { EditUserInfoData, EmployeeFilterType, UsersType } from '@/app/_schema/types'
import { CustomizedTable } from '@/app/_components/table/CustomizedTable'
import { HEADERS } from '@/app/_schema/TableHeader'
import CreateTableInstance from '@/app/_components/table/CreateTableInstance'
import CreateColumns from '@/app/_components/table/CreateColumns'

// 초기 필터링 값
const initialFilters: EmployeeFilterType = {
  role: '',
  companyName: '',
  officeDepartmentName: '',
  officePosition: '',
  memberStatus: '',
  careerYear: '',
  contractType: '',
  laborForm: '',
  workForm: '',
  gender: '',
  foreignYn: ''
}

// 페이지 당 행수 선택 옵션
const PageSizeOptions = [1, 10, 30, 50]

const EmployeePage = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<UsersType[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // 이름 검색 인풋
  const [name, setName] = useState('')

  // 실제 필터링에 사용되는 상태
  const [nameToFilter, setNameToFilter] = useState('')

  // 페이지네이션 관련
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(30)

  // States에 추가
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<EditUserInfoData | null>(null)
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false)

  // 필터 상태 - 컬럼에 맞게 수정
  const [filters, setFilters] = useState(initialFilters)

  const queryParams = new URLSearchParams()

  // 직원 리스트 호출 API 함수
  const fetchFilteredData = useCallback(async () => {
    setLoading(true)

    try {
      // 필터링
      Object.keys(filters).map(filter => {
        const key = filter as keyof EmployeeFilterType

        if (filters[key]) {
          queryParams.set(filter, filters[key] as string)
        } else {
          queryParams.delete(filter)
        }
      })

      // 이름으로 검색
      if (nameToFilter !== '') {
        queryParams.set('name', nameToFilter)
      } else {
        queryParams.delete('name')
      }

      // 페이지 관련 설정
      queryParams.set('page', page.toString())
      queryParams.set('size', size.toString())

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members?${queryParams.toString()}`, {
        method: 'GET'
      })

      const result = await response.json()

      setData(result?.data.content ?? [])
      setTotalCount(result?.data.page.totalElements)
      console.log(result?.data)
    } catch (error) {
      toast.error(`Failed to fetch filtered data: ${error}`)
    } finally {
      setLoading(false)
    }
  }, [filters, page, size, nameToFilter])

  // 필터 변경 시 API 호출
  useEffect(() => {
    fetchFilteredData()
  }, [filters, fetchFilteredData])

  // column 생성
  const columns = CreateColumns<UsersType>(HEADERS.employee)

  // table 인스턴스 생성
  const table = CreateTableInstance<UsersType>({ data, columns, rowSelection, setRowSelection, pageSize: size })

  // TODO: 현재 sort 기능 미구현으로 불가.
  // 정렬 시 마다 그에 맞게 데이터 페칭
  const handleToggleSorting = async (headerId: string, isSorted: boolean | 'asc' | 'desc') => {
    if (isSorted) {
      try {
        queryParams.set('sort', `${headerId}, ${isSorted as 'asc' | 'desc'}`)
        fetchFilteredData()
      } catch (error) {
        toast.error(`Failed to fetch filtered data: ${error}`)
      } finally {
        setLoading(false)
      }
    } else {
      queryParams.delete('sort')
      fetchFilteredData()
    }
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
        <TableFilters filters={filters} onFiltersChange={setFilters} loading={loading} setPage={setPage} />

        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex justify-center items-center gap-2'>
            <Input
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              id='name_search_input'
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  setNameToFilter(name)
                  setPage(0)
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
              <i
                className='tabler-search text-3xl text-white'
                onClick={() => {
                  setNameToFilter(name)
                  setPage(0)
                }}
              />
            </Button>
          </div>

          <div className='flex sm:flex-row max-sm:is-full items-start sm:items-center gap-10'>
            <div className='flex gap-3 itmes-center'>
              <span className='grid place-items-center'>페이지당 행 수 </span>
              <CustomTextField
                select
                value={size.toString()}
                onChange={e => {
                  setSize(Number(e.target.value))
                  setPage(0)
                }}
                className='gap-[5px]'
                disabled={loading}
              >
                {PageSizeOptions.map(pageSize => (
                  <MenuItem key={pageSize} value={pageSize}>
                    {pageSize}
                  </MenuItem>
                ))}
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
        <CustomizedTable<UsersType>
          table={table}
          data={data}
          loading={loading}
          handleRowClick={handleUserClick}
          handleToggleSorting={handleToggleSorting}
        />
        {/* 페이지네이션 */}
        <TablePagination
          rowsPerPageOptions={PageSizeOptions} // 1 추가 (테스트용)
          component='div'
          count={totalCount}
          rowsPerPage={size}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={event => {
            const newsize = parseInt(event.target.value, 10)

            setSize(newsize)
            setPage(0)
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
        <AddUserModal open={addUserModalOpen} setOpen={setAddUserModalOpen} handlePageChange={() => setPage(0)} />
      )}
      {userDetailModalOpen && selectedUser && (
        <UserModal
          open={userDetailModalOpen}
          setOpen={setUserDetailModalOpen}
          data={selectedUser}
          reloadDate={() => fetchFilteredData()} //수정 시 데이터 리페치를 위한 상태
        />
      )}
    </>
  )
}

export default EmployeePage
