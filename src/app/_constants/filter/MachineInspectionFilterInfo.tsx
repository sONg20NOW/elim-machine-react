import type { InputFieldType, MachineInspectionFilterType } from '../../_type/types'

export const MACHINE_INSPECTION_FILTER_INFO: Record<keyof MachineInspectionFilterType, InputFieldType> = {
  engineerName: {
    type: 'multi',
    label: '점검자',

    // ! 동적으로 추가
    options: []
  }
}
