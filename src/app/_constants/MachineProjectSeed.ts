import type {
  MachineFilterType,
  MachineProjectCreateRequestDtoType,
  machineProjectEngineerDetailDtoType
} from '@/@core/types'

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

// 초기 엔지니어 값 (참여기술진 추가에 사용)
export const MachineProjectEngineerInitialData: machineProjectEngineerDetailDtoType = {
  engineerId: 0,
  engineerName: '',
  grade: '',
  gradeDescription: '',
  engineerLicenseNum: '',
  beginDate: '',
  endDate: '',
  note: ''
}
