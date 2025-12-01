'use client'

// React Imports
import { useState, useCallback, useMemo } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import 'dayjs/locale/ko'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import dayjs from 'dayjs'

import { IconCopyPlusFilled, IconPlus, IconReload, IconTrashFilled } from '@tabler/icons-react'

import { Typography } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'

import type { MachineFilterType, MachineProjectPageDtoType } from '@/@core/types'
import { HEADERS } from '@/app/_constants/table/TableHeader'
import { MACHINE_FILTER_INFO } from '@/app/_constants/filter/MachineFilterInfo'
import SearchBar from '@/@core/components/custom/SearchBar'
import BasicTable from '@/@core/components/custom/BasicTable'
import AddMachineProjectModal from './_components/AddProjectModal'
import { DEFAULT_PAGESIZE, PageSizeOptions } from '@/app/_constants/options'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import useMachineTabValueStore from '@/@core/utils/useMachineTabValueStore'
import { auth } from '@/lib/auth'
import TableFilter from '@/@core/components/custom/TableFilter'
import { useGetEngineersOptions, useGetMachineProjects } from '@/@core/hooks/customTanstackQueries'

// datepicker 한글화
dayjs.locale('ko')

type periodType = 0 | 1 | 3 | 6

// 현장점검 기간 버튼 옵션
const periodOptions: periodType[] = [1, 3, 6]

