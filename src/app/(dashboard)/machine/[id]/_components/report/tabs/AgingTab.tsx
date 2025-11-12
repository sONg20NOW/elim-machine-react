import { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react'

import { useParams } from 'next/navigation'

import { MenuItem, Select, Typography, useTheme } from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import styles from '@/app/_style/Table.module.css'
import type { refType } from '../MachinePerformanceReviewModal'
import { centerStyle, StyledTextField } from '../MachinePerformanceReviewModal'
import type {
  MachineInspectionRootCategoryResponseDtoType,
  MachinePerformanceReviewAgingUpdateResponseDtoType
} from '@/@core/types'
import { useGetAging, useMutateAging, useMutateAgingAutoFill } from '@/@core/hooks/customTanstackQueries'

const AgingTab = memo(
  forwardRef<refType, { rootCategories?: MachineInspectionRootCategoryResponseDtoType[] }>(
    ({ rootCategories }, ref) => {
      const machineProjectId = useParams().id?.toString()

      const theme = useTheme()
      const [autoFillTrigger, setAutoFillTrigger] = useState(true)

      const { data: aging } = useGetAging(machineProjectId!)
      const { mutate } = useMutateAging(machineProjectId!)
      const { mutate: mutateAutoFill } = useMutateAgingAutoFill(machineProjectId!)

      const {
        register,
        control,
        reset,
        getValues,
        formState: { isDirty }
      } = useForm<MachinePerformanceReviewAgingUpdateResponseDtoType>({
        defaultValues: {
          agingStandard: aging?.agingStandard ?? 'KOREA_REAL_ESTATE_BOARD',
          agingInspectionResult: aging?.agingInspectionResult ?? ''
        }
      })

      useImperativeHandle(ref, () => ({
        onSubmit: () => {
          mutate(getValues())
        },
        onAutoFill: () => {
          mutateAutoFill()
          setAutoFillTrigger(prev => !prev)
        },
        isDirty: isDirty
      }))

      useEffect(() => {
        reset({ agingStandard: aging?.agingStandard, agingInspectionResult: aging?.agingInspectionResult ?? '' })
      }, [aging, reset, autoFillTrigger])

      const OperationRow = ({ categoryName, colSpan = 3 }: { categoryName: string; colSpan?: number }) => {
        const exists = rootCategories?.some(v => v.machineCategoryName === categoryName)

        const agingEquipment = aging?.agingEquipments?.find(v => v.machineRootCategoryName === categoryName) ?? null

        return exists && agingEquipment ? (
          <>
            <td colSpan={colSpan}>{agingEquipment.machineRootCategoryName}</td>
            <td colSpan={5}>{agingEquipment.systemName}</td>
            <td colSpan={2}>{agingEquipment.durableYearProcurement}</td>
            <td colSpan={2}>{agingEquipment.durableYearRealEstate}</td>
            <td colSpan={3}>{agingEquipment.usedYear}</td>
            <td colSpan={4}>{agingEquipment.remark}</td>
          </>
        ) : (
          <>
            <td colSpan={colSpan} style={{ color: 'lightgray' }}>
              {categoryName}
            </td>
            <td colSpan={16} style={{ color: 'lightgray' }}></td>
          </>
        )
      }

      return (
        <div className={`${styles.container} flex flex-col gap-4 items-center h-full justify-between `}>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1 w-full'>
              <div className='flex justify-between items-end'>
                <div className='flex gap-1 items-end'>
                  <Typography variant='h5'>기계설비 내구연한에 따른 노후도</Typography>
                  <Typography>(조회만 가능)</Typography>
                </div>
                {control && (
                  <Controller
                    control={control}
                    name={'agingStandard'}
                    render={({ field }) => (
                      <Select size='small' {...field} slotProps={{ input: { sx: { py: 1, px: 2 } } }}>
                        <MenuItem value='KOREA_REAL_ESTATE_BOARD'>한국부동산원 기준</MenuItem>
                        <MenuItem value='PUBLIC_PROCUREMENT_SERVICE'>조달청 기준</MenuItem>
                      </Select>
                    )}
                  />
                )}
              </div>
              <table
                style={{
                  tableLayout: 'fixed',
                  borderTop: '2px solid',
                  borderTopColor: theme.palette.primary.light,
                  ...centerStyle
                }}
              >
                <thead>
                  <tr>
                    <th colSpan={6}>점검대상 기계설비</th>
                    <th colSpan={5}>장비번호/계통명</th>
                    <th colSpan={2}>
                      내구연한
                      <br />
                      (조달청)
                    </th>
                    <th colSpan={2}>
                      내구연한
                      <br />
                      (부동산원)
                    </th>
                    <th colSpan={3}>사용연수</th>
                    <th colSpan={4}>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 열원 및 냉난방 설비 (Rowspan 12) */}
                  <tr>
                    <td rowSpan={10} colSpan={3}>
                      열원 및<br />
                      냉난방 설비
                    </td>
                    <OperationRow categoryName='냉동기' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='냉각탑' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='축열조' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='보일러' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='열교환기' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='팽창탱크' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='펌프(냉·난방)' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='신재생' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='패키지 에어컨' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='항온 항습기' />
                  </tr>

                  {/* 공기조화설비 (Rowspan 2) */}
                  <tr>
                    <td rowSpan={2} colSpan={3} style={centerStyle}>
                      공기조화설비
                    </td>
                    <OperationRow categoryName='공기 조화기' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='팬코일 유닛' />
                  </tr>

                  {/* 환기설비 (Rowspan 2) */}
                  <tr>
                    <td rowSpan={2} colSpan={3}>
                      환기설비
                    </td>
                    <OperationRow categoryName='환기설비' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='필터' />
                  </tr>

                  {/* 위생기구 설비 (Rowspan 1) */}
                  <tr>
                    <OperationRow colSpan={6} categoryName='위생 기구 설비' />
                  </tr>

                  {/* 급수 및 급탕 설비 (Rowspan 2) */}
                  <tr>
                    <td rowSpan={2} colSpan={3} style={centerStyle}>
                      급수·급탕설비
                    </td>
                    <OperationRow categoryName='급수·급탕설비' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='고·저수조' />
                  </tr>

                  {/* 오·배수 및 우수배수 설비 (Rowspan 1) */}
                  <tr>
                    <td rowSpan={1} colSpan={3} style={centerStyle}>
                      오·배수 및 우수 배수설비
                    </td>
                    <OperationRow categoryName='오·배수 통기 및 우수배수설비' />
                  </tr>

                  {/* 오수정화 및 물 재이용 설비 (Rowspan 2) */}
                  <tr>
                    <td rowSpan={2} colSpan={3} style={centerStyle}>
                      오수정화 및 물 재이용 설비
                    </td>
                    <OperationRow categoryName='오수 정화 설비' />
                  </tr>
                  <tr>
                    <OperationRow categoryName='물 재이용 설비' />
                  </tr>

                  {/* 기타설비 (Rowspan 4) */}
                  <tr>
                    <OperationRow colSpan={6} categoryName='배관설비' />
                  </tr>
                  <tr>
                    <OperationRow colSpan={6} categoryName='덕트설비' />
                  </tr>
                  <tr>
                    <OperationRow colSpan={6} categoryName='보온설비' />
                  </tr>
                  <tr>
                    <OperationRow colSpan={6} categoryName='자동제어설비' />
                  </tr>

                  {/* 방음·방진·내진 설비 (Rowspan 1) */}
                  <tr>
                    <OperationRow colSpan={6} categoryName='방음·방진·내진설비' />
                  </tr>
                </tbody>
              </table>
            </div>
            <div className='flex flex-col gap-1 w-full'>
              <Typography variant='h5'>노후도 점검결과</Typography>
              <StyledTextField
                {...register('agingInspectionResult')}
                sx={{ borderTop: '2px solid', borderTopColor: 'primary.light' }}
                fullWidth
                multiline
                rows={4}
                placeholder='노후도 점검결과를 입력하세요'
              />
            </div>
          </div>
          {!isDirty && (
            <Typography color='warning.main' sx={{ pb: 4 }}>
              ※노후도의 변경사항이 없습니다※
            </Typography>
          )}
        </div>
      )
    }
  )
)

export default AgingTab
