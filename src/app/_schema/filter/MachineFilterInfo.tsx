import type { InputFieldType, MachineFilterType } from '../../_type/types'
import { MACHINE_INPUT_INFO } from '../input/MachineInputInfo'

const { projectStatus, companyName } = MACHINE_INPUT_INFO

export const MACHINE_FILTER_INFO: Record<keyof MachineFilterType, InputFieldType> = {
  projectStatus: projectStatus!,
  companyName: companyName!,
  engineerName: {
    type: 'multi',
    label: '점검자',

    // ! option은 API로 가져와서 유동적으로 설정
    options: []
  }
}
