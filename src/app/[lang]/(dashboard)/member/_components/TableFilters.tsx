// MUI Imports
import type { Dispatch, SetStateAction } from 'react'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'

import { MEMBER_FILTER_INFO } from '@/app/_schema/MemberTabInfo'
import { InputBox } from '@/components/selectbox/InputBox'
import type { MemberFilterType } from '@/app/_schema/types'

interface TableFiltersProps {
  filters: MemberFilterType
  onFiltersChange: (filters: MemberFilterType) => void
  disabled: boolean
  setPage: Dispatch<SetStateAction<number>>
}

const TableFilters = ({ filters, onFiltersChange, disabled, setPage }: TableFiltersProps) => {
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
        {Object.keys(MEMBER_FILTER_INFO).map(property => (
          <InputBox
            key={property}
            size='sm'
            tabInfos={MEMBER_FILTER_INFO}
            tabFieldKey={property}
            disabled={disabled}
            value={filters[property as keyof MemberFilterType]?.toString() ?? ''}
            onChange={(e: any) => handleFilterChange(property, e.target.value)}
          />
        ))}
      </Grid>
    </CardContent>
  )
}

export default TableFilters
