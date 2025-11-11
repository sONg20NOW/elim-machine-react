import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { useParams } from 'next/navigation'

import { MenuItem, Select, Typography, useTheme } from '@mui/material'

import { Controller, useForm, useFormState } from 'react-hook-form'

import { toast } from 'react-toastify'

import styles from '@/app/_style/Table.module.css'
import { centerStyle, StyledTextField, type refType } from '../MachinePerformanceReviewModal'
import {
  useGetOperationStatus,
  useMutateOperationStatus,
  useMutateOperationStatusAutoFill
} from '@/@core/hooks/customTanstackQueries'
import type {
  MachineInspectionRootCategoryResponseDtoType,
  MachinePerformanceReviewOperationStatusResponseDtoType
} from '@/@core/types'
import { makeOperationStatusSeed } from './utils/makeSeed'

const OperationStatusTab = forwardRef<refType, { rootCategories?: MachineInspectionRootCategoryResponseDtoType[] }>(
  ({ rootCategories }, ref) => {
    const machineProjectId = useParams().id?.toString()

    const theme = useTheme()
    const [autoFillTrigger, setAutoFillTrigger] = useState(true)

    const { data: operationStatus } = useGetOperationStatus(machineProjectId!)
    const { mutate } = useMutateOperationStatus(machineProjectId!)
    const { mutate: mutateAutoFill } = useMutateOperationStatusAutoFill(machineProjectId!)

    const { register, control, getValues, reset } = useForm<MachinePerformanceReviewOperationStatusResponseDtoType>({
      defaultValues: makeOperationStatusSeed(operationStatus)
    })

    useEffect(() => {
      console.log('RESET!')
      reset(makeOperationStatusSeed(operationStatus))
    }, [operationStatus, reset, autoFillTrigger])

    // 내부 컴포넌트
    const OperationRow = ({
      categoryName,
      resultFieldName,
      remarkFieldName,
      colSpan = 3,
      rowSpan = 1
    }: {
      categoryName: string
      resultFieldName: keyof MachinePerformanceReviewOperationStatusResponseDtoType
      remarkFieldName: keyof MachinePerformanceReviewOperationStatusResponseDtoType
      colSpan?: number
      rowSpan?: number
    }) => {
      const exists = rootCategories?.some(v => v.machineCategoryName === categoryName)

      if (!exists) {
        return (
          <>
            <td rowSpan={rowSpan} colSpan={colSpan} style={{ color: 'lightgray' }}>
              {categoryName}
            </td>
            <td rowSpan={rowSpan} colSpan={2} style={{ color: 'lightgray' }}>
              /
            </td>
            <td rowSpan={rowSpan} colSpan={4} style={{ color: 'lightgray' }}>
              -
            </td>
          </>
        )
      }

      return (
        <>
          <td rowSpan={rowSpan} colSpan={colSpan}>
            {categoryName}
          </td>
          <td rowSpan={rowSpan} colSpan={2} style={{ padding: 0 }}>
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
          <td rowSpan={rowSpan} colSpan={4} style={{ padding: 0 }}>
            <StyledTextField multiline rows={1} {...register(remarkFieldName)} />
          </td>
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
          toast.info('작동상태 자동채우기를 완료했습니다.')
        },
        isDirty: isDirty // 수정 여부 상태
      }))

      return !isDirty ? (
        <Typography color='warning.main' sx={{ pb: 4 }}>
          ※측정값 일치의 변경사항이 없습니다※
        </Typography>
      ) : null
    }

    return (
      <div className={`${styles.container} flex flex-col gap-4 items-center h-full justify-between `}>
        <div className='flex flex-col gap-1'>
          <Typography variant='h5'>기계설비 시스템 작동상태 점검표</Typography>
          <table
            style={{
              tableLayout: 'fixed',
              width: '100%',
              ...centerStyle,
              borderTop: '2px solid',
              borderTopColor: theme.palette.primary.light
            }}
          >
            <thead>
              <tr>
                {/* 좌측 헤더 (3:3:2:4 = 12컬럼) */}
                <th colSpan={3}>구분</th>
                <th colSpan={3}>대상설비</th>
                <th colSpan={2}>결과</th>
                <th colSpan={4}>비고</th>

                {/* 우측 헤더 (3:3:2:4 = 12컬럼) */}
                <th colSpan={3}>구분</th>
                <th colSpan={3}>대상설비</th>
                <th colSpan={2}>결과</th>
                <th colSpan={4}>비고</th>
              </tr>
            </thead>
            <tbody>
              {/* 1행: 냉동기 / 환기설비 */}
              <tr>
                {/* 좌측 메인 카테고리 (Rowspan 4) */}
                <td rowSpan={12} colSpan={3} style={centerStyle}>
                  열원 및
                  <br />
                  냉난방 설비
                </td>
                {/* 좌측 대상 설비: 냉동기 */}
                <OperationRow
                  categoryName='냉동기'
                  resultFieldName={'refrigeratorResult'}
                  remarkFieldName={'refrigeratorRemark'}
                />
                {/* 우측 메인 카테고리 (Rowspan 2) */}
                <td rowSpan={2} colSpan={3} style={centerStyle}>
                  환기설비
                </td>
                {/* 우측 대상 설비: 환기설비 */}
                <OperationRow
                  categoryName='환기설비'
                  resultFieldName={'ventilationSystemResult'}
                  remarkFieldName={'ventilationSystemRemark'}
                />
              </tr>
              {/* 2행: 냉각탑 / 필터 */}
              <tr>
                {/* 좌측 대상 설비: 냉각탑 */}
                <OperationRow
                  categoryName='냉각탑'
                  resultFieldName={'coolingTowerResult'}
                  remarkFieldName={'coolingTowerRemark'}
                />
                {/* 우측 대상 설비: 필터 */}
                <OperationRow categoryName='필터' resultFieldName={'filterResult'} remarkFieldName={'filterRemark'} />
              </tr>
              {/* 3행: 축열조 / 위생기구 설비 */}
              <tr>
                {/* 좌측 대상 설비: 축열조 */}
                <OperationRow
                  categoryName='축열조'
                  resultFieldName={'thermalStorageResult'}
                  remarkFieldName={'thermalStorageRemark'}
                />
                {/* 우측 대상 설비: 위생기구 설비 */}
                <OperationRow
                  colSpan={6}
                  categoryName='위생 기구 설비'
                  resultFieldName={'sanitaryFacilityResult'}
                  remarkFieldName={'sanitaryFacilityRemark'}
                />
              </tr>
              {/* 4행: 보일러 / 급수·급탕설비 */}
              <tr>
                {/* 좌측 대상 설비: 보일러 */}
                <OperationRow categoryName='보일러' resultFieldName={'boilerResult'} remarkFieldName={'boilerRemark'} />
                {/* 우측 메인 카테고리 (Rowspan 2) */}
                <td rowSpan={2} colSpan={3} style={centerStyle}>
                  급수·
                  <br />
                  급탕설비
                </td>
                {/* 우측 대상 설비: 급수·급탕설비 */}
                <OperationRow
                  categoryName='급수·급탕설비'
                  resultFieldName={'hotWaterSupplyResult'}
                  remarkFieldName={'hotWaterSupplyRemark'}
                />
              </tr>
              {/* 5행: 열교환기 / 고·저수조 */}
              <tr>
                {/* 좌측 대상 설비: 열교환기 */}
                <OperationRow
                  categoryName='열교환기'
                  resultFieldName={'heatExchangerResult'}
                  remarkFieldName={'heatExchangerRemark'}
                />
                {/* 우측 대상 설비: 고·저수조 */}
                <OperationRow
                  categoryName='고·저수조'
                  resultFieldName={'waterTankResult'}
                  remarkFieldName={'waterTankRemark'}
                />
              </tr>
              {/* 6행: 팽창탱크 / 오·배수 및 우수 배수 설비 */}
              <tr>
                {/* 좌측 대상 설비: 팽창탱크 */}
                <OperationRow
                  categoryName='팽창탱크'
                  resultFieldName={'expansionTankResult'}
                  remarkFieldName={'expansionTankRemark'}
                />
                {/* 우측 대상 설비: 오·배수 통기 및 우수배수 설비 */}
                <OperationRow
                  colSpan={6}
                  categoryName='오·배수 통기 및 우수배수설비'
                  resultFieldName={'drainageResult'}
                  remarkFieldName={'drainageRemark'}
                />
              </tr>
              {/* 7행: 펌프(냉·난방) / 오수정화 설비 */}
              <tr>
                {/* 좌측 대상 설비: 펌프(냉·난방) */}
                <OperationRow
                  categoryName='펌프(냉·난방)'
                  resultFieldName={'pumpResult'}
                  remarkFieldName={'pumpRemark'}
                />
                {/* 우측 메인 카테고리 (Rowspan 2) */}
                <td rowSpan={2} colSpan={3} style={centerStyle}>
                  오수정화 및
                  <br />물 재이용 설비
                </td>
                {/* 우측 대상 설비: 오수정화 설비 */}
                <OperationRow
                  categoryName='오수 정화 설비'
                  resultFieldName={'sewageTreatmentResult'}
                  remarkFieldName={'sewageTreatmentRemark'}
                />
              </tr>
              {/* 8행: 신재생(지열) / 물 재이용 설비 */}
              <tr>
                {/* 좌측 대상 설비: 신재생(지열) */}
                <OperationRow
                  categoryName='신재생(지열)'
                  resultFieldName={'renewableEnergySystemResult'}
                  remarkFieldName={'renewableEnergySystemRemark'}
                />
                {/* 우측 대상 설비: 물 재이용 설비 */}
                <OperationRow
                  categoryName='물 재이용 설비'
                  resultFieldName={'waterReuseResult'}
                  remarkFieldName={'waterReuseRemark'}
                />
              </tr>
              {/* 9행: 신재생(태양열) / 배관설비 */}
              <tr>
                {/* 좌측 대상 설비: 신재생(태양열) */}
                <OperationRow
                  categoryName='신재생(태양열)'
                  resultFieldName={'renewableEnergySystemResult'}
                  remarkFieldName={'renewableEnergySystemRemark'}
                />

                {/* 우측 대상 설비: 배관설비 */}
                <OperationRow
                  colSpan={6}
                  categoryName='배관설비'
                  resultFieldName={'pipeLineResult'}
                  remarkFieldName={'pipeLineRemark'}
                />
              </tr>
              {/* 10행: 신재생(연료전지) / 덕트 설비 */}
              <tr>
                {/* 좌측 대상 설비: 신재생(연료전지) */}
                <OperationRow
                  categoryName='신재생(연료전지)'
                  resultFieldName={'renewableEnergySystemResult'}
                  remarkFieldName={'renewableEnergySystemRemark'}
                />
                {/* 우측 대상 설비: 덕트 설비 */}
                <OperationRow
                  colSpan={6}
                  categoryName='덕트설비'
                  resultFieldName={'ductResult'}
                  remarkFieldName={'ductRemark'}
                />
              </tr>
              {/* 11행: 패키지 에어컨 / 보온 설비 */}
              <tr>
                {/* 좌측 대상 설비: 패키지 에어컨 */}
                <OperationRow
                  categoryName='패키지 에어컨'
                  resultFieldName={'packageAirConditionerResult'}
                  remarkFieldName={'packageAirConditionerRemark'}
                />
                {/* 우측 대상 설비: 보온 설비 */}
                <OperationRow
                  colSpan={6}
                  categoryName='보온설비'
                  resultFieldName={'insulationResult'}
                  remarkFieldName={'insulationRemark'}
                />
              </tr>
              {/* 12행: 항온항습기 / 자동제어 설비 */}
              <tr>
                {/* 좌측 대상 설비: 항온항습기 */}
                <OperationRow
                  categoryName='항온 항습기'
                  resultFieldName={'precisionAirConditionerResult'}
                  remarkFieldName={'precisionAirConditionerRemark'}
                />
                {/* 우측 대상 설비: 자동제어 설비 */}
                <OperationRow
                  colSpan={6}
                  categoryName='자동제어설비'
                  resultFieldName={'automaticControlResult'}
                  remarkFieldName={'automaticControlRemark'}
                />
              </tr>
              {/* 13행: 공기조화기 / 방음·방진·내진 설비 */}
              <tr>
                {/* 좌측 메인 카테고리 (Rowspan 2) */}
                <td rowSpan={2} colSpan={3} style={centerStyle}>
                  공기조화설비
                </td>
                {/* 좌측 대상 설비: 공기조화기 */}
                <OperationRow
                  categoryName='공기 조화기'
                  resultFieldName={'airHandlingUnitResult'}
                  remarkFieldName={'airHandlingUnitRemark'}
                />
                {/* 우측 대상 설비: 방음·방진·내진 설비 */}
                <OperationRow
                  rowSpan={2}
                  colSpan={6}
                  categoryName='방음·방진·내진설비'
                  resultFieldName={'noiseVibrationSeismicResult'}
                  remarkFieldName={'noiseVibrationSeismicRemark'}
                />
              </tr>
              {/* 14행: 팬코일유닛 / 우측 빈 셀 */}
              <tr>
                {/* 좌측 대상 설비: 팬코일유닛 */}
                <OperationRow
                  categoryName='팬코일 유닛'
                  resultFieldName={'fanCoilUnitResult'}
                  remarkFieldName={'fanCoilUnitRemark'}
                />
              </tr>
            </tbody>
          </table>
        </div>
        <div className='flex flex-col gap-1 w-full'>
          <Typography variant='h5'>조치사항 의견</Typography>
          <StyledTextField
            sx={{ borderTop: '2px solid', borderTopColor: 'primary.light' }}
            fullWidth
            multiline
            rows={4}
            placeholder='조치사항 의견을 입력하세요'
            {...register('opinion')}
          />
        </div>
        <DirtyNotice />
      </div>
    )
  }
)

export default OperationStatusTab
