'use client'

import { useEffect, useState, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

import { toast } from 'react-toastify'

// Component Imports
import TableFilters from './_components/TableFilters'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import UserModal from './_components/UserModal'
import AddUserModal from './_components/addUserModal'
import type { memberDetailDtoType, EmployeeFilterType, memberPageDtoType } from '@/app/_schema/types'
import { HEADERS, InitialSorting } from '@/app/_schema/TableHeader'
import BasicTable from '@/app/_components/table/BasicTable'
import SearchBar from '@/app/_components/SearchBar'

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
  const [data, setData] = useState<memberPageDtoType[]>([])

  // 로딩 시도 중 = true, 로딩 끝 = false
  const [loading, setLoading] = useState(false)

  // 에러 발생 시 true
  const [error, setError] = useState(false)
  const disabled = loading || error

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
  const [selectedUser, setSelectedUser] = useState<memberDetailDtoType | null>(null)
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false)

  // 필터 상태 - 컬럼에 맞게 수정
  const [filters, setFilters] = useState(initialFilters)

  // 정렬 상태
  const [sorting, setSorting] = useState(InitialSorting)

  const queryParams = new URLSearchParams()

  // 직원 리스트 호출 API 함수
  const fetchFilteredData = useCallback(async () => {
    setLoading(true)
    setError(false)

    try {
      // 필터링
      Object.keys(filters).map(prop => {
        const key = prop as keyof EmployeeFilterType

        if (filters[key]) {
          queryParams.set(prop, filters[key] as string)
        } else {
          queryParams.delete(prop)
        }
      })

      // 정렬
      if (sorting.sort) {
        queryParams.append('sort', `${sorting.target},${sorting.sort}`.toString())
      } else {
        queryParams.delete('sort')
      }

      // 이름으로 검색
      if (nameToFilter) {
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
      setPage(result?.data.page.number)
      setSize(result?.data.page.size)
      setTotalCount(result?.data.page.totalElements)
      console.log(result)
    } catch (error) {
      toast.error(`Failed to fetch filtered data: ${error}`)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filters, sorting, page, size, nameToFilter])

  // 필터 변경 시 API 호출
  useEffect(() => {
    fetchFilteredData()
  }, [filters, fetchFilteredData])

  // 사용자 선택 핸들러
  const handleUserClick = async (user: memberPageDtoType) => {
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
        {/* 필터 초기화 버튼 */}
        <Button
          startIcon={<i className='tabler-reload' />}
          onClick={() => setFilters(initialFilters)}
          className='max-sm:is-full absolute right-8 top-8'
          disabled={disabled}
        >
          필터 초기화
        </Button>
        {/* 탭 제목 */}
        <CardHeader title='직원관리' className='pbe-4' />
        {/* 필터바 */}
        <TableFilters filters={filters} onFiltersChange={setFilters} disabled={disabled} setPage={setPage} />

        <div className=' flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          {/* 이름으로 검색 */}
          <SearchBar
            name={name}
            setName={setName}
            onClick={() => {
              setNameToFilter(name)
              setPage(0)
            }}
            disabled={disabled}
          />

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
                className='gap-[5px]'
                disabled={disabled}
              >
                {PageSizeOptions.map(pageSize => (
                  <MenuItem key={pageSize} value={pageSize}>
                    {pageSize}
                  </MenuItem>
                ))}
              </CustomTextField>
            </div>

            {/* 유저 추가 버튼 */}
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddUserModalOpen(!addUserModalOpen)}
              className='max-sm:is-full'
              disabled={disabled}
            >
              추가
            </Button>
          </div>
        </div>

        {/* 테이블 */}
        <BasicTable<memberPageDtoType>
          header={HEADERS.employee}
          data={data}
          handleRowClick={handleUserClick}
          page={page}
          pageSize={size}
          Exceptions={{ age: ['age', 'genderDescription'] }}
          sorting={sorting}
          setSorting={setSorting}
          disabled={disabled}
        />

        {/* 로딩 표시 */}
        {loading && <div className='text-center p-4'>Loading...</div>}

        {/* 데이터가 없을 경우 */}
        {error && <div className='text-center p-4'>There is problem in fetching data...</div>}

        {/* 페이지네이션 */}
        <TablePagination
          rowsPerPageOptions={PageSizeOptions}
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

      {/* 모달들 */}
      {addUserModalOpen && (
        <AddUserModal open={addUserModalOpen} setOpen={setAddUserModalOpen} handlePageChange={() => setPage(0)} />
      )}
      {userDetailModalOpen && selectedUser && (
        <UserModal
          open={userDetailModalOpen}
          setOpen={setUserDetailModalOpen}
          data={selectedUser}
          reloadData={() => fetchFilteredData()}
        />
      )}
    </>
  )
}

export default EmployeePage