export default function MachinePage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const setTabValue = useMachineTabValueStore(state => state.setTabValue)

  const page = Number(searchParams.get('page') ?? 0)
  const size = Number(searchParams.get('size') ?? DEFAULT_PAGESIZE)
  const projectName = searchParams.get('projectName')
  const region = searchParams.get('region')
  const fieldBeginDate = searchParams.get('fieldBeginDate')
  const fieldEndDate = searchParams.get('fieldEndDate')

  const [curMonth, setCurMonth] = useState<0 | 1 | 3 | 6 | null>(null)

  const [addMachineModalOpen, setAddMachineModalOpen] = useState(false)

  const {
    data: machineProjectsPages,
    refetch: refetchMachineProjects,
    isLoading,
    isError
  } = useGetMachineProjects(searchParams.toString())

  const machineProjects = machineProjectsPages?.content ?? []

  const { data: engineers, isLoading: isLoadingEngineerList, isError: isErrorEngineerList } = useGetEngineersOptions()

  const loading = isLoading || isLoadingEngineerList
  const error = isError || isErrorEngineerList
  const disabled = loading || error

  const totalCount = machineProjectsPages?.page.totalElements ?? 0

  const MACHINE_FILTER_INFO_WITH_ENGINEERS = useMemo(
    () => ({
      ...MACHINE_FILTER_INFO,
      engineerName: {
        ...MACHINE_FILTER_INFO.engineerName,
        options: engineers?.map(engineer => {
          return { value: engineer.engineerName, label: engineer.engineerName }
        })
      }
    }),
    [engineers]
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

  type paramType = 'page' | 'size' | 'projectName' | 'region' | 'fieldBeginDate' | 'fieldEndDate'

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
      params.delete('projectName')
      params.delete('region')
      params.delete('fieldBeginDate')
      params.delete('fieldEndDate')
      params.delete('sort')

      const filterKeys = Object.keys(MACHINE_FILTER_INFO_WITH_ENGINEERS)

      filterKeys.forEach(v => params.delete(v))
    })

    setCurMonth(null)
  }, [updateParams, MACHINE_FILTER_INFO_WITH_ENGINEERS])

  const clearDateQueryParam = useCallback(() => {
    updateParams(params => {
      params.delete('fieldBeginDate')
      params.delete('fieldEndDate')
      params.set('page', '0')
    })
  }, [updateParams])

  // 기계설비현장 선택 핸들러
  const handleMachineProjectClick = async (machineProject: MachineProjectPageDtoType) => {
    if (!machineProject?.machineProjectId) return

    try {
      setTabValue('현장정보')
      router.push(`/machine/${machineProject.machineProjectId}`)
    } catch (error) {
      handleApiError(error, '프로젝트 정보를 불러오는 데 실패했습니다.')
    }
  }

  function onClickMonth(month: 0 | 1 | 3 | 6) {
    if (month === 0) {
      clearDateQueryParam()
    } else {
      const currentTime = dayjs()

      setQueryParams({
        fieldBeginDate: currentTime.subtract(month, 'month').format('YYYY-MM-DD'),
        fieldEndDate: currentTime.format('YYYY-MM-DD'),
        page: 0
      })
    }

    setCurMonth(month)
  }

  const handleDeleteRow = async (row: MachineProjectPageDtoType) => {
    await auth.delete(`/api/machine-projects/${row.machineProjectId}?version=${row.version}`)
    handleSuccess(`${row.machineProjectName}이(가) 삭제되었습니다`)
    refetchMachineProjects()

    return
  }

  const handleCopyRow = async (row: MachineProjectPageDtoType) => {
    await auth.post(`/api/machine-projects/${row.machineProjectId}`)
    handleSuccess(`${row.machineProjectName}이(가) 복사되었습니다`)
    refetchMachineProjects()

    return
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
      <Card className='relative h-full flex flex-col'>
        <CardHeader title={`기계설비현장 (${totalCount})`} className='pbe-4' />
        {/* 필터바 */}
        <TableFilter<MachineFilterType> filterInfo={MACHINE_FILTER_INFO_WITH_ENGINEERS} disabled={disabled} />
        {/* 필터 초기화 버튼 */}
        <Button
          startIcon={<IconReload />}
          onClick={() => {
            resetQueryParams()
          }}
          className='max-sm:is-full absolute right-8 top-8'
          disabled={disabled}
        >
          검색조건 초기화
        </Button>
        <div className='flex justify-between flex-col items-start  md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex gap-8 items-center'>
            <div className='flex gap-2 flex-wrap'>
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
                key={`projectName_${projectName}`}
                placeholder='이름으로 검색'
                defaultValue={projectName ?? ''}
                setSearchKeyword={projectName => {
                  setQueryParams({ projectName: projectName, page: 0 })
                }}
                disabled={disabled}
              />
              {/* 지역으로 검색 */}
              <SearchBar
                key={`region_${region}`}
                placeholder='지역으로 검색'
                defaultValue={region ?? ''}
                setSearchKeyword={region => {
                  setQueryParams({ region: region, page: 0 })
                }}
                disabled={disabled}
              />
            </div>

            <div className='flex gap-4'>
              {/* 현장점검 기간 */}
              <div className='flex items-center gap-2 text-base'>
                <DatePicker
                  disabled={disabled}
                  label='점검 시작일'
                  value={fieldBeginDate ? dayjs(fieldBeginDate) : null}
                  format={'YYYY.MM.DD'}
                  onChange={date => {
                    setQueryParams({ fieldBeginDate: dayjs(date).format('YYYY-MM-DD'), page: 0 })
                    setCurMonth(null)
                  }}
                  showDaysOutsideCurrentMonth
                  slotProps={{ textField: { size: 'small' } }}
                  sx={{ p: 0, m: 0, width: 150 }}
                />
                <span>~</span>
                <DatePicker
                  disabled={disabled}
                  label='점검 종료일'
                  value={fieldEndDate ? dayjs(fieldEndDate) : null}
                  format={'YYYY.MM.DD'}
                  onChange={date => {
                    setQueryParams({ fieldEndDate: dayjs(date).format('YYYY-MM-DD'), page: 0 })
                    setCurMonth(null)
                  }}
                  showDaysOutsideCurrentMonth
                  slotProps={{ textField: { size: 'small' } }}
                  sx={{ p: 0, m: 0, width: 150 }}
                />
              </div>
              <div className='flex gap-2'>
                {periodOptions.map(month => (
                  <Button
                    className='whitespace-nowrap'
                    onClick={() => onClickMonth(month)}
                    disabled={disabled}
                    key={month}
                    variant='contained'
                    color={curMonth === month ? 'info' : 'primary'}
                  >
                    {month}개월
                  </Button>
                ))}
                <Button
                  className='whitespace-nowrap'
                  onClick={() => onClickMonth(0)}
                  disabled={disabled}
                  variant='contained'
                  color={curMonth === 0 ? 'success' : 'primary'}
                >
                  전체
                </Button>
              </div>
            </div>
          </div>
          {/* 기계설비현장 추가 버튼 */}
          <Button
            variant='contained'
            startIcon={<IconPlus />}
            onClick={() => setAddMachineModalOpen(!addMachineModalOpen)}
            className='max-sm:is-full whitespace-nowrap'
            disabled={disabled}
          >
            추가
          </Button>
        </div>
        <Typography color='warning.main' sx={{ px: 3 }}>
          ※우클릭으로 현장을 삭제하거나 복사할 수 있습니다
        </Typography>
        {/* 테이블 */}
        <div className='flex-1 overflow-y-hidden'>
          <BasicTable<MachineProjectPageDtoType>
            header={HEADERS.machine}
            data={machineProjects}
            handleRowClick={handleMachineProjectClick}
            page={page}
            pageSize={size}
            loading={loading}
            error={error}
            listException={['engineerNames']}
            rightClickMenuHeader={contextMenu => {
              return contextMenu.row['machineProjectName']
            }}
            rightClickMenu={[
              { icon: <IconCopyPlusFilled size={20} color='gray' />, label: '복사', handleClick: handleCopyRow },
              {
                icon: <IconTrashFilled size={20} color='gray' />,
                label: '삭제',
                handleClick: handleDeleteRow
              }
            ]}
          />
        </div>

        <TablePagination
          rowsPerPageOptions={PageSizeOptions} // 1 추가 (테스트용)
          component='div'
          count={totalCount}
          rowsPerPage={size}
          page={page}
          onPageChange={(_, newPage) => setQueryParams({ page: newPage })}
          onRowsPerPageChange={event => {
            const newPageSize = parseInt(event.target.value, 10)

            setQueryParams({ size: newPageSize, page: 0 })
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
      {/* 생성 모달 */}
      {addMachineModalOpen && (
        <AddMachineProjectModal
          open={addMachineModalOpen}
          setOpen={setAddMachineModalOpen}
          reloadPage={() => refetchMachineProjects()}
        />
      )}
    </LocalizationProvider>
  )
}
