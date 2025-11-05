import type { MemberCreateRequestDtoType, MemberFilterType } from '@/@core/types'

export const MemberInitialData: MemberCreateRequestDtoType = {
  name: '',
  email: '',
  companyName: '',

  // role: '',
  memberStatus: '',
  note: ''
}

export const MemeberInitialFilters: MemberFilterType = {
  // role: '',
  companyName: '',
  officeDepartmentName: '',
  officePosition: '',
  memberStatus: '',
  careerYear: '',
  contractType: '',
  laborForm: '',
  workForm: '',
  gender: '',
  foreignYn: ''
}
