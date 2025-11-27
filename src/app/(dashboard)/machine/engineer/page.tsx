'use client'

import { useState, useCallback } from 'react'

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
import UserModal from './_components/EngineerDetailModal'
import AddUserModal from './_components/AddEngineerModal'
import type { EngineerFilterType, EngineerResponseDtoType, MachineEngineerPageResponseDtoType } from '@/@core/types'
import { HEADERS } from '@/app/_constants/table/TableHeader'
import BasicTable from '@/@core/components/custom/BasicTable'
import SearchBar from '@/@core/components/custom/SearchBar'
import { DEFAULT_PAGESIZE, PageSizeOptions } from '@/app/_constants/options'
import { ENGINEER_FILTER_INFO } from '@/app/_constants/filter/EngineerFilterInfo'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { auth } from '@/lib/auth'
import { useGetEngineers } from '@/@core/hooks/customTanstackQueries'
import TableFilterWithSearchParams from '@/@core/components/custom/TableFilterWithSearchParams'

/**
 * @type T
 * MachineEngineerPageResponseDtoType
 * @type K
 * MachineDetialResponseDtoType
 * @returns
 */
export default function EngineerPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  // 데이터 리스트
  const { data: engineersPages, refetch, isLoading, isError } = useGetEngineers(searchParams.toString())
  const data = engineersPages?.content ?? []

  // 로딩 시도 중 = true, 로딩 끝 = false
  const [loading, setLoading] = useState(false)

  // 로딩이 끝나고 에러가 없으면 not disabled
  const disabled = loading || isError || isLoading

  // 전체 데이터 개수 => fetching한 데이터에서 추출
  const totalCount = engineersPages?.page.totalElements ?? 0

  // 페이지네이션 관련
  const page = Number(searchParams.get('page') ?? 0)
  const size = Number(searchParams.get('size') ?? DEFAULT_PAGESIZE)
  const projectName = searchParams.get('projectName')
  const name = searchParams.get('name')

  // 모달 관련 상태
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false)

  const [selectedUser, setSelectedUser] = useState<EngineerResponseDtoType>()

  // 선택삭제 기능 관련
  const [showCheckBox, setShowCheckBox] = useState(false)
  const [checked, setChecked] = useState<{ engineerId: number; version: number }[]>([])

  // params를 변경하는 함수를 입력하면 해당 페이지로 라우팅까지 해주는 함수
  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams)

      updater(params)
      router.replace(pathname + '?' + params.toString())
    },
    [router, pathname, searchParams]
  )

  type paramType = 'page' | 'size' | 'name' | 'projectName'

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
      params.delete('projectName')
      params.delete('sort')

      const filterKeys = Object.keys(ENGINEER_FILTER_INFO)

      filterKeys.forEach(v => params.delete(v))
    })
  }, [updateParams])

  // 엔지니어 선택 핸들러
  const handleEngineerClick = async (engineerData: MachineEngineerPageResponseDtoType) => {
    try {
      const response = await auth.get<{ data: EngineerResponseDtoType }>(`/api/engineers/${engineerData.engineerId}`)

      const engineerInfo = response.data.data

      setSelectedUser(engineerInfo)
      setUserDetailModalOpen(true)
    } catch (error) {
      handleApiError(error, '엔지니어를 선택하는 데 실패했습니다.')
    }
  }

  // 설비인력 체크 핸들러 (다중선택)
  const handleCheckEngineer = (engineer: MachineEngineerPageResponseDtoType) => {
    const obj = { engineerId: engineer.engineerId, version: engineer.version }
    const checked = isChecked(engineer)

    if (!checked) {
      setChecked(prev => prev.concat(obj))
    } else {
      setChecked(prev => prev.filter(v => v.engineerId !== engineer.engineerId))
    }
  }

  const handleCheckAllEngineers = (checked: boolean) => {
    if (checked) {
      setChecked(prev => {
        const newChecked = structuredClone(prev)

        data.forEach(engineer => {
          if (!prev.find(v => v.engineerId === engineer.engineerId)) {
            newChecked.push({ engineerId: engineer.engineerId, version: engineer.version })
          }
        })

        return newChecked
      })
    } else {
      setChecked([])
    }
  }

  const isChecked = (engineer: MachineEngineerPageResponseDtoType) => {
    return checked.some(v => v.engineerId === engineer.engineerId)
  }

  // 여러 기술자 한번에 삭제
  async function handleDeleteEngineers() {
    if (!checked.length) return

    try {
      setLoading(true)
      await auth.delete(`/api/engineers`, {
        //@ts-ignore
        data: { engineerDeleteRequestDtos: checked }
      })
      setQueryParams({ page: 0 })
      refetch()
      handleSuccess(`선택된 기계설비 기술자 ${checked.length}명이 성공적으로 삭제되었습니다.`)
      setChecked([])
      setShowCheckBox(false)
    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className='relative h-full flex flex-col'>
        {/* 탭 제목 */}
        <CardHeader title={`기계설비 기술자 (${totalCount})`} className='pbe-4' />
        {/* 필터바 */}
        <TableFilterWithSearchParams<EngineerFilterType> filterInfo={ENGINEER_FILTER_INFO} disabled={disabled} />
        {/* 필터 초기화 버튼 */}
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
        <div className=' flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
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
            {/* 현장명으로 검색 */}
            <SearchBar
              key={`projectName_${projectName}`}
              defaultValue={projectName ?? ''}
              placeholder='현장명으로 검색'
              setSearchKeyword={projectName => {
                setQueryParams({ projectName: projectName, page: 0 })
              }}
              disabled={disabled}
            />
          </div>

          <div className='flex sm:flex-row max-sm:is-full items-start sm:items-center gap-5'>
            {/* 한번에 삭제 */}
            {!showCheckBox ? (
              <Button disabled={disabled} variant='contained' onClick={() => setShowCheckBox(prev => !prev)}>
                선택삭제
              </Button>
            ) : (
              <div className='flex gap-1'>
                <Button variant='contained' color='error' onClick={() => handleDeleteEngineers()}>
                  {`(${checked.length}) 삭제`}
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  onClick={() => {
                    setShowCheckBox(prev => !prev)
                    handleCheckAllEngineers(false)
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
              className='max-sm:is-full'
              disabled={disabled}
            >
              추가
            </Button>
          </div>
        </div>

        {/* 테이블 */}
        <div className='flex-1 overflow-y-hidden'>
          <BasicTable<MachineEngineerPageResponseDtoType>
            multiException={{ latestProjectBeginDate: ['latestProjectBeginDate', 'latestProjectEndDate'] }}
            header={HEADERS.engineers}
            data={data}
            handleRowClick={handleEngineerClick}
            page={page}
            pageSize={size}
            loading={isLoading}
            error={isError}
            showCheckBox={showCheckBox}
            isChecked={isChecked}
            handleCheckItem={handleCheckEngineer}
            handleCheckAllItems={handleCheckAllEngineers}
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
            const newsize = parseInt(event.target.value, 10)

            setQueryParams({ size: newsize, page: 0 })
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
        <AddUserModal open={addUserModalOpen} setOpen={setAddUserModalOpen} reloadPage={() => refetch()} />
      )}
      {userDetailModalOpen && selectedUser && (
        <UserModal
          open={userDetailModalOpen}
          setOpen={setUserDetailModalOpen}
          data={selectedUser}
          setData={setSelectedUser}
          reloadData={() => refetch()}
        />
      )}
    </>
  )
}
