'use client'

import { useEffect, useState, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import UserModal from './_components/EngineerDetailModal'
import AddUserModal from './_components/AddEngineerModal'
import type {
  EngineerFilterType,
  EngineerResponseDtoType,
  MachineEngineerPageResponseDtoType,
  successResponseDtoType
} from '@/@core/types'
import { createInitialSorting, HEADERS } from '@/app/_constants/table/TableHeader'
import BasicTable from '@/@core/components/custom/BasicTable'
import SearchBar from '@/@core/components/custom/SearchBar'
import TableFilters from '@/@core/components/custom/TableFilters'
import { DEFAULT_PAGESIZE, PageSizeOptions } from '@/app/_constants/options'
import { EngineerInitialFilters } from '@/app/_constants/EngineerSeed'
import { ENGINEER_FILTER_INFO } from '@/app/_constants/filter/EngineerFilterInfo'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { auth } from '@/lib/auth'

/**
 * @type T
 * MachineEngineerPageResponseDtoType
 * @type K
 * MachineDetialResponseDtoType
 * @returns
 */
export default function EngineerPage() {
  // 데이터 리스트
  const [data, setData] = useState<MachineEngineerPageResponseDtoType[]>([])

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

  // 현장명 검색 인풋
  const [projectName, setProjectName] = useState('')

  // 페이지네이션 관련
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(DEFAULT_PAGESIZE)

  // 모달 관련 상태
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false)

  const [selectedUser, setSelectedUser] = useState<EngineerResponseDtoType>()

  // 필터 상태 - 컬럼에 맞게 수정
  const [filters, setFilters] = useState(EngineerInitialFilters)

  // 정렬 상태
  const [sorting, setSorting] = useState(createInitialSorting<MachineEngineerPageResponseDtoType>)

  // 선택 삭제 기능 관련
  const [showCheckBox, setShowCheckBox] = useState(false)
  const [checked, setChecked] = useState<{ engineerId: number; version: number }[]>([])

  // 데이터 페치에 사용되는 쿼리 URL

  // 직원 리스트 호출 API 함수
  const getFilteredData = useCallback(async () => {
    setLoading(true)
    setError(false)
    const queryParams = new URLSearchParams()

    try {
      // 필터링
      Object.keys(filters).forEach(prop => {
        const key = prop as keyof typeof filters

        filters[key] ? queryParams.set(prop, filters[key] as string) : queryParams.delete(prop)
      })

      // 정렬
      sorting.sort ? queryParams.set('sort', `${sorting.target},${sorting.sort}`) : queryParams.delete('sort')

      // 이름 검색
      name ? queryParams.set('name', name) : queryParams.delete('name')

      // 현장명 검색
      projectName ? queryParams.set('projectName', projectName) : queryParams.delete('projectName')

      // 페이지 설정
      queryParams.set('page', page.toString())
      queryParams.set('size', size.toString())

      // axios GET 요청
      const response = await auth.get<{ data: successResponseDtoType<MachineEngineerPageResponseDtoType[]> }>(
        `/api/engineers?${queryParams.toString()}`
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
  }, [filters, sorting, page, size, name, projectName])

  // 필터 변경 시 API 호출
  useEffect(() => {
    getFilteredData()
  }, [filters, getFilteredData])

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
      setFilters(EngineerInitialFilters)
      setName('')
      setProjectName('')
      setPage(0)
      getFilteredData()
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
        <TableFilters<EngineerFilterType>
          filterInfo={ENGINEER_FILTER_INFO}
          filters={filters}
          onFiltersChange={setFilters}
          disabled={disabled}
          setPage={setPage}
        />
        {/* 필터 초기화 버튼 */}
        <Button
          startIcon={<i className='tabler-reload' />}
          onClick={() => {
            setFilters(EngineerInitialFilters)
            setPage(0)
            setName('')
            setProjectName('')
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
            {/* 현장명으로 검색 */}
            <SearchBar
              placeholder='현장명으로 검색'
              setSearchKeyword={projectName => {
                setProjectName(projectName)
                setPage(0)
              }}
              disabled={disabled}
            />
          </div>

          <div className='flex sm:flex-row max-sm:is-full items-start sm:items-center gap-5'>
            {/* 한번에 삭제 */}
            {!showCheckBox ? (
              <Button disabled={disabled} variant='contained' onClick={() => setShowCheckBox(prev => !prev)}>
                선택 삭제
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
            sorting={sorting}
            setSorting={setSorting}
            loading={loading}
            error={error}
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
        <AddUserModal open={addUserModalOpen} setOpen={setAddUserModalOpen} reloadPage={() => getFilteredData()} />
      )}
      {userDetailModalOpen && selectedUser && (
        <UserModal
          open={userDetailModalOpen}
          setOpen={setUserDetailModalOpen}
          data={selectedUser}
          setData={setSelectedUser}
          reloadData={() => getFilteredData()}
        />
      )}
    </>
  )
}
