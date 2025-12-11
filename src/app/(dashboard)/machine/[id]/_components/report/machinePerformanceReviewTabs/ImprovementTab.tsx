import { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react'

import { useParams } from 'next/navigation'

import { MenuItem, Select, Typography, useTheme } from '@mui/material'

import { Controller, useForm, useFormState } from 'react-hook-form'

import styles from '@core/styles/customTable.module.css'
import type { refType } from '../MachinePerformanceReviewModal'
import { centerStyle, StyledTextField } from '../MachinePerformanceReviewModal'
import type {
  MachineInspectionRootCategoryResponseDtoType,
  MachinePerformanceReviewImprovementResponseDtoType
} from '@core/types'
import {
  useGetImprovement,
  useMutateImprovement,
  useMutateImprovementAutoFill
} from '@core/hooks/customTanstackQueries'
import { makeImprovementSeed } from '../../../_utils/makeSeed'

const ImprovementTab = memo(
  forwardRef<refType, { rootCategories?: MachineInspectionRootCategoryResponseDtoType[] }>(
    ({ rootCategories }, ref) => {
      const machineProjectId = useParams().id?.toString()

      const theme = useTheme()
      const [autoFillTrigger, setAutoFillTrigger] = useState(true)

      const { data: improvement } = useGetImprovement(machineProjectId!)
      const { mutate } = useMutateImprovement(machineProjectId!)
      const { mutate: mutateAutoFill } = useMutateImprovementAutoFill(machineProjectId!)

      const { register, control, reset, getValues } = useForm<MachinePerformanceReviewImprovementResponseDtoType>({
        defaultValues: makeImprovementSeed(improvement)
      })

      useEffect(() => {
        reset(makeImprovementSeed(improvement))
      }, [improvement, reset, autoFillTrigger])

      const OperationRow = ({
        categoryName,
        resultFieldName,
        deficiencyFieldName,
        improvementFieldName,
        colSpan = 3
      }: {
        categoryName: string
        resultFieldName: keyof MachinePerformanceReviewImprovementResponseDtoType
        deficiencyFieldName: keyof MachinePerformanceReviewImprovementResponseDtoType
        improvementFieldName: keyof MachinePerformanceReviewImprovementResponseDtoType
        colSpan?: number
      }) => {
        const exists = rootCategories?.some(v => v.machineCategoryName === categoryName)

        return exists ? (
          <>
            <td colSpan={colSpan}>{categoryName}</td>
            <td colSpan={2} style={{ padding: 0 }}>
              <Controller
                control={control}
                name={resultFieldName}
                render={({ field }) => (
                  <Select
                    IconComponent={() => null}
                    sx={{ width: '50%', '& .MuiSelect-select': { p: '0 !important' } }}
                    variant='standard'
                    size='small'
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <MenuItem value='PASS'>O</MenuItem>
                    <MenuItem value='FAIL'>X</MenuItem>
                    <MenuItem value='NONE'>/</MenuItem>
                  </Select>
                )}
              />
            </td>
            <td colSpan={7} style={{ padding: 0 }}>
              <StyledTextField multiline rows={1} {...register(deficiencyFieldName)} />
            </td>
            <td colSpan={7} style={{ padding: 0 }}>
              <StyledTextField multiline rows={1} {...register(improvementFieldName)} />
            </td>
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

      const DirtyNotice = () => {
        const { isDirty } = useFormState({ control })

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

        return !isDirty ? (
          <Typography color='warning.main' sx={{ pb: 4 }}>
            ※개선사항의 변경사항이 없습니다※
          </Typography>
        ) : null
      }

      return (
        <div className={`${styles.container} flex flex-col gap-4 items-center h-full justify-between `}>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1 w-full'>
              <Typography variant='h5'>성능점검표에 따른 조치사항 및 개선사항</Typography>
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
                    <th colSpan={2}>결과</th>
                    <th colSpan={7}>미흡사항</th>
                    <th colSpan={7}>개선사항</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 열원 및 냉난방 설비 (Rowspan 12) */}
                  <tr>
                    <td rowSpan={10} colSpan={3}>
                      열원 및<br />
                      냉난방 설비
                    </td>
                    <OperationRow
                      resultFieldName={'refrigeratorResult'}
                      deficiencyFieldName={'refrigeratorDeficiency'}
                      improvementFieldName={'refrigeratorImprovement'}
                      categoryName='냉동기'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'coolingTowerResult'}
                      deficiencyFieldName={'coolingTowerDeficiency'}
                      improvementFieldName={'coolingTowerImprovement'}
                      categoryName='냉각탑'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'thermalStorageResult'}
                      deficiencyFieldName={'thermalStorageDeficiency'}
                      improvementFieldName={'thermalStorageImprovement'}
                      categoryName='축열조'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'boilerResult'}
                      deficiencyFieldName={'boilerDeficiency'}
                      improvementFieldName={'boilerImprovement'}
                      categoryName='보일러'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'heatExchangerResult'}
                      deficiencyFieldName={'heatExchangerDeficiency'}
                      improvementFieldName={'heatExchangerImprovement'}
                      categoryName='열교환기'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'expansionTankResult'}
                      deficiencyFieldName={'expansionTankDeficiency'}
                      improvementFieldName={'expansionTankImprovement'}
                      categoryName='팽창탱크'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'pumpResult'}
                      deficiencyFieldName={'pumpDeficiency'}
                      improvementFieldName={'pumpImprovement'}
                      categoryName='펌프(냉·난방)'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'renewableEnergySystemResult'}
                      deficiencyFieldName={'renewableEnergySystemDeficiency'}
                      improvementFieldName={'renewableEnergySystemImprovement'}
                      categoryName='신재생'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'packageAirConditionerResult'}
                      deficiencyFieldName={'packageAirConditionerDeficiency'}
                      improvementFieldName={'packageAirConditionerImprovement'}
                      categoryName='패키지 에어컨'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'precisionAirConditionerResult'}
                      deficiencyFieldName={'precisionAirConditionerDeficiency'}
                      improvementFieldName={'precisionAirConditionerImprovement'}
                      categoryName='항온 항습기'
                    />
                  </tr>

                  {/* 공기조화설비 (Rowspan 2) */}
                  <tr>
                    <td rowSpan={2} colSpan={3} style={centerStyle}>
                      공기조화설비
                    </td>
                    <OperationRow
                      resultFieldName={'airHandlingUnitResult'}
                      deficiencyFieldName={'airHandlingUnitDeficiency'}
                      improvementFieldName={'airHandlingUnitImprovement'}
                      categoryName='공기 조화기'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'fanCoilUnitResult'}
                      deficiencyFieldName={'fanCoilUnitDeficiency'}
                      improvementFieldName={'fanCoilUnitImprovement'}
                      categoryName='팬코일 유닛'
                    />
                  </tr>

                  {/* 환기설비 (Rowspan 2) */}
                  <tr>
                    <td rowSpan={2} colSpan={3}>
                      환기설비
                    </td>
                    <OperationRow
                      resultFieldName={'ventilationSystemResult'}
                      deficiencyFieldName={'ventilationSystemDeficiency'}
                      improvementFieldName={'ventilationSystemImprovement'}
                      categoryName='환기설비'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'filterResult'}
                      deficiencyFieldName={'filterDeficiency'}
                      improvementFieldName={'filterImprovement'}
                      categoryName='필터'
                    />
                  </tr>

                  {/* 위생기구 설비 (Rowspan 1) */}
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'sanitaryFacilityResult'}
                      deficiencyFieldName={'sanitaryFacilityDeficiency'}
                      improvementFieldName={'sanitaryFacilityImprovement'}
                      categoryName='위생 기구 설비'
                    />
                  </tr>

                  {/* 급수 및 급탕 설비 (Rowspan 2) */}
                  <tr>
                    <td rowSpan={2} colSpan={3} style={centerStyle}>
                      급수·급탕설비
                    </td>
                    <OperationRow
                      resultFieldName={'hotWaterSupplyResult'}
                      deficiencyFieldName={'hotWaterSupplyDeficiency'}
                      improvementFieldName={'hotWaterSupplyImprovement'}
                      categoryName='급수·급탕설비'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'waterTankResult'}
                      deficiencyFieldName={'waterTankDeficiency'}
                      improvementFieldName={'waterTankImprovement'}
                      categoryName='고·저수조'
                    />
                  </tr>

                  {/* 오·배수 및 우수배수 설비 (Rowspan 1) */}
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'drainageResult'}
                      deficiencyFieldName={'drainageDeficiency'}
                      improvementFieldName={'drainageImprovement'}
                      categoryName='오·배수 통기 및 우수배수설비'
                    />
                  </tr>

                  {/* 오수정화 및 물 재이용 설비 (Rowspan 2) */}
                  <tr>
                    <td rowSpan={2} colSpan={3} style={centerStyle}>
                      오수정화 및 물 재이용 설비
                    </td>
                    <OperationRow
                      resultFieldName={'sewageTreatmentResult'}
                      deficiencyFieldName={'sewageTreatmentDeficiency'}
                      improvementFieldName={'sewageTreatmentImprovement'}
                      categoryName='오수 정화 설비'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'waterReuseResult'}
                      deficiencyFieldName={'waterReuseDeficiency'}
                      improvementFieldName={'waterReuseImprovement'}
                      categoryName='물 재이용 설비'
                    />
                  </tr>

                  {/* 기타설비 (Rowspan 4) */}
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'pipeLineResult'}
                      deficiencyFieldName={'pipeLineDeficiency'}
                      improvementFieldName={'pipeLineImprovement'}
                      categoryName='배관설비'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'ductResult'}
                      deficiencyFieldName={'ductDeficiency'}
                      improvementFieldName={'ductImprovement'}
                      categoryName='덕트설비'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'insulationResult'}
                      deficiencyFieldName={'insulationDeficiency'}
                      improvementFieldName={'insulationImprovement'}
                      categoryName='보온설비'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'automaticControlResult'}
                      deficiencyFieldName={'automaticControlDeficiency'}
                      improvementFieldName={'automaticControlImprovement'}
                      categoryName='자동제어설비'
                    />
                  </tr>

                  {/* 방음·방진·내진 설비 (Rowspan 1) */}
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'automaticControlResult'}
                      deficiencyFieldName={'automaticControlDeficiency'}
                      improvementFieldName={'automaticControlImprovement'}
                      categoryName='방음·방진·내진설비'
                    />
                  </tr>
                </tbody>
              </table>
            </div>
            <div className='flex flex-col gap-1 w-full'>
              <Typography variant='h5'>비고</Typography>
              <StyledTextField
                {...register('note')}
                sx={{ border: '1px solid lightgray', borderTop: '2px solid', borderTopColor: 'primary.light' }}
                fullWidth
                multiline
                rows={4}
                placeholder='비고를 입력하세요'
              />
            </div>
          </div>
          <DirtyNotice />
        </div>
      )
    }
  )
)

export default ImprovementTab
