import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { useParams } from 'next/navigation'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogTitle,
  styled,
  TextField,
  Typography
} from '@mui/material'

import { useForm } from 'react-hook-form'

import styles from '@/app/_style/Table.module.css'
import { centerStyle, type refType } from '../MachinePerformanceReviewModal'
import {
  useGetResultSummary,
  useMutateResultSummary,
  useMutateResultSummaryAutoFill
} from '@/@core/hooks/customTanstackQueries'
import type { MachinePerformanceReviewSummaryResponseDtoType } from '@/@core/types'

const StyledTextField = styled(TextField)({
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

const ResultSummaryTab = forwardRef<refType, {}>(({}, ref) => {
  const machineProjectId = useParams().id?.toString()

  const { data: resultSummary } = useGetResultSummary(machineProjectId!)
  const { mutate } = useMutateResultSummary(machineProjectId!)
  const { mutate: mutateAutoFill } = useMutateResultSummaryAutoFill(machineProjectId!)

  const {
    register,
    getValues,
    reset,
    formState: { isDirty }
  } = useForm<MachinePerformanceReviewSummaryResponseDtoType>({
    defaultValues: {
      maintenanceGuidelineAdequacy: resultSummary?.maintenanceGuidelineAdequacy || '',
      systemOperationalStatus: resultSummary?.systemOperationalStatus || '',
      designAndMeasuredValueConsistency: resultSummary?.designAndMeasuredValueConsistency || '',
      equipmentAgingDegree: resultSummary?.equipmentAgingDegree || '',
      inspectionDeficiencies: resultSummary?.inspectionDeficiencies || '',
      improvementNeedsAndPlan: resultSummary?.improvementNeedsAndPlan || '',
      energyUsageByType: resultSummary?.energyUsageByType || '',
      energyEfficiencyOperationMethod: resultSummary?.energyEfficiencyOperationMethod || ''
    }
  })

  useEffect(() => {
    reset({
      maintenanceGuidelineAdequacy: resultSummary?.maintenanceGuidelineAdequacy || '',
      systemOperationalStatus: resultSummary?.systemOperationalStatus || '',
      designAndMeasuredValueConsistency: resultSummary?.designAndMeasuredValueConsistency || '',
      equipmentAgingDegree: resultSummary?.equipmentAgingDegree || '',
      inspectionDeficiencies: resultSummary?.inspectionDeficiencies || '',
      improvementNeedsAndPlan: resultSummary?.improvementNeedsAndPlan || '',
      energyUsageByType: resultSummary?.energyUsageByType || '',
      energyEfficiencyOperationMethod: resultSummary?.energyEfficiencyOperationMethod || ''
    })
  }, [resultSummary, reset])

  useImperativeHandle(ref, () => ({
    onSubmit: () => {
      mutate(getValues())
    },
    isDirty: isDirty // 수정 여부 상태
  }))

  useEffect(() => {
    console.log('is Dirty?', isDirty)
  }, [isDirty])

  // 자동 채우기 버튼
  const AutoFillBtn = () => {
    function handleAutoFill() {
      mutateAutoFill()
    }

    const [open, setOpen] = useState(false)

    return (
      <>
        <Button
          variant='outlined'
          type='button'
          onClick={() => setOpen(true)}
          sx={{ position: 'absolute', right: 0, bottom: 0 }}
        >
          자동 채우기
        </Button>
        <Dialog open={open}>
          <DialogTitle>
            이전 내용에 덮어씌워집니다.
            <DialogContentText sx={{ mt: 1 }}>그래도 자동으로 채우겠습니까?</DialogContentText>
          </DialogTitle>
          <DialogActions>
            <Button type='button' onClick={handleAutoFill}>
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
    <div className={`${styles.container} flex flex-col gap-4 items-center h-full justify-between `}>
      <table style={{ tableLayout: 'fixed' }}>
        {/* 테이블 헤더 (총 13개 컬럼) */}
        <thead>
          <tr>
            <th colSpan={2} style={centerStyle}>
              점검항목
            </th>
            <th colSpan={3} style={centerStyle}>
              세부 검토사항
            </th>
            <th colSpan={8}>결과 요약</th>
          </tr>
        </thead>
        {/* 테이블 바디 */}
        <tbody>
          {/* 1. 기계설비 시스템 검토 (Rowspan 3) */}
          <tr>
            <td
              rowSpan={3}
              colSpan={2}
              style={centerStyle} // 첫 번째 컬럼: 메인 카테고리 가운데 정렬
            >
              기계설비
              <br />
              시스템 검토
            </td>
            <td colSpan={3} style={centerStyle}>
              유지관리지침서의 적정성
            </td>
            <td colSpan={8} style={{ padding: 0 }}>
              <StyledTextField multiline rows={2} {...register('maintenanceGuidelineAdequacy')} />
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={centerStyle}>
              기계설비 시스템의 작동상태
            </td>
            <td colSpan={8} style={{ padding: 0 }}>
              <StyledTextField multiline rows={6} {...register('systemOperationalStatus')} />
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={centerStyle}>
              점검대상 설비의 설계값과 측정값 일치 여부
            </td>
            <td colSpan={8} style={{ padding: 0 }}>
              <StyledTextField multiline rows={3} {...register('designAndMeasuredValueConsistency')} fullWidth />
            </td>
          </tr>

          {/* 2. 성능 개선 계획 (Rowspan 3) */}
          <tr>
            <td rowSpan={3} colSpan={2} style={centerStyle}>
              성능개선
              <br />
              계획
            </td>
            <td colSpan={3} style={centerStyle}>
              기계설비의 내구연한에 따른 노후도
            </td>
            <td colSpan={8} style={{ padding: 0 }}>
              <StyledTextField multiline rows={3} {...register('equipmentAgingDegree')} />
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={centerStyle}>
              성능 개선에 따른 미흡사항
            </td>
            <td colSpan={8} style={{ padding: 0 }}>
              <StyledTextField multiline rows={2} {...register('inspectionDeficiencies')} />
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={centerStyle}>
              성능 개선 필요성 및 연도별 세부 개선 계획
            </td>
            <td colSpan={8} style={{ padding: 0 }}>
              <StyledTextField multiline rows={2} {...register('improvementNeedsAndPlan')} />
            </td>
          </tr>

          {/* 3. 에너지 사용량 검토 (Rowspan 2) */}
          <tr>
            <td rowSpan={2} colSpan={2} style={centerStyle}>
              에너지사용량
              <br />
              검토
            </td>
            <td colSpan={3} style={centerStyle}>
              냉난방 설비 등 분류별 에너지 사용량
            </td>
            <td colSpan={8} style={{ padding: 0 }}>
              <StyledTextField multiline rows={2} {...register('energyUsageByType')} />
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={centerStyle}>
              효율적인 에너지 사용을 위한 설비 운영 방법
            </td>
            <td colSpan={8} style={{ padding: 0 }}>
              <StyledTextField multiline rows={3} {...register('energyEfficiencyOperationMethod')} />
            </td>
          </tr>
        </tbody>
      </table>
      <div className='w-full relative grid place-items-center'>
        {!isDirty && <Typography color='warning.main'>※변경사항이 없습니다※</Typography>}
        <AutoFillBtn />
      </div>
    </div>
  )
})

export default ResultSummaryTab
