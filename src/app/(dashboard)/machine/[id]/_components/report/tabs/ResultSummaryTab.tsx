import { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react'

import { useParams } from 'next/navigation'

import { Typography, useTheme } from '@mui/material'

import { useForm } from 'react-hook-form'

import styles from '@/app/_style/Table.module.css'
import { centerStyle, StyledTextField, type refType } from '../MachinePerformanceReviewModal'
import {
  useGetResultSummary,
  useMutateResultSummary,
  useMutateResultSummaryAutoFill
} from '@/@core/hooks/customTanstackQueries'
import type { MachinePerformanceReviewSummaryResponseDtoType } from '@/@core/types'
import { makeResultSummarySeed } from './utils/makeSeed'

const ResultSummaryTab = memo(
  forwardRef<refType, {}>(({}, ref) => {
    const machineProjectId = useParams().id?.toString()

    const theme = useTheme()

    const [autoFillTrigger, setAutoFillTrigger] = useState(true)

    const { data: resultSummary } = useGetResultSummary(machineProjectId!)
    const { mutate } = useMutateResultSummary(machineProjectId!)
    const { mutate: mutateAutoFill } = useMutateResultSummaryAutoFill(machineProjectId!)

    const {
      register,
      getValues,
      reset,
      formState: { isDirty }
    } = useForm<MachinePerformanceReviewSummaryResponseDtoType>({
      defaultValues: makeResultSummarySeed(resultSummary)
    })

    useEffect(() => {
      reset(makeResultSummarySeed(resultSummary))
    }, [resultSummary, reset, autoFillTrigger])

    useImperativeHandle(ref, () => ({
      onSubmit: () => {
        mutate(getValues())
      },
      onAutoFill: () => {
        mutateAutoFill()
        setAutoFillTrigger(prev => !prev)
      },
      isDirty: isDirty // 수정 여부 상태
    }))

    return (
      <div className={`${styles.container} flex flex-col gap-4 items-center h-full justify-between `}>
        <table style={{ tableLayout: 'fixed', borderTop: '2px solid', borderTopColor: theme.palette.primary.light }}>
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
        {!isDirty && (
          <Typography sx={{ pb: 5 }} color='warning.main'>
            ※결과요약의 변경사항이 없습니다※
          </Typography>
        )}
      </div>
    )
  })
)

export default ResultSummaryTab
