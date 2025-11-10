import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { useParams } from 'next/navigation'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  styled,
  TextField,
  Typography
} from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import styles from '@/app/_style/Table.module.css'
import { centerStyle, type refType } from '../MachinePerformanceReviewModal'
import {
  useGetOperationStatus,
  useMutateOperationStatus,
  useMutateOperationStatusAutoFill
} from '@/@core/hooks/customTanstackQueries'
import type {
  MachineInspectionRootCategoryResponseDtoType,
  MachinePerformanceReviewOperationStatusResponseDtoType
} from '@/@core/types'

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

const OperationStatusTab = forwardRef<refType, { rootCategories?: MachineInspectionRootCategoryResponseDtoType[] }>(
  ({ rootCategories }, ref) => {
    const machineProjectId = useParams().id?.toString()

    const { data: operationStatus } = useGetOperationStatus(machineProjectId!)
    const { mutate } = useMutateOperationStatus(machineProjectId!)
    const { mutate: mutateAutoFill } = useMutateOperationStatusAutoFill(machineProjectId!)

    const {
      register,
      control,
      getValues,
      reset,
      formState: { isDirty }
    } = useForm<MachinePerformanceReviewOperationStatusResponseDtoType>({
      defaultValues: {
        // Result 필드는 'NONE'으로 초기화
        refrigeratorResult: operationStatus?.refrigeratorResult ?? 'NONE',
        coolingTowerResult: operationStatus?.coolingTowerResult ?? 'NONE',
        thermalStorageResult: operationStatus?.thermalStorageResult ?? 'NONE',
        boilerResult: operationStatus?.boilerResult ?? 'NONE',
        heatExchangerResult: operationStatus?.heatExchangerResult ?? 'NONE',
        expansionTankResult: operationStatus?.expansionTankResult ?? 'NONE',
        pumpResult: operationStatus?.pumpResult ?? 'NONE',
        renewableEnergySystemResult: operationStatus?.renewableEnergySystemResult ?? 'NONE',
        packageAirConditionerResult: operationStatus?.packageAirConditionerResult ?? 'NONE',
        precisionAirConditionerResult: operationStatus?.precisionAirConditionerResult ?? 'NONE',
        airHandlingUnitResult: operationStatus?.airHandlingUnitResult ?? 'NONE',
        fanCoilUnitResult: operationStatus?.fanCoilUnitResult ?? 'NONE',
        ventilationSystemResult: operationStatus?.ventilationSystemResult ?? 'NONE',
        filterResult: operationStatus?.filterResult ?? 'NONE',
        sanitaryFacilityResult: operationStatus?.sanitaryFacilityResult ?? 'NONE',
        hotWaterSupplyResult: operationStatus?.hotWaterSupplyResult ?? 'NONE',
        waterTankResult: operationStatus?.waterTankResult ?? 'NONE',
        drainageResult: operationStatus?.drainageResult ?? 'NONE',
        waterReuseResult: operationStatus?.waterReuseResult ?? 'NONE',
        pipeLineResult: operationStatus?.pipeLineResult ?? 'NONE',
        ductResult: operationStatus?.ductResult ?? 'NONE',
        insulationResult: operationStatus?.insulationResult ?? 'NONE',
        automaticControlResult: operationStatus?.automaticControlResult ?? 'NONE',
        noiseVibrationSeismicResult: operationStatus?.noiseVibrationSeismicResult ?? 'NONE',

        // Remark 및 Opinion 필드는 ''으로 초기화
        refrigeratorRemark: operationStatus?.refrigeratorRemark ?? '',
        coolingTowerRemark: operationStatus?.coolingTowerRemark ?? '',
        thermalStorageRemark: operationStatus?.thermalStorageRemark ?? '',
        boilerRemark: operationStatus?.boilerRemark ?? '',
        heatExchangerRemark: operationStatus?.heatExchangerRemark ?? '',
        expansionTankRemark: operationStatus?.expansionTankRemark ?? '',
        pumpRemark: operationStatus?.pumpRemark ?? '',
        renewableEnergySystemRemark: operationStatus?.renewableEnergySystemRemark ?? '',
        packageAirConditionerRemark: operationStatus?.packageAirConditionerRemark ?? '',
        precisionAirConditionerRemark: operationStatus?.precisionAirConditionerRemark ?? '',
        airHandlingUnitRemark: operationStatus?.airHandlingUnitRemark ?? '',
        fanCoilUnitRemark: operationStatus?.fanCoilUnitRemark ?? '',
        ventilationSystemRemark: operationStatus?.ventilationSystemRemark ?? '',
        filterRemark: operationStatus?.filterRemark ?? '',
        sanitaryFacilityRemark: operationStatus?.sanitaryFacilityRemark ?? '',
        hotWaterSupplyRemark: operationStatus?.hotWaterSupplyRemark ?? '',
        waterTankRemark: operationStatus?.waterTankRemark ?? '',
        drainageRemark: operationStatus?.drainageRemark ?? '',
        waterReuseRemark: operationStatus?.waterReuseRemark ?? '',
        pipeLineRemark: operationStatus?.pipeLineRemark ?? '',
        ductRemark: operationStatus?.ductRemark ?? '',
        insulationRemark: operationStatus?.insulationRemark ?? '',
        automaticControlRemark: operationStatus?.automaticControlRemark ?? '',
        noiseVibrationSeismicRemark: operationStatus?.noiseVibrationSeismicRemark ?? '',
        opinion: operationStatus?.opinion ?? ''
      }
    })

    useEffect(() => {
      reset({
        // Result 필드는 'NONE'으로 초기화
        refrigeratorResult: operationStatus?.refrigeratorResult ?? 'NONE',
        coolingTowerResult: operationStatus?.coolingTowerResult ?? 'NONE',
        thermalStorageResult: operationStatus?.thermalStorageResult ?? 'NONE',
        boilerResult: operationStatus?.boilerResult ?? 'NONE',
        heatExchangerResult: operationStatus?.heatExchangerResult ?? 'NONE',
        expansionTankResult: operationStatus?.expansionTankResult ?? 'NONE',
        pumpResult: operationStatus?.pumpResult ?? 'NONE',
        renewableEnergySystemResult: operationStatus?.renewableEnergySystemResult ?? 'NONE',
        packageAirConditionerResult: operationStatus?.packageAirConditionerResult ?? 'NONE',
        precisionAirConditionerResult: operationStatus?.precisionAirConditionerResult ?? 'NONE',
        airHandlingUnitResult: operationStatus?.airHandlingUnitResult ?? 'NONE',
        fanCoilUnitResult: operationStatus?.fanCoilUnitResult ?? 'NONE',
        ventilationSystemResult: operationStatus?.ventilationSystemResult ?? 'NONE',
        filterResult: operationStatus?.filterResult ?? 'NONE',
        sanitaryFacilityResult: operationStatus?.sanitaryFacilityResult ?? 'NONE',
        hotWaterSupplyResult: operationStatus?.hotWaterSupplyResult ?? 'NONE',
        waterTankResult: operationStatus?.waterTankResult ?? 'NONE',
        drainageResult: operationStatus?.drainageResult ?? 'NONE',
        waterReuseResult: operationStatus?.waterReuseResult ?? 'NONE',
        pipeLineResult: operationStatus?.pipeLineResult ?? 'NONE',
        ductResult: operationStatus?.ductResult ?? 'NONE',
        insulationResult: operationStatus?.insulationResult ?? 'NONE',
        automaticControlResult: operationStatus?.automaticControlResult ?? 'NONE',
        noiseVibrationSeismicResult: operationStatus?.noiseVibrationSeismicResult ?? 'NONE',

        // Remark 및 Opinion 필드는 ''으로 초기화
        refrigeratorRemark: operationStatus?.refrigeratorRemark ?? '',
        coolingTowerRemark: operationStatus?.coolingTowerRemark ?? '',
        thermalStorageRemark: operationStatus?.thermalStorageRemark ?? '',
        boilerRemark: operationStatus?.boilerRemark ?? '',
        heatExchangerRemark: operationStatus?.heatExchangerRemark ?? '',
        expansionTankRemark: operationStatus?.expansionTankRemark ?? '',
        pumpRemark: operationStatus?.pumpRemark ?? '',
        renewableEnergySystemRemark: operationStatus?.renewableEnergySystemRemark ?? '',
        packageAirConditionerRemark: operationStatus?.packageAirConditionerRemark ?? '',
        precisionAirConditionerRemark: operationStatus?.precisionAirConditionerRemark ?? '',
        airHandlingUnitRemark: operationStatus?.airHandlingUnitRemark ?? '',
        fanCoilUnitRemark: operationStatus?.fanCoilUnitRemark ?? '',
        ventilationSystemRemark: operationStatus?.ventilationSystemRemark ?? '',
        filterRemark: operationStatus?.filterRemark ?? '',
        sanitaryFacilityRemark: operationStatus?.sanitaryFacilityRemark ?? '',
        hotWaterSupplyRemark: operationStatus?.hotWaterSupplyRemark ?? '',
        waterTankRemark: operationStatus?.waterTankRemark ?? '',
        drainageRemark: operationStatus?.drainageRemark ?? '',
        waterReuseRemark: operationStatus?.waterReuseRemark ?? '',
        pipeLineRemark: operationStatus?.pipeLineRemark ?? '',
        ductRemark: operationStatus?.ductRemark ?? '',
        insulationRemark: operationStatus?.insulationRemark ?? '',
        automaticControlRemark: operationStatus?.automaticControlRemark ?? '',
        noiseVibrationSeismicRemark: operationStatus?.noiseVibrationSeismicRemark ?? '',
        opinion: operationStatus?.opinion ?? ''
      })
    }, [operationStatus, reset])

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
        <table style={{ tableLayout: 'fixed', width: '100%', ...centerStyle }}>
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
            {/* 1행 */}
            <tr>
              <td rowSpan={12} colSpan={3}>
                열원 및
                <br />
                냉난방 설비
              </td>
              {rootCategories?.find(v => v.machineCategoryName === '냉동기') ? (
                <>
                  <td colSpan={3}>냉동기</td>

                  <td colSpan={2} style={{ padding: 0 }}>
                    <Controller
                      control={control}
                      name={'refrigeratorResult'}
                      render={({ field }) => (
                        <Select variant='standard' size='small' value={field.value} onChange={field.onChange}>
                          <MenuItem value='PASS'>O</MenuItem>
                          <MenuItem value='FAIL'>X</MenuItem>
                          <MenuItem value='NONE'>/</MenuItem>
                        </Select>
                      )}
                    />
                  </td>
                  <td colSpan={4} style={{ padding: 0 }}>
                    <StyledTextField multiline rows={1} {...register('refrigeratorRemark')} />
                  </td>
                </>
              ) : (
                <>
                  <td colSpan={3} style={{ color: 'lightgray' }}>
                    냉동기
                  </td>
                  <td colSpan={2} style={{ color: 'lightgray' }}>
                    /
                  </td>
                  <td colSpan={4} style={{ color: 'lightgray' }}>
                    -
                  </td>
                </>
              )}
              <td rowSpan={2} colSpan={3}>
                환기설비
              </td>
              <td colSpan={3}>환기설비</td>
              <td colSpan={2}>O</td>
              <td colSpan={4}>O</td>
            </tr>
            {/* 2행 */}
            <tr>
              <td colSpan={3}>냉각탑</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>
              <td colSpan={3}>필터</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>
            </tr>
            {/* 3행 */}
            <tr>
              <td colSpan={3}>축열조</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>
              <td rowSpan={1} colSpan={3}>
                위생기구 설비
              </td>
              <td colSpan={3}>위생기구 설비</td>
              <td colSpan={2}>O</td>
              <td colSpan={4}>O</td>
            </tr>
            {/* 4행 */}
            <tr>
              <td colSpan={3}>보일러</td>
              <td colSpan={2}>O</td>
              <td colSpan={4}>O</td>
              <td rowSpan={2} colSpan={3}>
                급수·
                <br />
                급탕설비
              </td>
              <td colSpan={3}>급수·급탕설비</td>
              <td colSpan={2}>O</td>
              <td colSpan={4}>O</td>
            </tr>
            {/* 5행 */}
            <tr>
              <td colSpan={3}>열교환기</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>
              <td colSpan={3}>고·저수조</td>
              <td colSpan={2}>O</td>
              <td colSpan={4}>O</td>
            </tr>
            {/* 6행 */}
            <tr>
              <td colSpan={3}>팽창탱크</td>
              <td colSpan={2}>O</td>
              <td colSpan={4}>O</td>
              <td rowSpan={1} colSpan={3}>
                오·배수 및 우수 배수 설비
              </td>
              <td colSpan={3}>오·배수 통기 및 우수배수 설비</td>
              <td colSpan={2}>O</td>
              <td colSpan={4}>O</td>
            </tr>
            {/* 7행 */}
            <tr>
              <td colSpan={3}>펌프(냉·난방)</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>
              <td rowSpan={2} colSpan={3}>
                오수정화 및
                <br />물 재이용 설비
              </td>
              <td colSpan={3}>오수정화 설비</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>
            </tr>
            {/* 8행 */}
            <tr>
              <td colSpan={3}>신재생(지열)</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>
              <td colSpan={3}>물 재이용 설비</td>
              <td colSpan={2}>O</td>
              <td colSpan={4}>O</td>
            </tr>
            {/* 9행 */}
            <tr>
              <td colSpan={3}>신재생(태양열)</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>

              <td colSpan={6}>배관설비</td>
              <td colSpan={2}>O</td>
              <td colSpan={4}>O</td>
            </tr>
            {/* 10행 */}
            <tr>
              <td colSpan={3}>신재생(연료전지)</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>
              <td colSpan={6}>덕트 설비</td>
              <td colSpan={2}>O</td>
              <td colSpan={4}>O</td>
            </tr>
            {/* 11행 */}
            <tr>
              <td colSpan={3}>패키지 에어컨</td>
              <td colSpan={2}>O</td>
              <td colSpan={4}>O</td>
              <td colSpan={6}>보온 설비</td>
              <td colSpan={2}>O</td>
              <td colSpan={4}>O</td>
            </tr>
            {/* 12행 */}
            <tr>
              <td colSpan={3}>항온항습기</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>
              <td colSpan={6}>자동제어 설비</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>
            </tr>
            {/* 13행 */}
            <tr>
              <td colSpan={3} rowSpan={2}>
                공기조화설비
              </td>
              <td colSpan={3}>공기조화기</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>
              <td colSpan={6} rowSpan={2}>
                방음·방진·내진 설비
              </td>
              <td colSpan={2} rowSpan={2}>
                O
              </td>
              <td colSpan={4} rowSpan={2}>
                O
              </td>
            </tr>
            {/* 14행 */}
            <tr>
              <td colSpan={3}>팬코일유닛</td>
              <td colSpan={2}>/</td>
              <td colSpan={4}>-</td>
            </tr>
          </tbody>
        </table>
        <div className='w-full relative grid place-items-center'>
          {!isDirty && <Typography color='warning.main'>※변경사항이 없습니다※</Typography>}
          <AutoFillBtn />
        </div>
      </div>
    )
  }
)

export default OperationStatusTab
