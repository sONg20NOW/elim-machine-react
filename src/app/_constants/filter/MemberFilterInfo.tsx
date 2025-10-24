import { MEMBER_INPUT_INFO } from '../input/MemberInputInfo'
import type { InputFieldType, MemberFilterType } from '../../../@core/types'
import { careerYearOption, genderOption } from '@/app/_constants/options'

const { companyName, memberStatus } = MEMBER_INPUT_INFO.basic
const { officePosition, officeDepartmentName, contractType, laborForm, workForm } = MEMBER_INPUT_INFO.office
const { foreignYn } = MEMBER_INPUT_INFO.privacy

export const MEMBER_FILTER_INFO: Record<keyof MemberFilterType, InputFieldType> = {
  // role: role!,
  companyName: companyName!,
  officeDepartmentName: officeDepartmentName!,
  officePosition: officePosition!,
  contractType: contractType!,
  laborForm: laborForm!,
  workForm: workForm!,
  foreignYn: foreignYn!,
  gender: {
    type: 'multi',
    label: '성별',
    options: genderOption
  },
  careerYear: {
    type: 'multi',
    label: '근속년수',
    options: careerYearOption
  },
  memberStatus: memberStatus!
}
