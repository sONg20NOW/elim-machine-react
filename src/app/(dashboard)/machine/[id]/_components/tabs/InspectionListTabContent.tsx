'use client'

import { useState, useCallback, useEffect } from 'react'

// MUI Imports
import { useParams } from 'next/navigation'

import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'

// Component Imports
import { MenuItem } from '@mui/material'

import InspectionDetailModal from '../detailModal/InspectionDetailModal'

// Constants
import { DEFAULT_PAGESIZE, PageSizeOptions } from '@/app/_constants/options'

// Utils
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import TableFilters from '@/@core/components/custom/TableFilters'
import type { MachineInspectionFilterType, MachineInspectionPageResponseDtoType } from '@/@core/types'
import { createInitialSorting, HEADERS } from '@/app/_constants/table/TableHeader'
import SearchBar from '@/@core/components/custom/SearchBar'
import CustomTextField from '@/@core/components/mui/TextField'
import BasicTable from '@/@core/components/custom/BasicTable'
import AddInspectionModal from '../AddInspectionModal'
import PictureListModal from '../pictureUpdateModal/PictureListModal'
import { useGetInspections, useGetParticipatedEngineerList } from '@/@core/hooks/customTanstackQueries'
import useCurrentInspectionIdStore from '@/@core/utils/useCurrentInspectionIdStore'
import { auth } from '@/lib/auth'

const InspectionListTabContent = ({}) => {
  const machineProjectId = useParams().id?.toString() as string

  // 모달 상태
  const [open, setOpen] = useState(false)
  const [showAddModalOpen, setShowAddModalOpen] = useState(false)
  const [showPictureListModal, setShowPictureListModal] = useState(false)

  const { currentInspectionId, setCurrentInspectionId } = useCurrentInspectionIdStore()

  // 페이지네이션 상태
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGESIZE)
  const [totalCount, setTotalCount] = useState(0)

  // 필터링
  const [filters, setFilters] = useState<MachineInspectionFilterType>({
    engineerName: ''
  })

  const [queryParams, setQueryParams] = useState(`page=0&size=${DEFAULT_PAGESIZE}`)

  const {
    data: inspectionsPage,
    refetch: refetchInspections,
    isError,
    isLoading
  } = useGetInspections(machineProjectId, queryParams.toString())

  const filteredInspectionList = inspectionsPage?.content

  const disabled = isLoading || isError

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

  // queryParams 세팅 -> tanstack query 작동 -> 데이터 불러오기
  const handleSetQueryParams = useCallback(async () => {
    const queryParams = new URLSearchParams()

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

    setQueryParams(queryParams.toString())
  }, [filters, sorting, page, pageSize, machineCategoryName, location])

  useEffect(() => {
    handleSetQueryParams()
  }, [handleSetQueryParams])

  useEffect(() => {
    if (!inspectionsPage) return

    // 상태 업데이트 (engineernames만 따로 빼서)
    setTotalCount(inspectionsPage.page.totalElements)
  }, [inspectionsPage])

  // useEffect(() => {
  //   handleApiError(error)
  // }, [error])

  useEffect(() => {
    if (!open) refetchInspections()
  }, [refetchInspections, open])

  useEffect(() => {
    if (!showAddModalOpen) refetchInspections()
  }, [refetchInspections, showAddModalOpen])

  useEffect(() => {
    if (!showPictureListModal) refetchInspections()
  }, [refetchInspections, showPictureListModal])

  useEffect(() => {
    if (!open) {
      setCurrentInspectionId(0)
    }
  }, [setCurrentInspectionId, open])

  //  체크 핸들러 (다중선택)
  const handleCheck = (machine: MachineInspectionPageResponseDtoType) => {
    const obj = { machineInspectionId: machine.machineInspectionId, version: machine.version }
    const checked = isChecked(machine)

    if (!checked) {
      setChecked(prev => prev.concat(obj))
    } else {
      setChecked(prev => prev.filter(v => v.machineInspectionId !== machine.machineInspectionId))
    }
  }

  // 한번에 선택
  const handleCheckAll = (checked: boolean) => {
    if (!filteredInspectionList) return

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
    console.log(checked)

    return checked.some(v => v.machineInspectionId === machine.machineInspectionId)
  }

  // 여러개 한번에 삭제
  async function handleDeleteEngineers() {
    if (!checked.length) return

    try {
      await auth.delete(`/api/machine-projects/${machineProjectId}/machine-inspections`, {
        //@ts-ignore
        data: { machineInspectionDeleteRequestDtos: checked }
      })
      setFilters({
        engineerName: ''
      })
      setMachineCategoryName('')
      setLocation('')
      setPage(0)
      refetchInspections()
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
          <Button variant='contained' color='info' disabled={true || isLoading || isError}>
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
                  handleCheckAll(false)
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
        data={filteredInspectionList ?? []}
        handleRowClick={handleSelectInspection}
        page={page}
        pageSize={pageSize}
        sorting={sorting}
        setSorting={setSorting}
        loading={isLoading}
        error={isError}
        showCheckBox={showCheckBox}
        isChecked={isChecked}
        handleCheckItem={handleCheck}
        handleCheckAllItems={handleCheckAll}
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
      {open && currentInspectionId && <InspectionDetailModal open={open} setOpen={setOpen} />}
      {showAddModalOpen && <AddInspectionModal open={showAddModalOpen} setOpen={setShowAddModalOpen} />}
      {showPictureListModal && (
        <PictureListModal
          open={showPictureListModal}
          setOpen={setShowPictureListModal}
          defaultPicInspectionId={currentInspectionId}
        />
      )}
    </div>
  )
}

export default InspectionListTabContent
