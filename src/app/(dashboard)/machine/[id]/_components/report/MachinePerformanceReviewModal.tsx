import type { CSSProperties } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useParams } from 'next/navigation'

import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  styled,
  Tab,
  TextField,
  Typography
} from '@mui/material'

import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

import TabList from '@mui/lab/TabList'

import { useForm } from 'react-hook-form'

import { toast } from 'react-toastify'

import styles from '@/app/_style/Table.module.css'
import {
  useGetAging,
  useGetGuide,
  useGetImprovement,
  useGetMeasurement,
  useGetOperationStatus,
  useGetResultSummary,
  useGetRootCategories,
  useGetYearlyPlan
} from '@/@core/hooks/customTanstackQueries'
import { auth } from '@/lib/auth'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import type {
  MachineInspectionRootCategoryResponseDtoType,
  MachinePerformanceReviewGuideResponseDtoType,
  MachinePerformanceReviewImprovementResponseDtoType,
  MachinePerformanceReviewMeasurementResponseDtoType,
  MachinePerformanceReviewOperationStatusResponseDtoType,
  MachinePerformanceReviewSummaryResponseDtoType,
  MachinePerformanceReviewYearlyPlanResponseDtoType
} from '@/@core/types'
import ResultSummaryTab from './tabs/ResultSummaryTab'
import GuideTab from './tabs/GuideTab'
import OperationStatusTab from './tabs/OperationStatusTab'

const StyledTab = styled(Tab)(({ theme }) => ({
  color: 'white',
  '&:hover': { color: 'lightgray !important' },
  fontSize: theme.typography.h5.fontSize
}))

type TabType = '결과요약' | '유지관리지침서' | '작동상태' | '측정값 일치' | '노후도' | '개선사항' | '연도별 계획'

export interface refType {
  onSubmit: () => void
  isDirty: boolean
}

export const centerStyle: CSSProperties = { textAlign: 'center', verticalAlign: 'middle' }

export default function MachinePerformanceReviewModal({ machineProjectName }: { machineProjectName: string }) {
  const { id } = useParams()
  const machineProjectId = id?.toString()

  const [open, setOpen] = useState(false)
  const [tabValue, setTabValue] = useState<TabType>('결과요약')
  const [rootCategories, setRootCategories] = useState<MachineInspectionRootCategoryResponseDtoType[]>([])

  const getRootCategories = useCallback(async () => {
    const response = await auth
      .get<{
        data: { rootCategories: MachineInspectionRootCategoryResponseDtoType[] }
      }>(`/api/machine-projects/${machineProjectId}/machine-inspections/root-categories`)
      .then(v => v.data.data.rootCategories)

    setRootCategories(response)
  }, [machineProjectId])

  useEffect(() => {
    getRootCategories()
  }, [getRootCategories])

  // const { data: guide, refetch: refetchGuide } = useGetGuide(machineProjectId!)
  // const { data: operationStatus, refetch: refetchOperationStatus } = useGetOperationStatus(machineProjectId!)
  // const { data: measurement, refetch: refetchMeasurement } = useGetMeasurement(machineProjectId!)
  // const { data: aging, refetch: refetchAging } = useGetAging(machineProjectId!)
  // const { data: improvement, refetch: refetchImprovement } = useGetImprovement(machineProjectId!)
  // const { data: yearlyPlan, refetch: refetchYearlyPlan } = useGetYearlyPlan(machineProjectId!)

  const resultSummaryRef = useRef<refType>(null)
  const guideRef = useRef<refType>(null)

  function handleSave() {
    const message: TabType[] = []

    if (resultSummaryRef.current && resultSummaryRef.current.isDirty) {
      resultSummaryRef.current.onSubmit()
      message.push('결과요약')
    }

    if (guideRef.current && guideRef.current.isDirty) {
      guideRef.current.onSubmit()
      message.push('유지관리지침서')
    }

    if (message.length > 0) {
      handleSuccess(`${message.join(', ')} 탭의 내용이 성공적으로 저장되었습니다.`)
    }
  }

  return (
    <>
      <Button
        variant='contained'
        color='primary'
        onClick={() => {
          setOpen(true)
        }}
      >
        성능점검시 검토사항
      </Button>
      <Dialog fullWidth maxWidth={'lg'} open={open}>
        <DialogTitle variant='h3' sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'end', gap: 2 }}>
            성능점검시 검토사항
            <Typography variant='h5' sx={{ color: 'gray' }}>
              {machineProjectName}
            </Typography>
            <IconButton sx={{ position: 'absolute', top: 5, right: 5 }} onClick={() => setOpen(false)}>
              <i className='tabler-x' />
            </IconButton>
          </Box>
          <Divider />
        </DialogTitle>
        <DialogContent
          className={`${styles.container}`}
          sx={{ height: '70dvh', overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <TabContext value={tabValue}>
            <AppBar position='static' color='primary' sx={{ mb: 4 }}>
              <TabList onChange={(_, newValue) => setTabValue(newValue)} indicatorColor='secondary' textColor='inherit'>
                {[
                  { title: '결과요약', value: '결과요약' },
                  { title: '유지관리지침서', value: '유지관리지침서' },
                  { title: '작동상태', value: '작동상태' },
                  { title: '측정값 일치', value: '측정값 일치' },
                  { title: '노후도', value: '노후도' },
                  { title: '개선사항', value: '개선사항' },
                  { title: '연도별 계획', value: '연도별 계획' }
                ].map(v => (
                  <StyledTab key={v.value} label={v.title} value={v.value} />
                ))}
              </TabList>
            </AppBar>
            <TabPanel value={'결과요약'} sx={{ height: '100%', overflowY: 'auto' }}>
              <ResultSummaryTab ref={resultSummaryRef} />
            </TabPanel>
            <TabPanel value={'유지관리지침서'} sx={{ height: '100%', overflowY: 'auto' }}>
              <GuideTab ref={guideRef} />
            </TabPanel>
            <TabPanel value={'작동상태'} sx={{ height: '100%', overflowY: 'auto' }}>
              <OperationStatusTab rootCategories={rootCategories} />
            </TabPanel>
          </TabContext>
        </DialogContent>
        <DialogActions className='flex items-center justify-center'>
          <Button color='primary' variant='contained' type='button' onClick={handleSave}>
            저장
          </Button>
          {/* <Button color='success' variant='contained' type='button'>
              보고서 다운로드
            </Button> */}
          <Button color='secondary' variant='contained' onClick={() => setOpen(false)} type='button'>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
