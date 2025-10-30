'use client'

import { useState, useCallback, useEffect } from 'react'

// MUI Imports
import { useParams } from 'next/navigation'

import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'

// Component Imports
import { MenuItem } from '@mui/material'

import axios from 'axios'

import InspectionDetailModal from '../detailModal/InspectionDetailModal'

// Constants
import { DEFAULT_PAGESIZE, PageSizeOptions } from '@/app/_constants/options'

// Utils
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import TableFilters from '@/@core/components/custom/TableFilters'
import type {
  MachineInspectionFilterType,
  MachineInspectionPageResponseDtoType,
  successResponseDtoType
} from '@/@core/types'
import { createInitialSorting, HEADERS } from '@/app/_constants/table/TableHeader'
import SearchBar from '@/@core/components/custom/SearchBar'
import CustomTextField from '@/@core/components/mui/TextField'
import BasicTable from '@/@core/components/custom/BasicTable'
import AddInspectionModal from '../AddInspectionModal'
import PictureListModal from '../detailModal/PictureListModal'
import { useGetParticipatedEngineerList, useGetSingleInspection } from '@/@core/hooks/customTanstackQueries'
import useCurrentInspectionIdStore from '@/@core/utils/useCurrentInspectionIdStore'

const InspectionListContent = ({}) => {
  const machineProjectId = useParams().id?.toString() as string

  // 모달 상태
  const [open, setOpen] = useState(false)
  const [showAddModalOpen, setShowAddModalOpen] = useState(false)
  const [showPictureListModal, setShowPictureListModal] = useState(false)

  // 데이터 상태
  const [filteredInspectionList, setFilteredInspectionList] = useState<MachineInspectionPageResponseDtoType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const disabled = loading || error

  const { currentInspectionId, setCurrentInspectionId } = useCurrentInspectionIdStore()
  const { data: currentInspection } = useGetSingleInspection(machineProjectId, currentInspectionId.toString())

  // 페이지네이션 상태
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGESIZE)
  const [totalCount, setTotalCount] = useState(0)

  // 필터링
  const [filters, setFilters] = useState<MachineInspectionFilterType>({
    engineerName: ''
  })

  const [machineCategoryName, setMachineCategoryName] = useState('')
  const [location, setLocation] = useState('')

  const [sorting, setSorting] = useState(createInitialSorting<MachineInspectionPageResponseDtoType>)

  const { data: participatedEngineerList } = useGetParticipatedEngineerList(machineProjectId)

  // 선택 삭제 기능 관련
  const [showCheckBox, setShowCheckBox] = useState(false)
  const [checked, setChecked] = useState<{ machineInspectionId: number; version: number }[]>([])

  // 테이블 행 클릭 시 초기 동작하는 함수
  const handleSelectInspection = useCallback(
    async (machine: MachineInspectionPageResponseDtoType, pictureClick?: boolean) => {
      setCurrentInspectionId(machine.machineInspectionId)
      if (pictureClick) return
      setOpen(true)
    },
    [setCurrentInspectionId]
  )

  // 데이터 불러오기
  const getFilteredInspectionList = useCallback(async () => {
    const queryParams = new URLSearchParams()

    setLoading(true)
    setError(false)

    try {
      // 필터링
      Object.keys(filters).forEach(prop => {
        const key = prop as keyof typeof filters

        filters[key] ? queryParams.set(prop, filters[key] as string) : queryParams.delete(prop)
      })

      // 정렬
      sorting.sort ? queryParams.set('sort', `${sorting.target},${sorting.sort}`) : queryParams.delete('sort')

      // 설비분류 검색
      machineCategoryName
        ? queryParams.set('machineCategoryName', machineCategoryName)
        : queryParams.delete('machineCategoryName')

      // 위치 검색
      location ? queryParams.set('location', location) : queryParams.delete('location')

      // 페이지 설정
      queryParams.set('page', page.toString())
      queryParams.set('size', pageSize.toString())

      // axios GET 요청
      const response = await axios.get<{ data: successResponseDtoType<MachineInspectionPageResponseDtoType[]> }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections?${queryParams.toString()}`
      )

      const result = response.data.data

      // 상태 업데이트 (engineernames만 따로 빼서)
      setFilteredInspectionList(result.content ?? [])
      if (page !== result.page.number) setPage(result.page.number)
      if (pageSize !== result.page.size) setPageSize(result.page.size)
      setTotalCount(result.page.totalElements)
    } catch (error) {
      handleApiError(error, '데이터 조회에 실패했습니다.')
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filters, sorting, page, pageSize, machineCategoryName, location, machineProjectId])

  useEffect(() => {
    getFilteredInspectionList()
  }, [getFilteredInspectionList, open, showAddModalOpen, showPictureListModal])

  //  체크 핸들러 (다중선택)
  const handleCheckEngineer = (machine: MachineInspectionPageResponseDtoType) => {
    const obj = { machineInspectionId: machine.machineInspectionId, version: machine.version }
    const checked = isChecked(machine)

    if (!checked) {
      setChecked(prev => prev.concat(obj))
    } else {
      setChecked(prev => prev.filter(v => v.machineInspectionId !== machine.machineInspectionId))
    }
  }

  // 한번에 선택
  const handleCheckAllEngineers = (checked: boolean) => {
    if (checked) {
      setChecked(prev => {
        const newChecked = structuredClone(prev)

        filteredInspectionList.forEach(machine => {
          if (!prev.find(v => v.machineInspectionId === machine.machineInspectionId)) {
            newChecked.push({ machineInspectionId: machine.machineInspectionId, version: machine.version })
          }
        })

        return newChecked
      })
    } else {
      setChecked([])
    }
  }

  const isChecked = (machine: MachineInspectionPageResponseDtoType) => {
    let exist = false

    checked.forEach(v => {
      if (JSON.stringify(v) === JSON.stringify({ newChecked: machine.machineInspectionId, version: machine.version }))
        exist = true
    })

    return exist
  }

  // 여러개 한번에 삭제
  async function handleDeleteEngineers() {
    if (!checked.length) return

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections`,
        {
          //@ts-ignore
          data: { machineInspectionDeleteRequestDtos: checked }
        }
      )
      setFilters({
        engineerName: ''
      })
      setMachineCategoryName('')
      setLocation('')
      setPage(0)
      getFilteredInspectionList()
      handleSuccess(`선택된 설비목록 ${checked.length}개가 성공적으로 삭제되었습니다.`)
      setChecked([])
      setShowCheckBox(false)
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <div className='relative'>
      {/* 필터바 */}
      <TableFilters<MachineInspectionFilterType>
        filterInfo={{
          engineerName: {
            label: '점검자',
            type: 'multi',
            options: participatedEngineerList?.map(engineer => ({
              value: engineer.engineerName,
              label: `${engineer.engineerName} (${engineer.gradeDescription})`
            }))
          }
        }}
        filters={filters}
        onFiltersChange={setFilters}
        disabled={disabled}
        setPage={setPage}
      />
      {/* 필터 초기화 버튼 */}
      <Button
        startIcon={<i className='tabler-reload' />}
        onClick={() => {
          setFilters({
            engineerName: ''
          })
          setMachineCategoryName('')
          setLocation('')
          setPage(0)
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
            value={pageSize.toString()}
            onChange={e => {
              setPageSize(Number(e.target.value))
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
            placeholder='설비분류로 검색'
            setSearchKeyword={machineCateName => {
              setMachineCategoryName(machineCateName)
              setPage(0)
            }}
            disabled={disabled}
          />
          {/* 현장명으로 검색 */}
          <SearchBar
            placeholder='위치로 검색'
            setSearchKeyword={location => {
              setLocation(location)
              setPage(0)
            }}
            disabled={disabled}
          />
          <Button variant='contained' color='info' disabled={true || loading || error}>
            점검대상 및 수량
          </Button>
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
            onClick={() => setShowAddModalOpen(true)}
            className='max-sm:is-full'
            disabled={disabled}
          >
            추가
          </Button>
        </div>
      </div>

      {/* 테이블 */}
      <BasicTable<MachineInspectionPageResponseDtoType>
        listException={['engineerNames']}
        header={HEADERS.machineInspection}
        data={filteredInspectionList}
        handleRowClick={handleSelectInspection}
        page={page}
        pageSize={pageSize}
        sorting={sorting}
        setSorting={setSorting}
        loading={loading}
        error={error}
        showCheckBox={showCheckBox}
        isChecked={isChecked}
        handleCheckItem={handleCheckEngineer}
        handleCheckAllItems={handleCheckAllEngineers}
        onClickPicCount={async (machine: MachineInspectionPageResponseDtoType) => {
          await handleSelectInspection(machine, true)
          setShowPictureListModal(true)
        }}
      />

      {/* 페이지네이션 */}
      <TablePagination
        rowsPerPageOptions={PageSizeOptions}
        component='div'
        count={totalCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={event => {
          const newsize = parseInt(event.target.value, 10)

          setPageSize(newsize)
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

      {/* 모달 */}
      {open && currentInspection && <InspectionDetailModal open={open} setOpen={setOpen} />}
      {showAddModalOpen && (
        <AddInspectionModal
          getFilteredInspectionList={getFilteredInspectionList}
          open={showAddModalOpen}
          setOpen={setShowAddModalOpen}
          machineProjectId={machineProjectId}
        />
      )}
      {showPictureListModal && currentInspection && (
        <PictureListModal open={showPictureListModal} setOpen={setShowPictureListModal} />
      )}
    </div>
  )
}

export default InspectionListContent
