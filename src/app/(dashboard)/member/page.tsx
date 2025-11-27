'use client'

import { useEffect, useState, useCallback, useContext, useRef } from 'react'

// MUI Imports
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import { IconReload } from '@tabler/icons-react'

import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import UserModal from './_components/UserModal'
import type { MemberFilterType, MemberPageDtoType } from '@/@core/types'
import BasicTable from '@/@core/components/custom/BasicTable'
import SearchBar from '@/@core/components/custom/SearchBar'
import { MEMBER_FILTER_INFO } from '@/app/_constants/filter/MemberFilterInfo'
import { DEFAULT_PAGESIZE, PageSizeOptions } from '@/app/_constants/options'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { auth } from '@/lib/auth'
import { HEADERS } from '@/app/_constants/table/TableHeader'
import { isTabletContext } from '@/@core/components/custom/ProtectedPage'
import AddUserModal from './_components/AddUserModall'
import { useGetMembers, useGetSingleMember } from '@/@core/hooks/customTanstackQueries'
import TableFilter from '@/@core/components/custom/TableFilter'

export default function MemberPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const isTablet = useContext(isTabletContext)

  const { data: membersPages, refetch, isLoading, isError } = useGetMembers(searchParams.toString())

  const data = membersPages?.content ?? []

  const page = Number(searchParams.get('page') ?? 0)
  const size = Number(searchParams.get('size') ?? DEFAULT_PAGESIZE)
  const name = searchParams.get('name')
  const region = searchParams.get('region')

  const disabled = isLoading || isError

  const totalCount = membersPages?.page.totalElements ?? 0

  // 모달 관련 상태
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false)
  const [memberId, setMemberId] = useState(0)

  const { data: selectedUser } = useGetSingleMember(memberId.toString())

  // 선택삭제 기능 관련
  const [showCheckBox, setShowCheckBox] = useState(false)
  const [checked, setChecked] = useState<{ memberId: number; version: number }[]>([])

  // 모달 닫힐 때마다 목록 새로 고침
  const firstRender = useRef(true)
  const openModal = addUserModalOpen || userDetailModalOpen

  useEffect(() => {
    if (firstRender.current) {
      return
    }

    if (!openModal) {
      refetch()
    }
  }, [openModal, refetch])

  useEffect(() => {
    firstRender.current = false
  }, [])

  // params를 변경하는 함수를 입력하면 해당 페이지로 라우팅까지 해주는 함수
  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams)

      updater(params)
      router.replace(pathname + '?' + params.toString())
    },
    [router, pathname, searchParams]
  )

  type paramType = 'page' | 'size' | 'name' | 'region'

  const setQueryParams = useCallback(
    (pairs: Partial<Record<paramType, string | number>>) => {
      if (!pairs) return

      updateParams(params => {
        Object.entries(pairs).forEach(([key, value]) => {
          const t_key = key as paramType

          params.set(t_key, value.toString())
        })
      })
    },
    [updateParams]
  )

  const resetQueryParams = useCallback(() => {
    updateParams(params => {
      params.delete('page')
      params.delete('name')
      params.delete('region')
      params.delete('sort')

      const filterKeys = Object.keys(MEMBER_FILTER_INFO)

      filterKeys.forEach(v => params.delete(v))
    })
  }, [updateParams])

  // 사용자 선택 핸들러 (디테일 모달)
  const handleUserClick = async (user: MemberPageDtoType) => {
    try {
      setMemberId(user.memberId)
      setUserDetailModalOpen(true)
    } catch (error) {
      handleApiError(error)
    }
  }

  // 사용자 체크 핸들러 (다중선택)
  const handleCheckUser = (user: MemberPageDtoType) => {
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

  const isChecked = (user: MemberPageDtoType) => {
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

      setQueryParams({ page: 0 })
      refetch()
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
        {!isTablet && <TableFilter<MemberFilterType> filterInfo={MEMBER_FILTER_INFO} disabled={disabled} />}
        {/* 필터 초기화 버튼 */}
        {!isTablet && (
          <Button
            startIcon={<IconReload />}
            onClick={() => {
              resetQueryParams()
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
                setQueryParams({ size: e.target.value, page: 0 })
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
              key={`name_${name}`}
              defaultValue={name ?? ''}
              placeholder='이름으로 검색'
              setSearchKeyword={name => {
                setQueryParams({ name: name, page: 0 })
              }}
              disabled={disabled}
            />
            {/* 지역으로 검색 */}
            {!isTablet && (
              <SearchBar
                key={`region${region}`}
                defaultValue={region ?? ''}
                placeholder='지역으로 검색'
                setSearchKeyword={region => {
                  setQueryParams({ region: region, page: 0 })
                }}
                disabled={disabled}
              />
            )}
          </div>

          <div className='flex sm:flex-row max-sm:is-full items-start sm:items-center gap-2 sm:gap-4'>
            {/* 한번에 삭제 */}
            {!showCheckBox ? (
              <Button disabled={disabled} variant='contained' onClick={() => setShowCheckBox(prev => !prev)}>
                선택삭제
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
          <BasicTable<MemberPageDtoType>
            header={HEADERS.member}
            data={data}
            handleRowClick={handleUserClick}
            page={page}
            pageSize={size}
            multiException={{ age: ['age', 'genderDescription'] }}
            loading={isLoading}
            error={isError}
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
          onPageChange={(_, newPage) => setQueryParams({ page: newPage })}
          onRowsPerPageChange={event => {
            const newSize = parseInt(event.target.value, 10)

            setQueryParams({ size: newSize, page: 0 })
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
        <AddUserModal
          open={addUserModalOpen}
          setOpen={setAddUserModalOpen}
          handlePageChange={() => setQueryParams({ page: 0 })}
        />
      )}
      {userDetailModalOpen && selectedUser && (
        <UserModal
          open={userDetailModalOpen}
          setOpen={setUserDetailModalOpen}
          selectedUserData={selectedUser}
          reloadData={() => refetch()}
        />
      )}
    </>
  )
}
