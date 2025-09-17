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
import type { LicensePageResponseDtoType, LicenseResponseDtoType, successResponseDtoType } from '@/app/_type/types'
import { createInitialSorting, HEADERS } from '@/app/_schema/TableHeader'
import BasicTable from '@/app/_components/table/BasicTable'
import SearchBar from '@/app/_components/SearchBar'
import { PageSizeOptions } from '@/app/_constants/options'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import AddModal from './_components/addModal'
import DetailModal from './_components/DetailModal'

export default function Licensepage() {
  // 데이터 리스트
  const [data, setData] = useState<LicensePageResponseDtoType[]>([])

  // 로딩 시도 중 = true, 로딩 끝 = false
  const [loading, setLoading] = useState(false)

  // 에러 발생 시 true
  const [error, setError] = useState(false)

  // 로딩이 끝나고 에러가 없으면 not disabled
  const disabled = loading || error

  // 전체 데이터 개수 => fetching한 데이터에서 추출
  const [totalCount, setTotalCount] = useState(0)

  // 업체명 검색 인풋
  const [companyName, setCompanyName] = useState('')

  // 업체명 검색 인풋
  const [region, setRegion] = useState('')

  // 페이지네이션 관련
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(30)

  // 모달 관련 상태
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  // TODO restrict type
  const [selectedData, setSelectedData] = useState<LicenseResponseDtoType | null>(null)

  // 정렬 상태
  const [sorting, setSorting] = useState(createInitialSorting<LicensePageResponseDtoType>)

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
      // 정렬
      sorting.sort ? queryParams.set('sort', `${sorting.target},${sorting.sort}`) : queryParams.delete('sort')

      // 업체명 검색
      companyName ? queryParams.set('companyName', companyName) : queryParams.delete('companyName')

      // 지역 검색
      region ? queryParams.set('region', region) : queryParams.delete('region')

      // 페이지 설정
      queryParams.set('page', page.toString())
      queryParams.set('size', size.toString())

      // axios GET 요청
      const response = await axios.get<{ data: successResponseDtoType<LicensePageResponseDtoType[]> }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/licenses?${queryParams.toString()}`
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
  }, [sorting, page, size, companyName, region])

  // 함수 변경 시 API 호출
  useEffect(() => {
    getFilteredData()
  }, [getFilteredData])

  // 라이선스 선택 핸들러
  const handleLicenseClick = async (licenseData: LicensePageResponseDtoType) => {
    try {
      const response = await axios.get<{ data: LicenseResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/licenses/${licenseData.licenseId}`
      )

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

  const handleCheckAllEngineers = (checked: boolean) => {
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

  // 여러 기술자 한번에 삭제
  async function handleDeleteEngineers() {
    try {
      const list = Array.from(checked).map(licenseId => {
        return {
          licenseId: licenseId,
          version: data.find(license => license.licenseId === licenseId)!.version
        }
      })

      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/licenses`, {
        //@ts-ignore
        data: { licenseDeleteRequestDtos: list }
      })

      handleSuccess('선택된 라이선스들이 성공적으로 삭제되었습니다.')
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <>
      <Card>
        {/* 탭 제목 */}
        <CardHeader title={`라이선스관리 (${totalCount})`} className='pbe-4' />
        {/* <TableFilters<EngineerFilterType>
          filterInfo={ENGINEER_FILTER_INFO}
          filters={filters}
          onFiltersChange={setFilters}
          disabled={disabled}
          setPage={setPage}
        />
        <Button
          startIcon={<i className='tabler-reload' />}
          onClick={() => {
            setCompanyName('')
            setRegion('')
          }}
          className='max-sm:is-full absolute right-8 top-8'
          disabled={disabled}
        >
          필터 초기화
        </Button>  */}
        <div className=' flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex gap-2'>
            <SearchBar
              placeholder='업체명으로 검색'
              onClick={companyName => {
                setCompanyName(companyName)
                setPage(0)
              }}
              disabled={disabled}
            />
            <SearchBar
              placeholder='지역으로 검색'
              onClick={region => {
                setRegion(region)
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
              onClick={() => setAddModalOpen(!addModalOpen)}
              className='max-sm:is-full'
              disabled={disabled}
            >
              추가
            </Button>
          </div>
        </div>

        {/* 테이블 */}
        <BasicTable<LicensePageResponseDtoType>
          header={HEADERS.licenses}
          data={data}
          handleRowClick={handleLicenseClick}
          page={page}
          pageSize={size}
          sorting={sorting}
          setSorting={setSorting}
          loading={loading}
          error={error}
          showCheckBox={showCheckBox}
          isChecked={isChecked}
          handleCheckItem={handleCheckLicense}
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
      {addModalOpen && <AddModal open={addModalOpen} setOpen={setAddModalOpen} reloadPage={() => getFilteredData()} />}
      {detailModalOpen && selectedData && (
        <DetailModal
          open={detailModalOpen}
          setOpen={setDetailModalOpen}
          initialData={selectedData}
          reloadData={() => getFilteredData()}
        />
      )}
    </>
  )
}
