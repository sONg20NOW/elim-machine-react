import { MEMBER_INPUT_INFO } from '../input/MemberInputInfo'
import type { InputFieldType, MemberFilterType } from '../../_type/types'

const { role, companyName, memberStatus } = MEMBER_INPUT_INFO.basic
const { officePosition, officeDepartmentName, contractType, laborForm, workForm } = MEMBER_INPUT_INFO.office
const { foreignYn } = MEMBER_INPUT_INFO.privacy

export const MEMBER_FILTER_INFO: Record<keyof MemberFilterType, InputFieldType> = {
  role: role!,
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
    options: [
      { value: 'MALE', label: '남' },
      { value: 'FEMALE', label: '여' }
    ]
  },
  careerYear: {
    type: 'multi',
    label: '근속년수',
    options: [
      { value: '1', label: '1년차' },
      { value: '2', label: '2년차' },
      { value: '3', label: '3년차' },
      { value: '4', label: '4년차' },
      { value: '5', label: '5년차' },
      { value: '6', label: '6년차' },
      { value: '7', label: '7년차' },
      { value: '8', label: '8년차' },
      { value: '9', label: '9년차' },
      { value: '10', label: '10년차' }
    ]
  },
  memberStatus: memberStatus!
}
