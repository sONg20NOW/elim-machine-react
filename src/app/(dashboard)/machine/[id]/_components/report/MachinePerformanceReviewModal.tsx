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
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  styled,
  Tab,
  TextField,
  Typography
} from '@mui/material'

import TabContext from '@mui/lab/TabContext'

import TabList from '@mui/lab/TabList'

import styles from '@/app/_style/Table.module.css'

import { auth } from '@/lib/auth'
import { handleSuccess } from '@/utils/errorHandler'
import type { MachineInspectionRootCategoryResponseDtoType } from '@/@core/types'
import ResultSummaryTab from './tabs/ResultSummaryTab'
import GuideTab from './tabs/GuideTab'
import OperationStatusTab from './tabs/OperationStatusTab'
import MeasurementTab from './tabs/MeasurementTab'
import AgingTab from './tabs/AgingTab'
import ImprovementTab from './tabs/ImprovementTab'

const StyledTab = styled(Tab)(({ theme }) => ({
  color: 'white',
  '&:hover': { color: 'lightgray !important' },
  fontSize: theme.typography.h5.fontSize
}))

type TabType = '결과요약' | '유지관리지침서' | '작동상태' | '측정값 일치' | '노후도' | '개선사항' | '연도별 계획'

export interface refType {
  onSubmit: () => void
  onAutoFill?: () => void
  isDirty: boolean
}

export const centerStyle: CSSProperties = { textAlign: 'center', verticalAlign: 'middle' }

export const StyledTextField = styled(TextField)({
  width: '100%',
  height: '100%',
  '& .MuiInputBase-root': {
    height: '100%',
    boxSizing: 'border-box',
    padding: '8px'
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: 0
  }
})

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

  useEffect(() => {
    if (open) setTabValue('결과요약')
  }, [open])

  useEffect(() => {
    scrollAreaRef.current && scrollAreaRef.current.scrollTo({ top: 0 })
  }, [tabValue])

  // const { data: guide, refetch: refetchGuide } = useGetGuide(machineProjectId!)
  // const { data: operationStatus, refetch: refetchOperationStatus } = useGetOperationStatus(machineProjectId!)
  // const { data: measurement, refetch: refetchMeasurement } = useGetMeasurement(machineProjectId!)
  // const { data: aging, refetch: refetchAging } = useGetAging(machineProjectId!)
  // const { data: improvement, refetch: refetchImprovement } = useGetImprovement(machineProjectId!)
  // const { data: yearlyPlan, refetch: refetchYearlyPlan } = useGetYearlyPlan(machineProjectId!)

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const resultSummaryRef = useRef<refType>(null)
  const guideRef = useRef<refType>(null)
  const operationStatusRef = useRef<refType>(null)
  const measurementRef = useRef<refType>(null)
  const agingRef = useRef<refType>(null)
  const improvementRef = useRef<refType>(null)

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

    if (operationStatusRef.current && operationStatusRef.current.isDirty) {
      operationStatusRef.current.onSubmit()
      message.push('작동상태')
    }

    if (measurementRef.current && measurementRef.current.isDirty) {
      measurementRef.current.onSubmit()
      message.push('작동상태')
    }

    if (agingRef.current && agingRef.current.isDirty) {
      agingRef.current.onSubmit()
      message.push('노후도')
    }

    if (improvementRef.current && improvementRef.current.isDirty) {
      improvementRef.current.onSubmit()
      message.push('개선사항')
    }

    if (message.length > 0) {
      handleSuccess(`${message.join(', ')} 탭의 내용이 성공적으로 저장되었습니다.`)
    }
  }

  function handleAutoFill() {
    switch (tabValue) {
      case '결과요약':
        resultSummaryRef.current && resultSummaryRef.current.onAutoFill && resultSummaryRef.current.onAutoFill()
        break
      case '작동상태':
        operationStatusRef.current && operationStatusRef.current.onAutoFill && operationStatusRef.current.onAutoFill()
        break
      case '측정값 일치':
        measurementRef.current && measurementRef.current.onAutoFill && measurementRef.current.onAutoFill()
        break
      case '노후도':
        agingRef.current && agingRef.current.onAutoFill && agingRef.current.onAutoFill()
        break
      case '개선사항':
        improvementRef.current && improvementRef.current.onAutoFill && improvementRef.current.onAutoFill()
        break
      default:
        break
    }
  }

  // 자동 채우기 버튼
  const AutoFillBtn = () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button variant='outlined' type='button' onClick={() => setOpen(true)}>
          자동 채우기
        </Button>
        <Dialog open={open}>
          <DialogTitle>
            이전 내용에 덮어씌워집니다.
            <DialogContentText sx={{ mt: 1 }}>그래도 자동으로 채우겠습니까?</DialogContentText>
          </DialogTitle>
          <DialogActions>
            <Button
              type='button'
              onClick={() => {
                handleAutoFill()
                setOpen(false)
              }}
            >
              예
            </Button>
            <Button type='button' onClick={() => setOpen(false)} color='secondary'>
              아니오
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
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
            {/* 탭이 이동해도 언마운트 되지 않도록 TabPanel이 아닌 div로 구현 */}
            <div style={{ height: '100%', overflowY: 'auto' }} ref={scrollAreaRef}>
              <div style={{ display: tabValue === '결과요약' ? 'block' : 'none', height: '100%' }}>
                <ResultSummaryTab ref={resultSummaryRef} />
              </div>
              <div style={{ display: tabValue === '유지관리지침서' ? 'block' : 'none', height: '100%' }}>
                <GuideTab ref={guideRef} />
              </div>
              <div style={{ display: tabValue === '작동상태' ? 'block' : 'none', height: '100%' }}>
                <OperationStatusTab rootCategories={rootCategories} ref={operationStatusRef} />
              </div>
              <div style={{ display: tabValue === '측정값 일치' ? 'block' : 'none', height: '100%' }}>
                <MeasurementTab rootCategories={rootCategories} ref={measurementRef} />
              </div>
              <div style={{ display: tabValue === '노후도' ? 'block' : 'none', height: '100%' }}>
                <AgingTab rootCategories={rootCategories} ref={agingRef} />
              </div>
              <div style={{ display: tabValue === '개선사항' ? 'block' : 'none', height: '100%' }}>
                <ImprovementTab rootCategories={rootCategories} ref={improvementRef} />
              </div>
            </div>
          </TabContext>
        </DialogContent>
        <DialogActions className='flex items-center justify-center'>
          {tabValue !== '유지관리지침서' && <AutoFillBtn />}
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
