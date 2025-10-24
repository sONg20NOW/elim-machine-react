import type { EngineerFilterType, MachineEngineerCreateRequestDtoType } from '@/@core/types'

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
