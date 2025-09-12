import type { EngineerFilterType, MachineEngineerCreateRequestDtoType } from '@/app/_type/types'

export const EngineerInitialData: MachineEngineerCreateRequestDtoType = {
  memberId: -1,
  grade: '',
  engineerLicenseNum: '',
  remark: ''
}

export const EngineerInitialFilters: EngineerFilterType = {
  companyName: '',
  grade: '',
  workStatus: ''
}
