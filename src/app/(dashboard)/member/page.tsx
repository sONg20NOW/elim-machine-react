'use client'

import { useEffect, useState, useCallback, useContext, useRef } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import { IconReload } from '@tabler/icons-react'

import TableFilters from '../../../@core/components/custom/TableFilters'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import UserModal from './_components/UserModal'
import type { MemberFilterType, memberPageDtoType, successResponseDtoType } from '@/@core/types'
import BasicTable from '@/@core/components/custom/BasicTable'
import SearchBar from '@/@core/components/custom/SearchBar'
import { MEMBER_FILTER_INFO } from '@/app/_constants/filter/MemberFilterInfo'
import { DEFAULT_PAGESIZE, PageSizeOptions } from '@/app/_constants/options'
import { MemeberInitialFilters } from '@/app/_constants/MemberSeed'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { auth } from '@/lib/auth'
import { createInitialSorting, HEADERS } from '@/app/_constants/table/TableHeader'
import { isTabletContext } from '@/@core/components/custom/ProtectedPage'
import AddUserModal from './_components/AddUserModall'
import { useGetSingleMember } from '@/@core/hooks/customTanstackQueries'

export default function MemberPage() {
  const isTablet = useContext(isTabletContext)

  // 데이터 리스트
  const [data, setData] = useState<memberPageDtoType[]>([])

  // 로딩 시도 중 = true, 로딩 끝 = false
  const [loading, setLoading] = useState(false)

  // 에러 발생 시 true
  const [error, setError] = useState(false)

  // 로딩이 끝나고 에러가 없으면 not disabled
  const disabled = loading || error

  // 전체 데이터 개수 => fetching한 데이터에서 추출
  const [totalCount, setTotalCount] = useState(0)

  // 이름 검색 인풋
  const [name, setName] = useState('')

  // 지역 검색 인풋
  const [region, setRegion] = useState('')

  // 페이지네이션 관련
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(DEFAULT_PAGESIZE)

  // 모달 관련 상태
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false)
  const [memberId, setMemberId] = useState(0)

  const { data: selectedUser } = useGetSingleMember(memberId.toString())

  // 필터 상태 - 컬럼에 맞게 수정
  const [filters, setFilters] = useState(MemeberInitialFilters)

  // 정렬 상태
  const [sorting, setSorting] = useState(createInitialSorting<memberPageDtoType>)

  // 선택 삭제 기능 관련
  const [showCheckBox, setShowCheckBox] = useState(false)
  const [checked, setChecked] = useState<{ memberId: number; version: number }[]>([])

  // 직원 리스트 호출 API 함수
  const getFilteredData = useCallback(async () => {
    setLoading(true)
    setError(false)

    // 데이터 페치에 사용되는 쿼리 URL
    const queryParams = new URLSearchParams()

    try {
      // 필터링
      Object.keys(filters).forEach(prop => {
        const key = prop as keyof MemberFilterType

        filters[key] ? queryParams.set(prop, filters[key] as string) : queryParams.delete(prop)
      })

      // 정렬
      sorting.sort ? queryParams.set('sort', `${sorting.target},${sorting.sort}`) : queryParams.delete('sort')

      // 이름 검색
      name ? queryParams.set('name', name) : queryParams.delete('name')

      // 지역 검색
      region ? queryParams.set('region', region) : queryParams.delete('region')

      // 페이지 설정
      queryParams.set('page', page.toString())
      queryParams.set('size', size.toString())

      // axios GET 요청
      // const response = await auth.get<{ data: successResponseDtoType<memberPageDtoType[]> }>(
      //   `/api/members?${queryParams.toString()}`
      // )
      const response = await auth.get<{ data: successResponseDtoType<memberPageDtoType[]> }>(
        `/api/members?${queryParams.toString()}`
      )

      const result = response.data.data

      // 상태 업데이트
      setData(result.content ?? [])
      setPage(result.page.number)
      setSize(result.page.size)
      setTotalCount(result.page.totalElements)
    } catch (error: any) {
      handleApiError(error, '데이터 조회에 실패했습니다.')
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filters, sorting, page, size, name, region])

  // 필터 변경 시 API 호출
  useEffect(() => {
    getFilteredData()
  }, [filters, getFilteredData])

  // 모달 닫힐 때마다 목록 새로 고침
  const firstRender = useRef(true)
  const openModal = addUserModalOpen || userDetailModalOpen

  useEffect(() => {
    if (firstRender.current) {
      return
    }

    if (!openModal) {
      getFilteredData()
    }
  }, [openModal, getFilteredData])

  useEffect(() => {
    firstRender.current = false
  }, [])

  // 사용자 선택 핸들러 (디테일 모달)
  const handleUserClick = async (user: memberPageDtoType) => {
    // const response = await auth.get(`/api/members/${user?.memberId}`)

    // const data = await response.json()

    // if (response.ok) {
    //   setSelectedUser(data.data)
    //   setUserDetailModalOpen(true)
    // } else {
    //   toast.error(data.message)
    // }
    try {
      setMemberId(user.memberId)
      setUserDetailModalOpen(true)
    } catch (error) {
      handleApiError(error)
    }
  }

  // 사용자 체크 핸들러 (다중선택)
  const handleCheckUser = (user: memberPageDtoType) => {
    const obj = { memberId: user.memberId, version: user.version }
    const checked = isChecked(user)

    if (!checked) {
      setChecked(prev => prev.concat(obj))
    } else {
      setChecked(prev => prev.filter(v => v.memberId !== user.memberId))
    }
  }

  const handleCheckAllUsers = (checked: boolean) => {
    if (checked) {
      setChecked(prev => {
        const newPrev = structuredClone(prev)

        data.forEach(user => {
          if (!prev.find(v => v.memberId === user.memberId)) {
            newPrev.push({ memberId: user.memberId, version: user.version })
          }
        })

        return newPrev
      })
    } else {
      setChecked([])
    }
  }

  const isChecked = (user: memberPageDtoType) => {
    let exist = false

    checked.forEach(v => {
      if (JSON.stringify(v) === JSON.stringify({ memberId: user.memberId, version: user.version })) exist = true
    })

    return exist
  }

  // 여러 유저 한번에 삭제
  async function handleDeleteUsers() {
    if (!checked.length) return

    try {
      await auth.delete(`/api/members`, {
        //@ts-ignore
        data: { memberDeleteRequestDtos: checked }
      })
      setFilters(MemeberInitialFilters)
      setName('')
      setRegion('')
      setPage(0)

      getFilteredData()
      handleSuccess(`선택된 직원 ${checked.length}명이 성공적으로 삭제되었습니다.`)
      setShowCheckBox(false)
      setChecked([])
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <>
      <Card className='relative h-full flex flex-col'>
        {/* 탭 제목 */}
        <CardHeader title={`직원관리 (${totalCount})`} className='pbe-4' />
        {/* 필터바 */}
        {!isTablet && (
          <TableFilters<MemberFilterType>
            filterInfo={MEMBER_FILTER_INFO}
            filters={filters}
            onFiltersChange={setFilters}
            disabled={disabled}
            setPage={setPage}
          />
        )}
        {/* 필터 초기화 버튼 */}
        {!isTablet && (
          <Button
            startIcon={<IconReload />}
            onClick={() => {
              setFilters(MemeberInitialFilters)
              setName('')
              setPage(0)
              setRegion('')
            }}
            className='max-sm:is-full absolute right-8 top-8'
            disabled={disabled}
          >
            필터 초기화
          </Button>
        )}
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-3 sm:p-6 border-bs gap-2 sm:gap-4'>
          <div className='flex gap-2'>
            {/* 페이지당 행수 */}
            <CustomTextField
              size='small'
              select
              value={size.toString()}
              onChange={e => {
                setSize(Number(e.target.value))
                setPage(0)
              }}
              className='gap-[5px]'
              disabled={disabled}
              slotProps={{
                select: {
                  renderValue: selectedValue => {
                    return selectedValue + ' 개씩'
                  }
                }
              }}
            >
              {PageSizeOptions.map(pageSize => (
                <MenuItem key={pageSize} value={pageSize}>
                  {pageSize}
                  {`\u00a0\u00a0`}
                </MenuItem>
              ))}
            </CustomTextField>
            {/* 이름으로 검색 */}
            <SearchBar
              placeholder='이름으로 검색'
              setSearchKeyword={name => {
                setName(name)
                setPage(0)
              }}
              disabled={disabled}
            />
            {/* 지역으로 검색 */}
            {!isTablet && (
              <SearchBar
                placeholder='지역으로 검색'
                setSearchKeyword={region => {
                  setRegion(region)
                  setPage(0)
                }}
                disabled={disabled}
              />
            )}
          </div>

          <div className='flex sm:flex-row max-sm:is-full items-start sm:items-center gap-2 sm:gap-4'>
            {/* 한번에 삭제 */}
            {!showCheckBox ? (
              <Button disabled={disabled} variant='contained' onClick={() => setShowCheckBox(prev => !prev)}>
                선택 삭제
              </Button>
            ) : (
              <div className='flex gap-1'>
                <Button variant='contained' color='error' onClick={() => handleDeleteUsers()}>
                  {`(${checked.length}) 삭제`}
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  onClick={() => {
                    setShowCheckBox(prev => !prev)
                    handleCheckAllUsers(false)
                  }}
                >
                  취소
                </Button>
              </div>
            )}

            {/* 유저 추가 버튼 */}
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddUserModalOpen(!addUserModalOpen)}
              disabled={disabled}
            >
              추가
            </Button>
          </div>
        </div>

        {/* 테이블 */}
        <div className='flex-1 overflow-y-hidden'>
          <BasicTable<memberPageDtoType>
            header={HEADERS.member}
            data={data}
            handleRowClick={handleUserClick}
            page={page}
            pageSize={size}
            multiException={{ age: ['age', 'genderDescription'] }}
            sorting={sorting}
            setSorting={setSorting}
            loading={loading}
            error={error}
            showCheckBox={showCheckBox}
            isChecked={isChecked}
            handleCheckItem={handleCheckUser}
            handleCheckAllItems={handleCheckAllUsers}
          />
        </div>
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
          selectedUserData={selectedUser}
          reloadData={() => getFilteredData()}
        />
      )}
    </>
  )
}
