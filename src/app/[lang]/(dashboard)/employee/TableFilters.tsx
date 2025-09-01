// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'
import DefaultSelectBox from '@/components/selectbox/defaultSelectBox'

const yearPlan = [
  { value: 0, label: '1년차' },
  { value: 1, label: '2년차' },
  { value: 2, label: '3년차' },
  { value: 3, label: '4년차' },
  { value: 4, label: '5년차' },
  { value: 5, label: '6년차' },
  { value: 6, label: '7년차' },
  { value: 7, label: '8년차' },
  { value: 8, label: '9년차' },
  { value: 9, label: '10년차' }
]

const memberStatusDescription = [
  { value: 'NORMAL', label: '재직중' },
  { value: 'QUIT', label: '퇴사' },
  { value: 'PENDING', label: '가입 승인대기' },
  { value: 'LEAVE', label: '휴직' }
]

interface TableFiltersProps {
  filters: {
    search: string
    roleDescription: string
    companyName: string
    officeDepartmentName: string
    officePosition: string
    memberStatusDescription: string
    page: number
    pageSize: number
    careerYear: number
    contractType: string
    laborForm: string
    workForm: string
    gender: string
    foreignYn: string
  }
  onFiltersChange: (filters: any) => void
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
        <Grid size={{ xs: 12, sm: 2 }}>
          <DefaultSelectBox
            id={'companyName'}
            label='소속'
            value={filters.companyName || ''}
            loading={false}
            onChange={(e: any) => handleFilterChange('companyName', e.target.value)}
            options={[
              { value: '엘림기술원(주)', label: '엘림기술원(주)' },
              { value: '엘림주식회사', label: '엘림주식회사' },
              { value: '엘림테크원(주)', label: '엘림테크원(주)' },
              { value: '이엘엔지니어링(주)', label: '이엘엔지니어링(주)' },
              { value: '이엘테크원(주)', label: '이엘테크원(주)' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <DefaultSelectBox
            id={'officePosition'}
            label='직위'
            value={filters.officePosition || ''}
            loading={loading}
            onChange={(e: any) => handleFilterChange('officePosition', e.target.value)}
            options={[
              { value: 'TEMPORARY', label: '단기' },
              { value: 'INTERN', label: '인턴' },
              { value: 'STAFF', label: '사원' },
              { value: 'JUNIOR_STAFF', label: '주임' },
              { value: 'ASSISTANT_MANAGER', label: '대리' },
              { value: 'SENIOR_ASSISTANT_MANAGER', label: '선임' },
              { value: 'RESPONSIBLE', label: '책임' },
              { value: 'TEAM_LEADER', label: '팀장' },
              { value: 'SECTION_CHIEF', label: '소장' },
              { value: 'DEPUTY_GENERAL_MANAGER', label: '본부장' },
              { value: 'MANAGER', label: '과장' },
              { value: 'SENIOR_MANAGER', label: '부장' },
              { value: 'DEPUTY_MANAGER', label: '차장' },
              { value: 'DIRECTOR', label: '이사' },
              { value: 'EXECUTIVE_DIRECTOR', label: '상무' },
              { value: 'SENIOR_EXECUTIVE_DIRECTOR', label: '전무' },
              { value: 'ADVISOR', label: '고문' },
              { value: 'VICE_PRESIDENT', label: '부사장' },
              { value: 'PRESIDENT', label: '사장' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <DefaultSelectBox
            id={'officeDepartmentName'}
            label='부서'
            value={filters.officeDepartmentName || ''}
            loading={false}
            onChange={(e: any) => handleFilterChange('officeDepartmentName', e.target.value)}
            options={[
              { value: '건설사업', label: '건설사업' },
              { value: '기술개발', label: '기술개발' },
              { value: '경영지원', label: '경영지원' },
              { value: '영업', label: '영업' },
              { value: '총무', label: '총무' },
              { value: '인사', label: '인사' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <DefaultSelectBox
            id={'contractType'}
            label='계약 유형'
            value={filters.contractType || ''}
            loading={false}
            onChange={(e: any) => handleFilterChange('contractType', e.target.value)}
            options={[
              { value: 'REGULAR', label: '정규직' },
              { value: 'CONTRACT_1Y', label: '계약직1년' },
              { value: 'CONTRACT_2Y', label: '계약직2년' },
              { value: 'NON_REGULAR', label: '무기계약직' },
              { value: 'DAILY', label: '일용직' },
              { value: 'TEMPORARY', label: '단기시급' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <DefaultSelectBox
            id={'laborForm'}
            label='상근/비상근'
            value={filters?.laborForm || ''}
            loading={false}
            onChange={(e: any) => handleFilterChange('laborForm', e.target.value)}
            options={[
              { value: 'RESIDENT', label: '상근' },
              { value: 'NON_RESIDENT', label: '비상근' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <DefaultSelectBox
            id={'workForm'}
            label='근무형태'
            value={filters.workForm || ''}
            loading={false}
            onChange={(e: any) => handleFilterChange('workForm', e.target.value)}
            options={[
              { value: 'DEEMED', label: '간주근로' },
              { value: 'SPECIAL', label: '별정근로' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <DefaultSelectBox
            id='foreignYn'
            label='외국인 여부'
            value={filters.foreignYn || ''}
            loading={false}
            onChange={(e: any) => handleFilterChange('foreignYn', e.target.value)}
            options={[
              { value: 'Y', label: '예' },
              { value: 'N', label: '아니오' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <DefaultSelectBox
            id={'gender'}
            label='성별'
            value={filters.gender || ''}
            loading={false}
            onChange={(e: any) => handleFilterChange('gender', e.target.value)}
            options={[
              { value: 'MALE', label: '남' },
              { value: 'FEMALE', label: '여' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <CustomTextField
            select
            fullWidth
            id='careerYear'
            label='근속년수'
            value={filters.careerYear || ''}
            onChange={e => handleFilterChange('careerYear', e.target.value)}
            disabled={loading}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>전체</MenuItem>
            {yearPlan.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <DefaultSelectBox
            id={'memberStatusDescription'}
            label='재직 상태'
            value={filters.memberStatusDescription || ''}
            loading={false}
            onChange={(e: any) => handleFilterChange('memberStatusDescription', e.target.value)}
            options={memberStatusDescription}
          />
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
