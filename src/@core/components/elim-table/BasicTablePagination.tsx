import { useSearchParams } from 'next/navigation'

import { Card, TablePagination } from '@mui/material'

import { DEFAULT_PAGESIZE, PageSizeOptions } from '@/@core/data/options'
import useSetQueryParams from '@/@core/utils/searchParams/useSetQueryParams'

interface BasicTablePaginationProps {
  totalCount: number
  disabled?: boolean
}

/**
 * searchParms 제어를 기반으로 동작하는 TablePagination
 * @param totalCount * toal_element 상태값
 * @param disabled
 * @returns
 */
export default function BasicTablePagination({ totalCount, disabled }: BasicTablePaginationProps) {
  const setQueryParams = useSetQueryParams()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get('page') ?? 0)
  const size = Number(searchParams.get('size') ?? DEFAULT_PAGESIZE)

  return (
    <TablePagination
      rowsPerPageOptions={PageSizeOptions}
      component={Card}
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
        },
        boxShadow: 20
      }}
    />
  )
}
