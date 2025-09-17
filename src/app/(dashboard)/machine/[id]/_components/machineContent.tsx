'use client'

import { useEffect, useState, useCallback } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'

// Component Imports
import { MenuItem } from '@mui/material'

import axios from 'axios'

import MachineDetailModal from './machineDetailModal'
import AddMachineModal from './addMachineModal'

// Constants
import { PageSizeOptions } from '@/app/_constants/options'

// Utils
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import TableFilters from '@/app/_components/table/TableFilters'
import type {
  MachineInspectionDetailResponseDtoType,
  MachineInspectionFilterType,
  MachineInspectionPageResponseDtoType,
  successResponseDtoType
} from '@/app/_type/types'
import { createInitialSorting, HEADERS } from '@/app/_schema/TableHeader'
import SearchBar from '@/app/_components/SearchBar'
import CustomTextField from '@/@core/components/mui/TextField'
import BasicTable from '@/app/_components/table/BasicTable'

const MachineContent = ({ machineProjectId }: { machineProjectId: string }) => {
  // 모달 상태
  const [open, setOpen] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState<MachineInspectionDetailResponseDtoType>()
  const [addMachineModalOpen, setAddMachineModalOpen] = useState(false)

  // 데이터 상태
  const [machineData, setMachineData] = useState<MachineInspectionPageResponseDtoType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const disabled = loading || error

  // 페이지네이션 상태
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const [filters, setFilters] = useState<MachineInspectionFilterType>({
    engineerName: ''
  })

  const [machineCateName, setMachineCateName] = useState('')
  const [location, setLocation] = useState('')

  const [sorting, setSorting] = useState(createInitialSorting<MachineInspectionPageResponseDtoType>)

  // 선택 삭제 기능 관련
  const [showCheckBox, setShowCheckBox] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set([]))

  const queryParams = new URLSearchParams()

  // 데이터 불러오기
  const getFilteredData = useCallback(async () => {
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
      machineCateName ? queryParams.set('machineCateName', machineCateName) : queryParams.delete('machineCateName')

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
      setMachineData(result.content ?? [])
      setPage(result.page.number)
      setPageSize(result.page.size)
      setTotalCount(result.page.totalElements)
    } catch (error: any) {
      handleApiError(error, '데이터 조회에 실패했습니다.')
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filters, sorting, page, pageSize, machineCateName, location])

  useEffect(() => {
    getFilteredData()
  }, [filters, getFilteredData, machineProjectId])

  // 행 클릭
  const handleRowClick = useCallback(
    async (machine: MachineInspectionPageResponseDtoType) => {
      try {
        const response = await axios.get<{ data: MachineInspectionDetailResponseDtoType }>(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${machine?.machineInspectionId}`
        )

        setSelectedMachine(response.data.data)
        console.log(response.data.data)
        setOpen(true)
      } catch (error) {
        handleApiError(error)
      }
    },
    [machineProjectId]
  )

  //  체크 핸들러 (다중선택)
  const handleCheckEngineer = (machine: MachineInspectionPageResponseDtoType) => {
    const machineInspectionId = machine.machineInspectionId
    const checked = isChecked(machine)

    if (!checked) {
      setChecked(prev => {
        const newSet = new Set(prev)

        newSet.add(machineInspectionId)

        return newSet
      })
    } else {
      setChecked(prev => {
        const newSet = new Set(prev)

        newSet.delete(machineInspectionId)

        return newSet
      })
    }
  }

  // 한번에 선택
  const handleCheckAllEngineers = (checked: boolean) => {
    if (checked) {
      setChecked(prev => {
        const newSet = new Set(prev)

        machineData.forEach(machine => newSet.add(machine.machineInspectionId))

        return newSet
      })
    } else {
      setChecked(new Set<number>())
    }
  }

  const isChecked = (machine: MachineInspectionPageResponseDtoType) => {
    return checked.has(machine.machineInspectionId)
  }

  // 여러개 한번에 삭제
  async function handleDeleteEngineers() {
    try {
      const list = Array.from(checked).map(machineInspectionId => {
        return {
          machineInspectionId: machineInspectionId,
          version: machineData.find(machine => machine.machineInspectionId === machineInspectionId)!.version
        }
      })

      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections`,
        {
          //@ts-ignore
          data: { machineInspectionDeleteRequestDtos: list }
        }
      )

      handleSuccess('선택된 설비목록이 성공적으로 삭제되었습니다.')
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <div className='relative'>
      {/* 필터바 */}
      <TableFilters<MachineInspectionFilterType>
        // ! 옵션 추가
        filterInfo={{ engineerName: { label: '점검자', type: 'multi', options: [] } }}
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
          setMachineCateName('')
          setLocation('')
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
            placeholder='설비분류로 검색'
            onClick={machineCateName => {
              setMachineCateName(machineCateName)
              setPage(0)
            }}
            disabled={disabled}
          />
          {/* 현장명으로 검색 */}
          <SearchBar
            placeholder='위치로 검색'
            onClick={location => {
              setLocation(location)
              setPage(0)
            }}
            disabled={disabled}
          />
          <Button variant='contained' color='info' disabled={loading || error}>
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
            <span className='grid place-items-center whitespace-nowrap'>페이지당 행 수 </span>
            <CustomTextField
              select
              value={pageSize.toString()}
              onChange={e => {
                setPageSize(Number(e.target.value))
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
            onClick={() => setAddMachineModalOpen(true)}
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
        data={machineData}
        handleRowClick={handleRowClick}
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
      {open && selectedMachine && (
        <MachineDetailModal
          machineProjectId={machineProjectId}
          open={open}
          setOpen={setOpen}
          selectedMachine={selectedMachine}
        />
      )}
      {addMachineModalOpen && (
        <AddMachineModal
          open={addMachineModalOpen}
          setOpen={setAddMachineModalOpen}
          machineProjectId={machineProjectId}
          onSuccess={handleAddMachineSuccess}
        />
      )}
    </div>
  )
}

export default MachineContent
