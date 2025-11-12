import { forwardRef, memo, useEffect, useImperativeHandle } from 'react'

import { useParams } from 'next/navigation'

import { Radio, Typography, useTheme } from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import { centerStyle, type refType } from '../MachinePerformanceReviewModal'
import styles from '@/app/_style/Table.module.css'
import type { MachinePerformanceReviewGuideResponseDtoType } from '@/@core/types'
import { useGetGuide, useMutateGuide } from '@/@core/hooks/customTanstackQueries'
import { makeGuideSeed } from './utils/makeSeed'

const GuideTabInner = forwardRef<refType, {}>(({}, ref) => {
  const machineProjectId = useParams().id?.toString()

  const theme = useTheme()

  const { data: guide } = useGetGuide(machineProjectId!)

  const { mutate } = useMutateGuide(machineProjectId!)

  const {
    reset,
    control,
    getValues,
    formState: { isDirty }
  } = useForm<MachinePerformanceReviewGuideResponseDtoType>({
    defaultValues: makeGuideSeed(guide)
  })

  useEffect(() => {
    reset(makeGuideSeed(guide))
  }, [guide, reset])

  useImperativeHandle(ref, () => ({
    onSubmit: () => {
      mutate(getValues())
    },
    isDirty: isDirty
  }))

  const RadioControl = ({ name }: { name: keyof MachinePerformanceReviewGuideResponseDtoType }) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <>
          <td colSpan={1} style={centerStyle}>
            <Radio name={name} value={'Y'} checked={field.value === 'Y'} onChange={() => field.onChange('Y')} />
          </td>
          <td colSpan={1} style={centerStyle}>
            <Radio name={name} value={'N'} checked={field.value === 'N'} onChange={() => field.onChange('N')} />
          </td>
        </>
      )}
    />
  )

  return (
    <div className={`${styles.container} flex flex-col gap-4 items-center justify-between h-full`}>
      <div className='flex flex-col gap-4 items-center'>
        <table
          style={{
            tableLayout: 'fixed',
            width: '100%',
            borderTop: '2px solid',
            borderTopColor: theme.palette.primary.light
          }}
        >
          {/* Colgroup 완전히 제거 */}
          <thead>
            <tr>
              {/* 구비서류 (3+6 = 9 컬럼에 해당) */}
              <th colSpan={9}>구비서류</th>
              {/* 유 (1 컬럼에 해당) */}
              <th colSpan={1}>유</th>
              {/* 무 (1 컬럼에 해당) */}
              <th colSpan={1}>무</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. 기계설비 준공도서 (Rowspan 3) */}
            <tr>
              <td rowSpan={3} colSpan={3} style={{ fontWeight: 'bold', ...centerStyle }}>
                기계설비 준공도서
              </td>
              <td colSpan={6}>• 준공도면</td>
              <RadioControl name='builtDrawingYn' />
            </tr>
            <tr>
              <td colSpan={6}>• 시방서</td>
              <RadioControl name='specificationYn' />
            </tr>
            <tr>
              <td colSpan={6}>• 부하 및 장비선정 계산서</td>
              <RadioControl name='loadCalculationYn' />
            </tr>

            {/* 2. 기계설비 시스템 운영 매뉴얼 (Rowspan 2) */}
            <tr>
              <td rowSpan={2} colSpan={3} style={{ fontWeight: 'bold', ...centerStyle }}>
                기계설비 시스템 운영 매뉴얼
              </td>
              <td colSpan={6}>• 기계설비 시스템 운영 매뉴얼</td>
              <RadioControl name='operationManual' />
            </tr>
            <tr>
              <td colSpan={6}>• 기계설비 제조사의 검사 또는 제조사의 성적서</td>
              <RadioControl name='manufacturerCertificateYn' />
            </tr>
          </tbody>
        </table>

        {/*
        두 번째 테이블: 기술 기준 확인표
      */}
        <table
          style={{
            tableLayout: 'fixed',
            width: '100%',
            borderTop: '2px solid',
            borderTopColor: theme.palette.primary.light
          }}
        >
          {/* Colgroup 완전히 제거 */}
          <thead>
            <tr>
              {/* 구비서류 (3+6 = 9 컬럼에 해당) */}
              <th colSpan={9}>구비서류</th>
              {/* 해당 (1 컬럼에 해당) */}
              <th colSpan={1}>해당</th>
              {/* 해당없음 (1 컬럼에 해당) */}
              <th colSpan={1}>해당없음</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ fontWeight: 'bold', ...centerStyle }}>
                기계설비 사용 전 확인표
              </td>
              <td colSpan={6}>• 「기계설비 기술기준」 별지 제3호 서식</td>
              <RadioControl name='techStandardForm3Yn' />
            </tr>
            <tr>
              <td colSpan={3} style={{ fontWeight: 'bold', ...centerStyle }}>
                기계설비 성능확인서
              </td>
              <td colSpan={6}>• 「기계설비 기술기준」 별지 제4호 서식</td>
              <RadioControl name='techStandardForm4Yn' />
            </tr>
            <tr>
              <td colSpan={3} style={{ fontWeight: 'bold', ...centerStyle }}>
                기계설비 안전확인서
              </td>
              <td colSpan={6}>• 「기계설비 기술기준」 별지 제5호 서식</td>
              <RadioControl name='techStandardForm5Yn' />
            </tr>
            <tr>
              <td colSpan={3} style={{ fontWeight: 'bold', ...centerStyle }}>
                기계설비 사용 적합 확인서
              </td>
              <td colSpan={6}>• 「기계설비 기술기준」 별지 제6호 서식</td>
              <RadioControl name='techStandardForm6Yn' />
            </tr>
          </tbody>
        </table>
      </div>
      {!isDirty && (
        <Typography sx={{ color: 'warning.main', pb: 4 }}>※유지관리지침서의 변경사항이 없습니다※</Typography>
      )}
    </div>
  )
})

const GuideTab = memo(GuideTabInner)

export default GuideTab
