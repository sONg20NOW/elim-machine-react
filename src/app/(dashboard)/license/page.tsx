'use client'

import { useState, useCallback } from 'react'

// MUI Imports
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

import { IconReload } from '@tabler/icons-react'

import { Typography } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import type { LicensePageResponseDtoType, LicenseResponseDtoType } from '@/@core/types'
import { HEADERS } from '@/app/_constants/table/TableHeader'
import BasicTable from '@/@core/components/custom/BasicTable'
import SearchBar from '@/@core/components/custom/SearchBar'
import { DEFAULT_PAGESIZE, PageSizeOptions } from '@/app/_constants/options'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import AddModal from './_components/AddLicenseModal'
import DetailModal from './_components/DetailModal'
import { auth } from '@/lib/auth'
import { useGetLicenses } from '@/@core/hooks/customTanstackQueries'

export default function Licensepage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const { data: licensesPages, refetch, isLoading, isError } = useGetLicenses(searchParams.toString())

  const data = licensesPages?.content ?? []

  const disabled = isLoading || isError

  const totalCount = licensesPages?.page.totalElements ?? 0

  const page = Number(searchParams.get('page') ?? 0)
  const size = Number(searchParams.get('size') ?? DEFAULT_PAGESIZE)
  const companyName = searchParams.get('companyName')
  const region = searchParams.get('region')

  // 모달 관련 상태
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const [selectedData, setSelectedData] = useState<LicenseResponseDtoType>()

  // 선택삭제 기능 관련
  const [showCheckBox, setShowCheckBox] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set([]))

  // params를 변경하는 함수를 입력하면 해당 페이지로 라우팅까지 해주는 함수
  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams)

      updater(params)
      router.replace(pathname + '?' + params.toString())
    },
    [router, pathname, searchParams]
  )

  type paramType = 'page' | 'size' | 'companyName' | 'region'

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
      params.delete('companyName')
      params.delete('region')
      params.delete('sort')
    })
  }, [updateParams])

  // 라이선스 선택 핸들러
  const handleLicenseClick = async (licenseData: LicensePageResponseDtoType) => {
    try {
      const response = await auth.get<{ data: LicenseResponseDtoType }>(`/api/licenses/${licenseData.licenseId}`)

      const licenseInfo = response.data.data

      setSelectedData(licenseInfo)
      setDetailModalOpen(true)
    } catch (error) {
      handleApiError(error, '라이선스를 선택하는 데 실패했습니다.')
    }
  }

  // 설비인력 체크 핸들러 (다중선택)
  const handleCheckLicense = (license: LicensePageResponseDtoType) => {
    const licenseId = license.licenseId
    const checked = isChecked(license)

    if (!checked) {
      setChecked(prev => {
        const newSet = new Set(prev)

        newSet.add(licenseId)

        return newSet
      })
    } else {
      setChecked(prev => {
        const newSet = new Set(prev)

        newSet.delete(licenseId)

        return newSet
      })
    }
  }

  const handleCheckAllLicenses = (checked: boolean) => {
    if (checked) {
      setChecked(prev => {
        const newSet = new Set(prev)

        data.forEach(license => newSet.add(license.licenseId))

        return newSet
      })
    } else {
      setChecked(new Set<number>())
    }
  }

  const isChecked = (license: LicensePageResponseDtoType) => {
    return checked.has(license.licenseId)
  }

  // 여러 라이선스 한번에 삭제
  async function handleDeleteLicenses() {
    try {
      const list = Array.from(checked).map(licenseId => {
        return {
          licenseId: licenseId,
          version: data.find(license => license.licenseId === licenseId)!.version
        }
      })

      await auth.delete(`/api/licenses`, {
        //@ts-ignore
        data: { licenseDeleteRequestDtos: list }
      })

      setQueryParams({ page: 0 })
      refetch()
      setChecked(new Set([]))
      setShowCheckBox(false)
      handleSuccess('선택된 라이선스들이 성공적으로 삭제되었습니다.')
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <>
      <Card className='relative h-full flex flex-col'>
        {/* 탭 제목 */}
        <CardHeader
          title={
            <div className='w-full flex justify-between items-center'>
              <Typography variant='inherit'>{`라이선스관리 (${totalCount})`}</Typography>
              {/* 필터 초기화 버튼 */}
              <Button
                startIcon={<IconReload />}
                onClick={() => {
                  resetQueryParams()
                }}
                className='max-sm:is-full'
                disabled={disabled}
              >
                필터 초기화
              </Button>
            </div>
          }
          className='pbe-4'
        />

        <div className=' flex justify-between flex-col items-start sm:flex-row sm:items-center p-3 sm:p-6 border-bs gap-2 sm:gap-4'>
          <div className='flex gap-2'>
            {/* 페이지당 행수 */}
            <CustomTextField
              size='small'
              select
              value={size.toString()}
              onChange={e => {
                setQueryParams({ page: 0, size: e.target.value })
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
            <SearchBar
              key={`companyName_${companyName}`}
              defaultValue={companyName ?? ''}
              placeholder='업체명으로 검색'
              setSearchKeyword={companyName => {
                setQueryParams({ page: 0, companyName: companyName })
              }}
              disabled={disabled}
            />
            <SearchBar
              key={`region${region}`}
              defaultValue={region ?? ''}
              className='hidden sm:flex'
              placeholder='지역으로 검색'
              setSearchKeyword={region => {
                setQueryParams({ page: 0, region: region })
              }}
              disabled={disabled}
            />
          </div>

          <div className='flex sm:flex-row max-sm:is-full items-start sm:items-center gap-2 sm:gap-4'>
            {/* 한번에 삭제 */}
            {!showCheckBox ? (
              <Button disabled={disabled} variant='contained' onClick={() => setShowCheckBox(prev => !prev)}>
                선택삭제
              </Button>
            ) : (
              <div className='flex gap-1'>
                <Button variant='contained' color='error' onClick={() => handleDeleteLicenses()}>
                  {`(${checked.size}) 삭제`}
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  onClick={() => {
                    setShowCheckBox(prev => !prev)
                    handleCheckAllLicenses(false)
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
              onClick={() => setAddModalOpen(!addModalOpen)}
              disabled={disabled}
            >
              추가
            </Button>
          </div>
        </div>

        {/* 테이블 */}
        <div className='flex-1 overflow-y-hidden'>
          <BasicTable<LicensePageResponseDtoType>
            header={HEADERS.licenses}
            data={data}
            handleRowClick={handleLicenseClick}
            page={page}
            pageSize={size}
            loading={isLoading}
            error={isError}
            showCheckBox={showCheckBox}
            isChecked={isChecked}
            handleCheckItem={handleCheckLicense}
            handleCheckAllItems={handleCheckAllLicenses}
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

            setQueryParams({ page: 0, size: newSize })
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
      {addModalOpen && <AddModal open={addModalOpen} setOpen={setAddModalOpen} reloadPage={() => refetch()} />}
      {detailModalOpen && selectedData && (
        <DetailModal
          open={detailModalOpen}
          setOpen={setDetailModalOpen}
          initialData={selectedData}
          setInitialData={setSelectedData}
          reloadData={() => refetch()}
        />
      )}
    </>
  )
}
