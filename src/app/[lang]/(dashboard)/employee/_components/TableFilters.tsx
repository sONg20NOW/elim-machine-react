// MUI Imports
import type { Dispatch, SetStateAction } from 'react'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'

import { EMPLOYEE_FILTER_INFO } from '@/app/_schema/EmployeeTabInfo'
import { InputBox } from '@/components/selectbox/InputBox'
import type { EmployeeFilterType } from '@/app/_schema/types'

interface TableFiltersProps {
  filters: EmployeeFilterType
  onFiltersChange: (filters: EmployeeFilterType) => void
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
      <Grid container spacing={6}>
        {Object.keys(EMPLOYEE_FILTER_INFO).map(property => (
          <InputBox
            key={property}
            size='sm'
            tabInfos={EMPLOYEE_FILTER_INFO}
            tabFieldKey={property}
            disabled={disabled}
            value={filters[property as keyof EmployeeFilterType]?.toString() ?? ''}
            onChange={(e: any) => handleFilterChange(property, e.target.value)}
          />
        ))}
      </Grid>
    </CardContent>
  )
}

export default TableFilters
