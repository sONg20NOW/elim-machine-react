import { useEffect, useState } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'

import axios from 'axios'

import MultiSelectBox from '@/components/selectbox/MultiSelectBox'

interface TableFiltersProps {
  filters: {
    projectStatusDescription: string
    companyName: string
    engineerName: string[] // 배열 타입
    region: string
    machineProjectName: string
    fieldBeginDate: string
    fieldEndDate: string
    reportDeadline: string
    page: number
    size: number
    name: string
  }
  onFiltersChange: (filters: any) => void
  loading: boolean
}

const TableFilters = ({ filters, onFiltersChange, loading }: TableFiltersProps) => {
  const [engineerOptions, setEngineerOptions] = useState([])

  const init = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers/options`)
    const options = response.data.data.engineers

    setEngineerOptions(options)
  }

  // console.log(engineerOptions)

  useEffect(() => {
    // 서버에서 점검자 목록 GET 요청
    init()

    // fetch('http://192.168.0.224:8080/api/engineers/options') // 실제 API 주소로 변경
    //   .then(res => res.json())
    //   .then(result => {
    //     const options = result.data

    //     setEngineerOptions(options)
    //   })
    //   .catch(() => setEngineerOptions([]))
  }, [])

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 0
    })
  }

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <MultiSelectBox
            id={'projectStatusDescription'}
            label='상태'
            value={filters.projectStatusDescription || ''}
            loading={false}
            onChange={(e: any) => handleFilterChange('projectStatusDescription', e.target.value)}
            options={[
              { value: 'CONTRACT_COMPLETED', label: '계약 완료' },
              { value: 'SITE_INSPECTION_COMPLETED', label: '현장 점검 완료' },
              { value: 'REPORT_WRITING', label: '보고서 작성중' },
              { value: 'REPORT_WRITING_COMPLETED', label: '보고서 작성완료' },
              { value: 'REPORT_SUBMITTING', label: '보고서 제출중' },
              { value: 'REPORT_SUBMITTED', label: '보고서 제출완료' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <MultiSelectBox
            id={'region'}
            label='지역'
            value={filters.region || ''}
            loading={loading}
            onChange={(e: any) => handleFilterChange('region', e.target.value)}
            options={[
              { value: '서울', label: '서울' },
              { value: '인천', label: '인천' },
              { value: '대전', label: '대전' },
              { value: '대구', label: '대구' },
              { value: '부산', label: '부산' },
              { value: '울산', label: '울산' },
              { value: '광주', label: '광주' },
              { value: '세종', label: '세종' },
              { value: '경기', label: '경기' },
              { value: '강원', label: '강원' },
              { value: '충북', label: '충북' },
              { value: '충남', label: '충남' },
              { value: '전북', label: '전북' },
              { value: '전남', label: '전남' },
              { value: '경북', label: '경북' },
              { value: '경남', label: '경남' },
              { value: '제주', label: '제주' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <MultiSelectBox
            id={'companyName'}
            label='점검업체'
            value={filters.companyName || ''}
            loading={loading}
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
          <MultiSelectBox
            id={'engineerNames'}
            label='점검자'
            value={filters.engineerName || ''}
            loading={loading}
            onChange={(e: any) => handleFilterChange('engineerName', e.target.value)}
            options={engineerOptions.map((eng: any) => ({
              value: eng.engineerId,
              label: `${eng.engineerName} (${eng.gradeDescription}/${eng.officePositionDescription})`
            }))}
          />
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
