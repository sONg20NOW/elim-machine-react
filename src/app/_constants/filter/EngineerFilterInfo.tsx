import { companyNameOption, gradeOption, workStatusOption } from '@/app/_constants/options'
import type { EngineerFilterType, InputFieldType } from '../../../@core/types'

export const ENGINEER_FILTER_INFO: Record<keyof EngineerFilterType, InputFieldType> = {
  companyName: {
    type: 'multi',
    label: '회사',
    options: companyNameOption
  },
  grade: {
    type: 'multi',
    label: '등급',
    options: gradeOption
  },
  workStatus: {
    type: 'multi',
    label: '상태',
    options: workStatusOption
  }
}
