'use client'

import { useEffect, useState, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

import axios from 'axios'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import UserModal from './_components/UserModal'
import AddUserModal from './_components/addUserModal'
import type {
  EngineerFilterType,
  EngineerResponseDtoType,
  MachineEngineerPageResponseDtoType,
  successResponseDtoType
} from '@/app/_type/types'
import { createInitialSorting, HEADERS } from '@/app/_schema/TableHeader'
import BasicTable from '@/app/_components/table/BasicTable'
import SearchBar from '@/app/_components/SearchBar'
import TableFilters from '@/app/_components/table/TableFilters'
import { PageSizeOptions } from '@/app/_constants/options'
import { EngineerInitialFilters } from '@/app/_constants/EngineerSeed'
import { ENGINEER_FILTER_INFO } from '@/app/_schema/filter/EngineerFilterInfo'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

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
  const [size, setSize] = useState(30)

  // 모달 관련 상태
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false)

  const [selectedUser, setSelectedUser] = useState<EngineerResponseDtoType>()
  const [rowData, setRowData] = useState<MachineEngineerPageResponseDtoType>()

  // 필터 상태 - 컬럼에 맞게 수정
  const [filters, setFilters] = useState(EngineerInitialFilters)

  // 정렬 상태
  const [sorting, setSorting] = useState(createInitialSorting<MachineEngineerPageResponseDtoType>)

  // 선택 삭제 기능 관련
  const [showCheckBox, setShowCheckBox] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set([]))

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
      const response = await axios.get<{ data: successResponseDtoType<MachineEngineerPageResponseDtoType[]> }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers?${queryParams.toString()}`
      )

      const result = response.data.data

      // 상태 업데이트
      setData(result.content ?? [])
      setPage(result.page.number)
      setSize(result.page.size)
      setTotalCount(result.page.totalElements)

      if (rowData) handleEngineerClick(rowData)
    } catch (error: any) {
      handleApiError(error, '데이터 조회에 실패했습니다.')
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filters, sorting, page, size, name, projectName, rowData])

  // 필터 변경 시 API 호출
  useEffect(() => {
    getFilteredData()
  }, [filters, getFilteredData])

  // 엔지니어 선택 핸들러
  const handleEngineerClick = async (engineerData: MachineEngineerPageResponseDtoType) => {
    try {
      const response = await axios.get<{ data: EngineerResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers/${engineerData.engineerId}`
      )

      const engineerInfo = response.data.data

      setSelectedUser(engineerInfo)
      setRowData(engineerData)
      setUserDetailModalOpen(true)
    } catch (error) {
      handleApiError(error, '엔지니어를 선택하는 데 실패했습니다.')
    }
  }

  // 설비인력 체크 핸들러 (다중선택)
  const handleCheckEngineer = (engineer: MachineEngineerPageResponseDtoType) => {
    const engineerId = engineer.engineerId
    const checked = isChecked(engineer)

    if (!checked) {
      setChecked(prev => {
        const newSet = new Set(prev)

        newSet.add(engineerId)

        return newSet
      })
    } else {
      setChecked(prev => {
        const newSet = new Set(prev)

        newSet.delete(engineerId)

        return newSet
      })
    }
  }

  const handleCheckAllEngineers = (checked: boolean) => {
    if (checked) {
      setChecked(prev => {
        const newSet = new Set(prev)

        data.forEach(engineer => newSet.add(engineer.engineerId))

        return newSet
      })
    } else {
      setChecked(new Set<number>())
    }
  }

  const isChecked = (engineer: MachineEngineerPageResponseDtoType) => {
    return checked.has(engineer.engineerId)
  }

  // 여러 기술자 한번에 삭제
  async function handleDeleteEngineers() {
    try {
      const list = Array.from(checked).map(engineerId => {
        return {
          engineerId: engineerId,
          version: data.find(engineer => engineer.engineerId === engineerId)!.version
        }
      })

      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers`, {
        //@ts-ignore
        data: { engineerDeleteRequestDtos: list }
      })
      getFilteredData()
      handleSuccess('선택된 기계설비 기술자들이 성공적으로 삭제되었습니다.')
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <>
      <Card className='relative'>
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
            {/* 이름으로 검색 */}
            <SearchBar
              placeholder='이름으로 검색'
              onClick={name => {
                setName(name)
                setPage(0)
              }}
              disabled={disabled}
            />
            {/* 현장명으로 검색 */}
            <SearchBar
              placeholder='현장명으로 검색'
              onClick={projectName => {
                setProjectName(projectName)
                setPage(0)
              }}
              disabled={disabled}
            />
          </div>

          <div className='flex sm:flex-row max-sm:is-full items-start sm:items-center gap-10'>
            {/* 한번에 삭제 */}
            {!showCheckBox ? (
              <Button disabled={disabled} variant='contained' onClick={() => setShowCheckBox(prev => !prev)}>
                선택 삭제
              </Button>
            ) : (
              <div className='flex gap-1'>
                <Button variant='contained' color='error' onClick={() => handleDeleteEngineers()}>
                  {`(${checked.size}) 삭제`}
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
                    {`\u00a0\u00a0`}
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
          reloadData={() => getFilteredData()}
        />
      )}
    </>
  )
}
