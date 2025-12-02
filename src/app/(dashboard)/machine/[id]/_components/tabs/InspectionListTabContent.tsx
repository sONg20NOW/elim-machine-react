'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// MUI Imports
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'

import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'

// Component Imports
import { MenuItem } from '@mui/material'

import { IconReload } from '@tabler/icons-react'

import InspectionDetailModal from '../detailModal/InspectionDetailModal'

// Constants
import { DEFAULT_PAGESIZE, PageSizeOptions } from '@/app/_constants/options'

// Utils
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import type { MachineInspectionFilterType, MachineInspectionPageResponseDtoType } from '@/@core/types'
import { HEADERS } from '@/app/_constants/table/TableHeader'
import SearchBar from '@/@core/components/custom/SearchBar'
import CustomTextField from '@/@core/components/mui/TextField'
import BasicTable from '@/@core/components/custom/BasicTable'
import AddInspectionModal from '../AddInspectionModal'
import PictureListModal from '../pictureUpdateModal/PictureListModal'
import { useGetInspections, useGetParticipatedEngineerList } from '@/@core/hooks/customTanstackQueries'
import useCurrentInspectionIdStore from '@/@core/utils/useCurrentInspectionIdStore'
import { auth } from '@/lib/auth'
import TableFilter from '@/@core/components/custom/TableFilter'

const InspectionListTabContent = () => {
  const machineProjectId = useParams().id?.toString() as string
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  // 모달 상태
  const [open, setOpen] = useState(false)
  const [showAddModalOpen, setShowAddModalOpen] = useState(false)
  const [showPictureListModal, setShowPictureListModal] = useState(false)

  const { currentInspectionId, setCurrentInspectionId } = useCurrentInspectionIdStore()

  // 검색 조건
  const page = Number(searchParams.get('page') ?? 0)
  const pageSize = Number(searchParams.get('size') ?? DEFAULT_PAGESIZE)
  const machineCategoryName = searchParams.get('machineCategoryName')
  const location = searchParams.get('location')

  const {
    data: inspectionsPage,
    refetch: refetchInspections,
    isError,
    isLoading
  } = useGetInspections(machineProjectId, searchParams.toString())

  const filteredInspectionList = inspectionsPage?.content
  const totalCount = inspectionsPage?.page.totalElements ?? 0

  const disabled = isLoading || isError

  const { data: participatedEngineerList } = useGetParticipatedEngineerList(machineProjectId)

  // 선택삭제 기능 관련
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

  // params를 변경하는 함수를 입력하면 해당 페이지로 라우팅까지 해주는 함수
  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams)

      updater(params)
      router.replace(pathname + '?' + params.toString())
    },
    [router, pathname, searchParams]
  )

  // 공통 함수 활용
  const resetQueryParams = useCallback(() => {
    updateParams(params => {
      params.delete('page')
      params.delete('machineCategoryName')
      params.delete('location')
      params.delete('engineerName')
    })
  }, [updateParams])

  const setPageQueryParam = useCallback(
    (page: number) => {
      updateParams(params => {
        params.set('page', `${page}`)
      })
    },
    [updateParams]
  )

  const setSizeQueryParam = useCallback(
    (size: number) => {
      updateParams(params => {
        params.set('size', `${size}`)
        params.set('page', '0')
      })
    },
    [updateParams]
  )

  const setCategoryQueryParam = useCallback(
    (category: string) => {
      updateParams(params => {
        params.set('machineCategoryName', category)
        params.set('page', '0')
      })
    },
    [updateParams]
  )

  const setLocationQueryParam = useCallback(
    (location: string) => {
      updateParams(params => {
        params.set('location', location)
        params.set('page', '0')
      })
    },
    [updateParams]
  )

  // 모달이 닫힐 때마다 inspections 데이터 다시 가져오기 (모달이 열린 적이 없다면 제외)
  const wasOpened = useRef(false)
  const openModal = open || showAddModalOpen || showPictureListModal

  useEffect(() => {
    if (openModal) {
      wasOpened.current = true
    } else if (wasOpened.current) {
      refetchInspections()
      wasOpened.current = false
    }
  }, [openModal, refetchInspections])

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
      setPageQueryParam(0)
      refetchInspections()
      handleSuccess(`선택된 설비목록 ${checked.length}개가 성공적으로 삭제되었습니다.`)
      setChecked([])
      setShowCheckBox(false)
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <div className='relative h-full flex flex-col'>
      {/* 필터바 */}
      <div>
        <TableFilter<MachineInspectionFilterType>
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
          disabled={disabled}
        />
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
      </div>
      {/* 상단 기능 요소들: 페이지 당 행수, 설비분류 검색, 위치 검색, 선택삭제, 추가 */}
      <div className='flex flex-col justify-between items-start md:flex-row md:items-center p-6 border-bs gap-4'>
        <div className='flex gap-2'>
          {/* 페이지당 행수 */}
          <CustomTextField
            size='small'
            select
            value={pageSize.toString()}
            onChange={e => {
              setSizeQueryParam(Number(e.target.value))
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
            key={`machineCategoryName_${machineCategoryName}`} // 필터 초기화 시 새로 렌더링 되도록 키 지정
            defaultValue={machineCategoryName ?? ''}
            placeholder='설비분류로 검색'
            setSearchKeyword={machineCateName => {
              setCategoryQueryParam(machineCateName)
            }}
            disabled={disabled}
          />
          {/* 현장명으로 검색 */}
          <SearchBar
            key={`location_${location}`}
            defaultValue={location ?? ''}
            placeholder='위치로 검색'
            setSearchKeyword={location => {
              setLocationQueryParam(location)
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
      <div className='flex-1 overflow-y-hidden'>
        <BasicTable<MachineInspectionPageResponseDtoType>
          listException={['engineerNames']}
          header={HEADERS.machineInspection}
          data={filteredInspectionList ?? []}
          handleRowClick={handleSelectInspection}
          page={page}
          pageSize={pageSize}
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
      </div>

      {/* 페이지네이션 */}
      <TablePagination
        rowsPerPageOptions={PageSizeOptions}
        component='div'
        count={totalCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={(_, newPage) => setPageQueryParam(newPage)}
        onRowsPerPageChange={event => {
          const newsize = parseInt(event.target.value, 10)

          setSizeQueryParam(newsize)
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
