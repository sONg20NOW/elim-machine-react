// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'

import { EMPLOYEE_FILTER_INFO } from '@/app/_schema/EmployeeTabInfo'
import { InputBox } from '@/components/selectbox/InputBox'

interface filterType {
  name: string
  roleDescription: string
  companyName: string
  officeDepartmentName: string
  officePosition: string
  memberStatus: string
  page: number
  size: number
  careerYear: string
  contractType: string
  laborForm: string
  workForm: string
  gender: string
  foreignYn: string
}

interface TableFiltersProps {
  filters: filterType
  onFiltersChange: (filters: filterType) => void
  loading: boolean
}

const TableFilters = ({ filters, onFiltersChange, loading }: TableFiltersProps) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 0 // 필터 변경 시 첫 페이지로
    })
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
            disabled={loading}
            value={filters[property as keyof filterType]?.toString() ?? ''}
            onChange={(e: any) => handleFilterChange(property, e.target.value)}
          />
        ))}
      </Grid>
    </CardContent>
  )
}

export default TableFilters
