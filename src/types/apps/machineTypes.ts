// 주소 타입
export type AddressType = {
  roadAddress?: string | null
  detailAddress?: string | null
}

// 관리 정보 DTO
export type MachineProjectManagementResponseDto = {
  address?: AddressType | null
  bizno?: string | null
  completeDate?: string | null
  contractDate?: string | null
  contractManager?: string | null
  contractManagerEmail?: string | null
  contractManagerTel?: string | null
  contractPartner?: string | null
  contractPartnerEmail?: string | null
  contractPartnerTel?: string | null
  contractPrice?: number | null
  grossArea?: number | null
  houseCnt?: number | null
  institutionName?: string | null
  machineMaintainer1Info?: string | null
  machineMaintainer1Name?: string | null
  machineMaintainer2Info?: string | null
  machineMaintainer2Name?: string | null
  machineMaintainer3Info?: string | null
  machineMaintainer3Name?: string | null
  machineManager1Info?: string | null
  machineManager1Name?: string | null
  machineManager2Info?: string | null
  machineManager2Name?: string | null
  machineManager3Info?: string | null
  machineManager3Name?: string | null
  manager?: string | null
  managerPhone?: string | null
  projectStatus?: string | null
  projectStatusDescription?: string | null
  purpose?: string | null
  representative?: string | null
  requirement?: string | null
  structure?: string | null
  tel?: string | null
  vatIncludedYn?: string | null
  version?: number | null
}

// 일정 및 기술진 DTO
export type MachineProjectScheduleAndEngineerResponseDto = {
  beginDate?: string | null
  buildingGrade?: string | null
  buildingGradeDescription?: string | null
  checkType?: string | null
  checkTypeDescription?: string | null
  endDate?: string | null
  engineers?: any[] // 필요시 엔지니어 타입 정의
  fieldBeginDate?: string | null
  fieldEndDate?: string | null
  machineProjectId?: number | null
  note?: string | null
  reportDeadline?: string | null
  reportManagerEmail?: string | null
  tiIssueDate?: string | null
  version?: number | null
}

// 통합 타입
export type MachineProjectDetail = {
  machineProjectManagementResponseDto: MachineProjectManagementResponseDto
  machineProjectScheduleAndEngineerResponseDto: MachineProjectScheduleAndEngineerResponseDto
}

// 테이블에서 사용하는 기계 프로젝트 타입
export type MachineType = {
  machineProjectId: number
  projectStatusDescription: string
  region: string
  machineProjectName: string
  fieldBeginDate: string
  fieldEndDate: string
  reportDeadline: string
  inspectionCount: number
  companyName: string
  engineerNames: string | string[]
  grossArea: number
  tel: string
}
