import type { MachineFilterType, MachineProjectCreateRequestDtoType } from '@/app/_type/types'

export const MachineProjectInitialData: MachineProjectCreateRequestDtoType = {
  companyName: '',
  machineProjectName: '',
  beginDate: '',
  endDate: '',
  fieldBeginDate: '',
  fieldEndDate: '',
  note: ''
}

// 초기 필터링 값
export const MachineInitialFilters: MachineFilterType = {
  projectStatus: '',
  companyName: '',
  engineerName: '' // ← engineerNames → engineerName
}
