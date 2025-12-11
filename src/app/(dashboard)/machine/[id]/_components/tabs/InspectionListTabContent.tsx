'use client'

import { useState, useCallback, useEffect, useRef, createContext } from 'react'

// MUI Imports
import { useParams, useSearchParams } from 'next/navigation'

import Button from '@mui/material/Button'

// Component Imports
import { MenuItem } from '@mui/material'

import { IconPlus, IconReload, IconTrashFilled } from '@tabler/icons-react'

import { useQueryClient } from '@tanstack/react-query'

import InspectionDetailModal from '../detailModal/InspectionDetailModal'

// Constants
import { DEFAULT_PAGESIZE, PageSizeOptions } from '@/@core/data/options'

// Utils
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import type { MachineInspectionFilterType, MachineInspectionPageResponseDtoType } from '@core/types'
import { TABLE_HEADER_INFO } from '@/@core/data/table/tableHeaderInfo'
import SearchBar from '@/@core/components/elim-inputbox/SearchBar'
import CustomTextField from '@core/components/mui/TextField'
import BasicTable from '@/@core/components/elim-table/BasicTable'
import AddInspectionModal from '../AddInspectionModal'
import PictureListModal from '../pictureUploadModal/PictureListModal'
import { useGetInspections, useGetParticipatedEngineerList } from '@core/hooks/customTanstackQueries'
import useCurrentInspectionIdStore from '@/@core/hooks/zustand/useCurrentInspectionIdStore'
import { auth } from '@core/utils/auth'
import BasicTableFilter from '@/@core/components/elim-table/BasicTableFilter'
import { QUERY_KEYS } from '@/@core/data/queryKeys'
import deleteInspection from '../../_utils/deleteInspection'
import useUpdateParams from '@/@core/hooks/searchParams/useUpdateParams'
import useSetQueryParams from '@/@core/hooks/searchParams/useSetQueryParams'
import BasicTablePagination from '@/@core/components/elim-table/BasicTablePagination'

/**
 * offset을 지정하면 모달창이 닫힐 때 페이지 새로고침이 되도록 하는 context
 * @context (offset: number | null) => void
 * @param offset 요소수 변화량
 */
export const setOffsetContext = createContext<((offset: number | null) => void) | null>(null)

