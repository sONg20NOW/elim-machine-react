import { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react'

import { useParams } from 'next/navigation'

import { MenuItem, Select, Typography, useTheme } from '@mui/material'

import { Controller, useForm, useFormState } from 'react-hook-form'

import styles from '@core/styles/customTable.module.css'
import type { refType } from '../MachinePerformanceReviewModal'
import { centerStyle, StyledTextField } from '../MachinePerformanceReviewModal'
import type {
  MachineInspectionRootCategoryResponseDtoType,
  MachinePerformanceReviewYearlyPlanResponseDtoType
} from '@core/types'
import { useGetYearlyPlan, useMutateYearlyPlan, useMutateYearlyPlanAutoFill } from '@core/hooks/customTanstackQueries'
import { makeYearlyPlanSeed } from './makeSeed'

const defaultYears = [1, 2, 3, 4, 5]

const YearlyPlanTab = memo(
  forwardRef<refType, { rootCategories?: MachineInspectionRootCategoryResponseDtoType[] }>(
    ({ rootCategories }, ref) => {
      const machineProjectId = useParams().id?.toString()

      const theme = useTheme()
      const [autoFillTrigger, setAutoFillTrigger] = useState(true)

      const { data: yearlyPlan } = useGetYearlyPlan(machineProjectId!)
      const { mutate } = useMutateYearlyPlan(machineProjectId!)
      const { mutate: mutateAutoFill } = useMutateYearlyPlanAutoFill(machineProjectId!)

      const { register, control, reset, getValues } = useForm<MachinePerformanceReviewYearlyPlanResponseDtoType>({
        defaultValues: makeYearlyPlanSeed(yearlyPlan)
      })

      useEffect(() => {
        reset(makeYearlyPlanSeed(yearlyPlan))
      }, [yearlyPlan, reset, autoFillTrigger])

      const OperationRow = ({
        categoryName,
        resultFieldName,
        deficiencyFieldName,
        planYearFieldName,
        colSpan = 3
      }: {
        categoryName: string
        resultFieldName: keyof MachinePerformanceReviewYearlyPlanResponseDtoType
        deficiencyFieldName: keyof MachinePerformanceReviewYearlyPlanResponseDtoType
        planYearFieldName: string
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
            <td colSpan={6} style={{ padding: 0 }}>
              <StyledTextField multiline maxRows={3} {...register(deficiencyFieldName)} />
            </td>
            {defaultYears.map(year => (
              <td key={year} colSpan={2} style={{ padding: 0 }}>
                <Controller
                  control={control}
                  name={`${planYearFieldName}${year}` as keyof MachinePerformanceReviewYearlyPlanResponseDtoType}
                  render={({ field }) => (
                    <Select
                      sx={{
                        px: 4,
                        backgroundColor: 'transparent',
                        border: 'none',
                        '&:before, &:after': { display: 'none' }, // 밑줄 제거
                        '& .MuiFilledInput-root': {
                          backgroundColor: 'transparent'
                        },
                        '& .MuiSelect-filled': { py: 0 },
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          height: '100%', // 높이 최대
                          py: 0
                        }
                      }}
                      fullWidth
                      variant='filled'
                      size='small'
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <MenuItem value='INSPECTION'>점검</MenuItem>
                      <MenuItem value='REPLACEMENT'>교체</MenuItem>
                      <MenuItem value='REPAIR'>보수</MenuItem>
                      <MenuItem value='INSTALLATION'>설치</MenuItem>
                      <MenuItem value='NONE'></MenuItem>
                    </Select>
                  )}
                />
              </td>
            ))}
          </>
        ) : (
          <>
            <td colSpan={colSpan} style={{ color: 'lightgray' }}>
              {categoryName}
            </td>
            <td colSpan={18} style={{ color: 'lightgray' }}></td>
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
            ※연도별 계획의 변경사항이 없습니다※
          </Typography>
        ) : null
      }

      return (
        <div className={`${styles.container} flex flex-col gap-4 items-center h-full justify-between `}>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1 w-full'>
              <Typography variant='h5'>성능개선 필요성 및 연도별 세부개선계획</Typography>
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
                    <th rowSpan={2} colSpan={6}>
                      점검대상 기계설비
                    </th>
                    <th rowSpan={2} colSpan={2}>
                      점검결과
                    </th>
                    <th rowSpan={2} colSpan={6}>
                      성능개선 필요성
                    </th>
                    <th colSpan={10}>성능개선 계획(성능점검일 기준)</th>
                  </tr>
                  <tr>
                    {defaultYears.map(year => (
                      <th key={year} colSpan={2}>{`${year}년차`}</th>
                    ))}
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
                      planYearFieldName={'refrigeratorPlanYear'}
                      categoryName='냉동기'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'coolingTowerResult'}
                      deficiencyFieldName={'coolingTowerDeficiency'}
                      planYearFieldName={'coolingTowerPlanYear'}
                      categoryName='냉각탑'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'thermalStorageResult'}
                      deficiencyFieldName={'thermalStorageDeficiency'}
                      planYearFieldName={'thermalStoragePlanYear'}
                      categoryName='축열조'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'boilerResult'}
                      deficiencyFieldName={'boilerDeficiency'}
                      planYearFieldName={'boilerPlanYear'}
                      categoryName='보일러'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'heatExchangerResult'}
                      deficiencyFieldName={'heatExchangerDeficiency'}
                      planYearFieldName={'heatExchangerPlanYear'}
                      categoryName='열교환기'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'expansionTankResult'}
                      deficiencyFieldName={'expansionTankDeficiency'}
                      planYearFieldName={'expansionTankPlanYear'}
                      categoryName='팽창탱크'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'pumpResult'}
                      deficiencyFieldName={'pumpDeficiency'}
                      planYearFieldName={'pumpPlanYear'}
                      categoryName='펌프(냉·난방)'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'renewableEnergySystemResult'}
                      deficiencyFieldName={'renewableEnergySystemDeficiency'}
                      planYearFieldName={'renewableEnergySystemPlanYear'}
                      categoryName='신재생'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'packageAirConditionerResult'}
                      deficiencyFieldName={'packageAirConditionerDeficiency'}
                      planYearFieldName={'packageAirConditionerPlanYear'}
                      categoryName='패키지 에어컨'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'precisionAirConditionerResult'}
                      deficiencyFieldName={'precisionAirConditionerDeficiency'}
                      planYearFieldName={'precisionAirConditionerPlanYear'}
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
                      planYearFieldName={'airHandlingUnitPlanYear'}
                      categoryName='공기 조화기'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'fanCoilUnitResult'}
                      deficiencyFieldName={'fanCoilUnitDeficiency'}
                      planYearFieldName={'fanCoilUnitPlanYear'}
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
                      planYearFieldName={'ventilationSystemPlanYear'}
                      categoryName='환기설비'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'filterResult'}
                      deficiencyFieldName={'filterDeficiency'}
                      planYearFieldName={'filterPlanYear'}
                      categoryName='필터'
                    />
                  </tr>

                  {/* 위생기구 설비 (Rowspan 1) */}
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'sanitaryFacilityResult'}
                      deficiencyFieldName={'sanitaryFacilityDeficiency'}
                      planYearFieldName={'sanitaryFacilityPlanYear'}
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
                      planYearFieldName={'hotWaterSupplyPlanYear'}
                      categoryName='급수·급탕설비'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'waterTankResult'}
                      deficiencyFieldName={'waterTankDeficiency'}
                      planYearFieldName={'waterTankPlanYear'}
                      categoryName='고·저수조'
                    />
                  </tr>

                  {/* 오·배수 및 우수배수 설비 (Rowspan 1) */}
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'drainageResult'}
                      deficiencyFieldName={'drainageDeficiency'}
                      planYearFieldName={'drainagePlanYear'}
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
                      planYearFieldName={'sewageTreatmentPlanYear'}
                      categoryName='오수 정화 설비'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      resultFieldName={'waterReuseResult'}
                      deficiencyFieldName={'waterReuseDeficiency'}
                      planYearFieldName={'waterReusePlanYear'}
                      categoryName='물 재이용 설비'
                    />
                  </tr>

                  {/* 기타설비 (Rowspan 4) */}
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'pipeLineResult'}
                      deficiencyFieldName={'pipeLineDeficiency'}
                      planYearFieldName={'pipeLinePlanYear'}
                      categoryName='배관설비'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'ductResult'}
                      deficiencyFieldName={'ductDeficiency'}
                      planYearFieldName={'ductPlanYear'}
                      categoryName='덕트설비'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'insulationResult'}
                      deficiencyFieldName={'insulationDeficiency'}
                      planYearFieldName={'insulationPlanYear'}
                      categoryName='보온설비'
                    />
                  </tr>
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'automaticControlResult'}
                      deficiencyFieldName={'automaticControlDeficiency'}
                      planYearFieldName={'automaticControlPlanYear'}
                      categoryName='자동제어설비'
                    />
                  </tr>

                  {/* 방음·방진·내진 설비 (Rowspan 1) */}
                  <tr>
                    <OperationRow
                      colSpan={6}
                      resultFieldName={'automaticControlResult'}
                      deficiencyFieldName={'automaticControlDeficiency'}
                      planYearFieldName={'soundProofPlanYear'}
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

export default YearlyPlanTab
