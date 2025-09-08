// MUI Imports
import type { Dispatch, SetStateAction } from 'react'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'

import type { InputFieldType } from '@/app/_schema/input/MemberInputInfo'
import { InputBox } from '@/components/selectbox/InputBox'

interface TableFiltersProps<T> {
  filterInfo: Record<keyof T, InputFieldType>
  filters: T
  onFiltersChange: (filters: T) => void
  disabled: boolean
  setPage: Dispatch<SetStateAction<number>>
}

/**
 *
 * @param param0
 * @type T
 * 필터 타입 (ex. MemberFilterType, ...)
 * @returns
 */
export default function TableFilters<T>({
  filterInfo,
  filters,
  onFiltersChange,
  disabled,
  setPage
}: TableFiltersProps<T>) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
    setPage(0)
  }

  return (
    <CardContent>
      <Grid container spacing={3}>
        {Object.keys(filterInfo).map(property => (
          <InputBox
            key={property}
            size='sm'
            tabInfos={filterInfo}
            tabFieldKey={property}
            disabled={disabled}
            value={filters[property as keyof T]?.toString() ?? ''}
            onChange={(e: any) => handleFilterChange(property, e.target.value)}
          />
        ))}
      </Grid>
    </CardContent>
  )
}