const InspectionListTabContent = () => {
  const queryClient = useQueryClient()

  const machineProjectId = useParams().id?.toString() as string
  const searchParams = useSearchParams()

  // 모달 상태
  const [open, setOpen] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)
  const [openPicList, setOpenPicList] = useState(false)

  const { currentInspectionId, setCurrentInspectionId } = useCurrentInspectionIdStore()

  // 검색 조건
  const page = Number(searchParams.get('page') ?? 0)
  const size = Number(searchParams.get('size') ?? DEFAULT_PAGESIZE)
  const machineCategoryName = searchParams.get('machineCategoryName')
  const location = searchParams.get('location')

  const {
    data: inspectionsPage,
    refetch: refetchPages,
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
  const updateParams = useUpdateParams()

  type paramType = 'page' | 'size' | 'machineCategoryName' | 'location' | 'engineerName'

  // 객체 형식으로 데이터를 전달받으면 그에 따라 searchParams를 설정하고 라우팅하는 함수
  const setQueryParams = useSetQueryParams<paramType>()

  // 공통 함수 활용
  const resetQueryParams = useCallback(() => {
    updateParams(params => {
      params.delete('page')
      params.delete('machineCategoryName')
      params.delete('location')
      params.delete('engineerName')
    })
  }, [updateParams])

  // offset만큼 요소수가 변화했을 때 valid한 페이지 param을 책임지는 함수
  const adjustPage = useCallback(
    (offset = 0) => {
      const lastPageAfter = Math.max(Math.ceil((totalCount + offset) / size) - 1, 0)

      if (offset > 0 || page > lastPageAfter) {
        lastPageAfter > 0 ? setQueryParams({ page: lastPageAfter }) : updateParams(params => params.delete('page'))
      }
    },
    [page, setQueryParams, totalCount, size, updateParams]
  )

  // tanstack query cache 삭제 및 refetch
  const removeQueryCaches = useCallback(() => {
    refetchPages()

    queryClient.removeQueries({
      predicate(query) {
        const key = query.queryKey

        const curQueryKey = QUERY_KEYS.MACHINE_INSPECTION.GET_INSPECTIONS(machineProjectId, searchParams.toString())

        return Array.isArray(key) && key[0] === curQueryKey[0] && key[1] === curQueryKey[1] && key[2] !== curQueryKey[2] // 스크롤 유지를 위해 현재 data는 refetch, 나머지는 캐시 지우기
      }
    })
    queryClient.refetchQueries({ queryKey: ['GET_INSPECTIONS_SIMPLE', machineProjectId], exact: true }) // 설비목록 정보 초기화
  }, [refetchPages, queryClient, searchParams, machineProjectId])

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

      adjustPage(-1 * checked.length)
      removeQueryCaches()
      handleSuccess(`선택된 설비목록 ${checked.length}개가 성공적으로 삭제되었습니다.`)
      setChecked([])
      setShowCheckBox(false)
    } catch (error) {
      handleApiError(error)
    }
  }

  // 모달이 닫힐 때마다 inspections 데이터 다시 가져오기 (설비개수가 변경되거나, 설비 정보가 수정된 경우에만)
  const offset = useRef<number | null>(null)
  const openModal = open || openAdd || openPicList

  function setOffset(v: number | null) {
    offset.current = v
  }

  useEffect(() => {
    if (!openModal && offset.current !== null) {
      if (offset.current !== 1) adjustPage(offset.current)
      else setQueryParams({ page: 0 })

      removeQueryCaches()
      setOffset(null)
    }
  }, [openModal, adjustPage, removeQueryCaches, setQueryParams])

  return (
    <setOffsetContext.Provider value={setOffset}>
      <div className='relative h-full flex flex-col'>
        {/* 필터바 */}
        <div>
          <BasicTableFilter<MachineInspectionFilterType>
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
              value={size.toString()}
              onChange={e => {
                setQueryParams({ size: Number(e.target.value), page: 0 })
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
                setQueryParams({ machineCategoryName: machineCateName, page: 0 })
              }}
              disabled={disabled}
            />
            {/* 현장명으로 검색 */}
            <SearchBar
              key={`location_${location}`}
              defaultValue={location ?? ''}
              placeholder='위치로 검색'
              setSearchKeyword={location => {
                setQueryParams({ location: location, page: 0 })
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
              startIcon={<IconPlus />}
              onClick={() => setOpenAdd(true)}
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
            header={TABLE_HEADER_INFO.machineInspection}
            data={filteredInspectionList ?? []}
            handleRowClick={handleSelectInspection}
            loading={isLoading}
            error={isError}
            showCheckBox={showCheckBox}
            isChecked={isChecked}
            handleCheckItem={handleCheck}
            handleCheckAllItems={handleCheckAll}
            onClickPicCount={async (machine: MachineInspectionPageResponseDtoType) => {
              await handleSelectInspection(machine, true)
              setOpenPicList(true)
            }}
            rightClickMenuHeader={contextMenu => contextMenu.row.machineInspectionName}
            rightClickMenu={[
              {
                icon: <IconTrashFilled color='gray' size={20} />,
                label: '삭제',
                handleClick: async row => {
                  await deleteInspection(
                    Number(machineProjectId),
                    row.machineInspectionId,
                    row.version,
                    row.machineInspectionName
                  )
                  queryClient.removeQueries({ queryKey: ['GET_INSPECTIONS_SIMPLE', machineProjectId], exact: true })
                  adjustPage(-1)
                  removeQueryCaches()
                }
              }
            ]}
          />
        </div>

        {/* 페이지네이션 */}
        <BasicTablePagination totalCount={totalCount} disabled={disabled} />

        {/* 모달 */}
        {open && currentInspectionId && <InspectionDetailModal open={open} setOpen={setOpen} />}
        {openAdd && <AddInspectionModal open={openAdd} setOpen={setOpenAdd} />}
        {openPicList && (
          <PictureListModal open={openPicList} setOpen={setOpenPicList} defaultPicInspectionId={currentInspectionId} />
        )}
      </div>
    </setOffsetContext.Provider>
  )
}

export default InspectionListTabContent
