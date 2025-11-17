// React Imports
import type { ReactNode } from 'react'

import type { StatusType } from '@/types/apps/chatTypes'

export type Layout = 'vertical' | 'collapsed' | 'horizontal'

export type Skin = 'default' | 'bordered'

export type Mode = 'system' | 'light' | 'dark'

export type SystemMode = 'light' | 'dark'

export type Direction = 'ltr' | 'rtl'

export type LayoutComponentWidth = 'compact' | 'wide'

export type LayoutComponentPosition = 'fixed' | 'static'

export type ChildrenType = {
  children: ReactNode
}

export type ThemeColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'

/**
 * @type T
 * 탭 카테고리 타입 (ex. 'basic' | 'privacy' | ...)
 * @type K
 * 상세 정보 타입 (ex. {memberBasicResponseDto: ...})
 */
export type InputInfoType<T extends string, K> = Record<T, Partial<Record<AllSubKeys<K>, InputFieldType>>>

type AllSubKeys<T> = {
  [K in keyof T]: keyof T[K]
}[keyof T]

export type TabType = {
  member: 'basic' | 'privacy' | 'office' | 'career' | 'etc'
  machine: 'project' | 'schedule'
}

// member 인풋 정보 형식
export type memberInputType = InputInfoType<TabType['member'], MemberDetailResponseDtoType>

// machine-projects/[id] 인풋 정보 형식
export type machineInputType = Partial<Record<keyof MachineProjectResponseDtoType, InputFieldType>>

// machine-projects/[id]/schedule_tab 인풋 정보 형식
export type machineScheduleInputType = Partial<
  Record<keyof MachineProjectScheduleAndEngineerResponseDtoType, InputFieldType>
>

// machine-projects/[id]/machine-project-engineers 인풋 정보 형식
export type machineProjectEngineerInputType = Partial<Record<keyof machineProjectEngineerDetailDtoType, InputFieldType>>

// engineers/[id] 인풋 정보 형식
export type engineerInputType = Partial<Record<keyof EngineerResponseDtoType, InputFieldType>>

// licenses/[id] 인풋 정보 형식
export type licenseInputType = Partial<Record<keyof LicenseResponseDtoType, InputFieldType>>

// -------- 캘린더 ----------
export interface CalendarEventResponseDtoType {
  id: number
  type: string
  name: string
  colorCode: string
}

// -------- 직원관리 --------
// POST api/members (필수: role)
export interface MemberCreateRequestDtoType {
  companyName: string
  name: string

  // role: string
  memberStatus: string
  email: string
  note: string
}

// GET api/members (리스트)
export type memberPageDtoType = {
  memberId: number
  version: number
  roleDescription: string
  name: string
  staffNum: string
  companyName: string
  officeDepartmentName: string
  officePositionDescription: string
  age: number
  email: string
  phoneNumber: string
  joinDate: string
  careerYear: number
  memberStatusDescription: string
  genderDescription: string
}

// GET api/members/[memberId]
export type MemberDetailResponseDtoType = {
  memberBasicResponseDto: MemberBasicDtoType
  memberCareerResponseDto: MemberCareerDtoType
  memberEtcResponseDto: MemberEtcDtoType
  memberOfficeResponseDto: MemberOfficeDtoType
  memberPrivacyResponseDto: MemberPrivacyDtoType
}
export interface MemberBasicDtoType {
  companyName: string
  email: string
  memberId: number
  memberStatus: string
  memberStatusDescription: string
  name: string
  note: string
  role: string
  roleDescription: string
  storedFileName: string | null
  version: number
}
export interface MemberCareerDtoType {
  grade: string
  gradeDescription: string
  industryOtherMonth: number
  industrySameMonth: number
  jobField: string
  licenseName1: string
  licenseName2: string
  version: number
}
export interface MemberEtcDtoType {
  employedType: string
  incomeTaxReducedBeginDate: string
  incomeTaxReducedEndDate: string
  militaryPeriod: string
  newMiddleAgedJobs: string
  seniorInternship: string
  youthDigital: string
  youthEmploymentIncentive: string
  youthJobLeap: string
  version: number
}
export interface MemberOfficeDtoType {
  apprentice: string
  contractType: string
  contractTypeDescription: string
  contractYn: string
  fieldworkYn: string
  groupInsuranceYn: string
  insuranceAcquisitionDate: string
  insuranceLostDate: string | null
  joinDate: string
  laborForm: string
  laborFormDescription: string
  officeDepartmentId: number
  officeDepartmentName: string
  officePosition: string
  officePositionDescription: string
  resignDate: string | null
  staffCardYn: string
  staffNum: string
  version: number
  workForm: string
  workFormDescription: string
}
export interface MemberPrivacyDtoType {
  roadAddress: string | null
  detailAddress: string | null
  bankName: string
  bankNumber: string
  birthday: string
  carNumber: string
  carYn: string
  educationLevel: string
  educationMajor: string
  emerNum1: string
  emerNum2: string
  familyCnt: number
  foreignYn: string
  juminNum: string
  phoneNumber: string
  religion: string
  version: number
}

export type MemberLookupResponseDtoType = {
  memberId: number
  email: string
  name: string
}

// 직원관리 필터
export interface MemberFilterType {
  companyName: string
  officeDepartmentName: string
  officePosition: string
  memberStatus: string
  careerYear: string
  contractType: string
  laborForm: string
  workForm: string
  gender: string
  foreignYn: string
}

// ----------- 기계설비현장 -----------
// POST api/machine-projects
export interface MachineProjectCreateRequestDtoType {
  companyName: string
  machineProjectName: string
  beginDate: string
  endDate: string
  fieldBeginDate: string
  fieldEndDate: string
  note: string
}

// GET api/machine-projects (리스트)
export interface MachineProjectPageDtoType {
  machineProjectId: number
  version: number
  projectStatusDescription: string
  region: string
  machineProjectName: string
  fieldBeginDate: string
  fieldEndDate: string
  reportDeadline: string
  inspectionCount: number
  companyName: string
  grossArea: number
  tel: string
  engineerNames: string[]
}

// GET api/machine-projects/[machineProjectId] : 현장정보 조회
export type MachineProjectResponseDtoType = {
  roadAddress: string | null
  detailAddress: string | null
  bizno: string | null
  completeDate: string | null
  contractDate: string | null
  contractManager: string | null
  contractManagerEmail: string | null
  contractManagerTel: string | null
  contractPartner: string | null
  contractPartnerEmail: string | null
  contractPartnerTel: string | null
  contractPrice: number | null
  companyName: string | null
  grossArea: number | null
  houseCnt: number | null
  institutionName: string | null
  machineProjectName: string
  machineMaintainer1Info: string | null
  machineMaintainer1Name: string | null
  machineMaintainer2Info: string | null
  machineMaintainer2Name: string | null
  machineMaintainer3Info: string | null
  machineMaintainer3Name: string | null
  machineManager1Info: string | null
  machineManager1Name: string | null
  machineManager2Info: string | null
  machineManager2Name: string | null
  machineManager3Info: string | null
  machineManager3Name: string | null
  manager: string | null
  managerPhone: string | null
  projectStatus: string | null
  projectStatusDescription: string | null
  purpose: string | null
  representative: string | null
  requirement: string | null
  structure: string | null
  tel: string | null
  vatIncludedYn: string | null
  version: number | null
  note: string | null
}

// GET /api/machine-projects/{machineProjectId}/schedule-tab : 일정 및 기술진 DTO
export type MachineProjectScheduleAndEngineerResponseDtoType = {
  machineProjectScheduleId: number
  version: number
  beginDate: string
  endDate: string
  fieldBeginDate: string
  fieldEndDate: string
  reportDeadline: string
  projectEndDate: string
  checkType: string
  checkTypeDescription: string
  buildingGrade: string
  buildingGradeDescription: string
  reportManagerEmail: string
  tiIssueDate: string
  engineers: machineProjectEngineerDetailDtoType[]
}

// 엔지니어 정보
export interface machineProjectEngineerDetailDtoType {
  engineerId: number
  engineerName: string
  grade: string
  gradeDescription: string
  engineerLicenseNum: string
  beginDate: string
  endDate: string
  note: string
}

// 기계설비현장 필터
export interface MachineFilterType {
  projectStatus: string
  companyName: string
  engineerName: string
}

// PUT api/machine-projects-[id]/machine-project-engineers 기계설비 프로젝트 참여 기술진 수정 요청 DTO
export interface MachineProjectEngineerUpdateRequestDtoType {
  engineerId: number
  beginDate: string
  endDate: string
  note: string
}

// ----------- Engineer 관련 API -----------
// api/engineers/options
export interface MachineEngineerOptionListResponseDtoType {
  engineers: MachineEngineerOptionResponseDtoType[]
}

export interface MachineEngineerOptionResponseDtoType {
  engineerId: number
  engineerName: string
  gradeDescription: string
  engineerLicenseNum: string
  officePositionDescription: string
}

// GET api/engineers
export interface MachineEngineerPageResponseDtoType {
  engineerId: number
  version: number
  companyName: string
  name: string
  officeDepartmentName: string
  officePositionDescription: string
  engineerLicenseNum: string
  email: string
  phoneNumber: string
  workStatusDescription: string
  projectCnt: number
  remark: string
  latestProjectId: number
  latestProjectName: string
  latestProjectBeginDate: string
  latestProjectEndDate: string
  gradeDescription: string
}

// GET api/engineers/[engineerId] :기계설비 인력 조회 응답 DTO
export interface EngineerResponseDtoType {
  id: number
  version: number
  name: string
  email: string
  phoneNumber: string
  grade: string
  engineerLicenseNum: string
  remark: string
}

// PUT api/engineers/[engineerId]
export interface EngineerUpdateRequestDtoType {
  version: number
  name: string
  grade: string
  engineerLicenseNum: string
  remark: string
}

// POST api/engineers
export interface MachineEngineerCreateRequestDtoType {
  memberId: number
  grade: string
  engineerLicenseNum: string
  remark: string
}

// 설비인력 필터
export interface EngineerFilterType {
  companyName: string
  grade: string
  workStatus: string
}

// ----------- 설비목록 -----------
// GET inspections simple
export interface MachineInspectionSimpleResponseDtoType {
  id: number
  name: string
}

// GET api/machine-projects/{machineProjectId}/machine-inspections: 점검 설비 리스트 조회 (설비 목록 조회)
export interface MachineInspectionPageResponseDtoType {
  machineInspectionId: number
  version: number
  machineParentCateName: string
  machinePicCount: number
  machineInspectionName: string
  purpose: string
  location: string
  checkDate: string
  inspectionStatus: string
  engineerNames: string[]
}

// GET api/machine-projects/{machineProjectId}/machine-inspections/{machineInspectionId}: 점검 설비 상세 응답 DTO
export interface MachineInspectionDetailResponseDtoType {
  checklistExtensionType:
    | 'NONE'
    | 'GAS_MEASUREMENT'
    | 'WIND_MEASUREMENT'
    | 'WIND_MEASUREMENT_SA_RA'
    | 'PIPE_MEASUREMENT'
  machineInspectionResponseDto: MachineInspectionResponseDtoType
  engineerIds: number[]
  machineChecklistItemsWithPicCountResponseDtos: MachineChecklistItemsWithPicCountResponseDtosType[]
  gasMeasurementResponseDto: GasMeasurementResponseDtoType
  pipeMeasurementResponseDtos: PipeMeasurementResponseDtoType[]
  windMeasurementResponseDtos: WindMeasurementResponseDtoType[]
}

export type equipmentPhaseType = 'INSTALL' | 'MANUFACTURE' | 'USE'

// 점검 설비 기본 정보 응답 DTO
export interface MachineInspectionResponseDtoType {
  version: number
  id: number
  machineInspectionName: string
  machineCategoryId: number
  machineCategoryName: string
  purpose: string
  location: string
  equipmentPhase: equipmentPhaseType | null
  equipmentPhaseDate: string
  checkDate: string
  remark: string
}

// 점검 항목 + 사진 개수 등의 정보 목록
export interface MachineChecklistItemsWithPicCountResponseDtosType {
  machineChecklistItemId: number
  machineChecklistItemName: string
  checklistSubItems: MachineChecklistSubItemWithPicCountResponseDtoMachineChecklistSubItemWithPicCountResponseDtoType[]
  totalMachinePicCount: number
  machineInspectionChecklistItemResultBasicResponseDto: MachineInspectionChecklistItemResultBasicResponseDtoType
}

// 점검 결과 수정 요청 DTO
export type MachineInspectionChecklistItemResultUpdateRequestDtoType =
  MachineInspectionChecklistItemResultBasicResponseDtoType

export interface MachineInspectionChecklistItemResultBasicResponseDtoType {
  id: number
  version: number
  inspectionResult: string
  deficiencies: string | null
  actionRequired: string | null
}

// 점검 항목의 하위 항목 및 사진 개수 응답 DTO
export interface MachineChecklistSubItemWithPicCountResponseDtoMachineChecklistSubItemWithPicCountResponseDtoType {
  machineChecklistSubItemId: number
  checklistSubItemName: string
  machinePicCount: number
}

// 가스 측정값 응답 DTO
export interface GasMeasurementResponseDtoType {
  version: number
  fuelType: string
  capacity: string
  o2: string
  co: string
  eff: string
  xair: string
  co2Ratio: string
  no: string
  nox: string
  standardUsage: string
  startTime: string
  startMeterValue: string
  endTime: string
  endMeterValue: string
}

// 배관 측정 응답 DTO
export interface PipeMeasurementResponseDtoType {
  pipeMeasurementId: number
  version: number
  pipeType: string
  pipePosition: string
  outerDiameter: string
  nominalThickness: string
  measuredThickness1: string
  measuredThickness2: string
  measuredThickness3: string
  measuredThickness4: string
  measuredThickness5: string
}

// 풍량 측정 응답 DTO
export interface WindMeasurementResponseDtoType {
  windMeasurementId: number
  version: number
  fanType: string
  designAirVolumeCMM: string
  designFrequency: string
  designRpm: string
  designPoles: string
  horizontal: string
  vertical: string
  measurementBasis: string
  frequency: string
  topFront: string
  topCenter: string
  topRear: string
  midFront: string
  midCenter: string
  midRear: string
  bottomFront: string
  bottomCenter: string
  bottomRear: string
}

// 점검자 정보 응답 DTO
export interface MachineEngineerInfoResponseDtoType {
  machineInspectionId: number
  machineEngineerId: number
  machineEngineerName: string
}

export interface MachineInspectionFilterType {
  engineerName: string
}

// GET /api/machine-projects/{machineProjectId}/machine-inspections/{machineInspectionId}/machine-inspection-checklist-item-results
// 점검 항목 결과 응답 DTO
export interface MachineInspectionChecklistItemResultResponseDtoType {
  id: number
  version: number
  deficiencies: string | null
  actionRequired: string | null
}

// POST 설비추가 형식
export interface MachineInspectionCreateRequestDtoType {
  machineCategoryId: number
  purpose: string
  location: string
  cnt: number
}

// MachineCategory
// GET /api/machine-categories 기계설비 카테고리 전체 조회
export interface MachineCategoryResponseDtoType {
  id: number
  parentId: number
  name: string
}

// GET /api/machine-categories/leaf
export interface MachineLeafCategoryResponseDtoType {
  id: number
  name: string
}

export interface MachineInspectionRootCategoryResponseDtoType {
  machineCategoryId: number
  machineCategoryName: string
}

// ----------- 보고서 관련 -----------
export interface MachineEnergyTypeResponseDtoType {
  machineEnergyTypeId: number
  name: string
}

export interface targetType {
  name: string
  machineEnergyTargetId: number
}

export interface MachineEnergyUsageReadResponseDtoType {
  targetId: number
  year: number
  monthlyValues: string
}

type reportStatusType = 'PENDING' | 'COMPLETED' | 'FAILED'

// GET /api/machine-projects/{machineProjectId}/machine-reports/status 보고서 상태 다건 조회
export interface MachineReportStatusResponseDtoType {
  machineReportCategoryId: number
  machineCategoryId: number | null
  latestMachineReportId: number
  reportStatus: reportStatusType
  updatedAt: string
  fileName: string
}

// GET /api/machine-projects/{machineProjectId}/machine-reports/machine-report-categories/status 카테고리별 보고서 상태 조회
export interface MachineReportCategoryDetailResponseDtoType {
  machineReportCategoryId: number
  reports: MachineReportSimpleResponseDtoType[]
  latestStatus: reportStatusType
  latestReportId: number
  completedCount: number
}

export interface MachineReportSimpleResponseDtoType {
  id: number
  reportStatus: StatusType
  updatedAt: string
  fileName: string
}

// 기계설비 보고서 카테고리 응답 DTO
export interface MachineReportCategoryReadResponseDtoType {
  id: number
  name: string
  reportTemplateCode: string
}

// 점검의견서 조회 응답 DTO

export interface machineInspectionSummaryResponseDtoType {
  machineInspectionSummaryResponseDto: {
    summaryElements: {
      machineTopCategoryName: string
      inspectionResult: 'PASS' | 'FAIL' | 'NONE'
      actionRequired: Record<string, string>
    }[]
  }
  inspectionResultOverallOpinion: string
  performanceInspectionReportResult: string
}

// ----------- presignedURL 관련 -----------

// POST /api/machine-projects/{machineProjectId}/machine-pics 프로젝트 내 전체 사진 조회 (Presigned URL 포함)
export interface MachinePicPresignedUrlResponseDtoType {
  machineInspectionId: number
  machineInspectionName: string
  machinePicId: number
  version: number
  machineCategoryId: number
  machineChecklistItemId: number
  machineChecklistSubItemId: number
  machineCategoryName: string
  machineChecklistItemName: string
  machineChecklistSubItemName: string
  originalFileName: string
  measuredValue: string
  alternativeSubTitle: string
  s3Key: string
  presignedUrl: string
  remark: string
}

// ----------- 무한스크롤 사진 관련 -----------
// 무한스크롤 커서 정보 (사진 조회용)
export interface MachinePicCursorType {
  lastMachineCateSortOrder: number
  lastMachinePicCateSortOrder: number
  lastMachineChecklistSubItemSortOrder: number
  lastMachineInspectionId: number
  lastMachinePicId: number
}

// PUT /api/machine-projects/{machineProjectId}/machine-inspections/{machineInspectionId}/machine-pics/{machinePicId}
export interface MachinePicUpdateResponseDtoType {
  machineInspectionId: number
  machinePicId: number
  version: number
  machineChecklistSubItemId: number
  originalFileName: string
  s3Key: string
  cdnPath: string
  alternativeSubTitle: string
  measuredValue: string
  remark: string
}

// ----------- machineProject Pic 관련 -------------
export type ProjectPicType = 'OVERVIEW' | 'LOCATION_MAP' | 'ETC'

// GET /api/machine-projects/{machineProjectId}/machine-project-pics/overview
// GET /api/machine-projects/{machineProjectId}/machine-project-pics

export interface MachineProjectPicReadResponseDtoType {
  id: number
  version: number
  originalFileName: string
  machineProjectPicType: ProjectPicType
  presignedUrl: string
  remark: string
}

// PUT /api/machine-projects/{machineProjectId}/machine-project-pics/{machineProjectPicId}
export interface MachineProjectPicUpdateRequestDtoType {
  version: number
  originalFileName: string
  s3Key: string
  machineProjectPicType: ProjectPicType
  remark: string
}

// ----------- 라이선스 -----------
// api/licenses 라이선스 목록 조회 응답 DTO
export interface LicensePageResponseDtoType {
  licenseId: number
  version: number
  region: string
  bizno: string
  companyName: string
  ceoName: string
  memberCount: number
  machineEngineerCount: number
  safetyEngineerCount: number
  managerName: string
  managerEmail: string
  managerPhoneNumber: string
  tel: string
  contractDate: string
  expireDate: string
}

// GET api/licenses/[licenseId] : 라이선스 단건 조회 응답 DTO
// POST api/licneses : 라이선스 등록
export interface LicenseResponseDtoType {
  id: number
  version: number
  companyName: string
  companyNameAbbr: string
  bizno: string
  ceoName: string
  managerName: string
  managerPhoneNumber: string
  managerEmail: string
  taxEmail: string
  homepageAddr: string
  tel: string
  fax: string
  roadAddress: string
  jibunAddress: string
  detailAddress: string
  businessType: string
  businessCategory: string
  contractDate: string
  expireDate: string
  remark: string
}

export interface LicenseCreateRequestDto {
  companyName: string
  companyNameAbbr: string
  bizno: string
  ceoName: string
  managerName: string
  managerPhoneNumber: string
  managerEmail: string
  taxEmail: string
  homepageAddr: string
  tel: string
  fax: string
  roadAddress: string
  jibunAddress: string
  detailAddress: string
  businessType: string
  businessCategory: string
  contractDate: string
  expireDate: string
  remark: string
}

// ----------- 성능점검시 검토사항 -----------
// GET /api/machine-projects/{machineProjectId}/machine-performance-review/result-summary 결과요약
export interface MachinePerformanceReviewSummaryResponseDtoType {
  maintenanceGuidelineAdequacy: string
  systemOperationalStatus: string
  designAndMeasuredValueConsistency: string
  equipmentAgingDegree: string
  inspectionDeficiencies: string
  improvementNeedsAndPlan: string
  energyUsageByType: string
  energyEfficiencyOperationMethod: string
}

export type planYearType = 'INSPECTION' | 'REPLACEMENT' | 'REPAIR' | 'INSTALLATION' | 'NONE'
export type resultType = 'PASS' | 'FAIL' | 'NONE'

// GET /api/machine-projects/{machineProjectId}/machine-performance-review/yearly-plan 연도별 계획
export interface MachinePerformanceReviewYearlyPlanResponseDtoType {
  refrigeratorResult: resultType
  refrigeratorDeficiency: string
  refrigeratorPlanYear1: planYearType
  refrigeratorPlanYear2: planYearType
  refrigeratorPlanYear3: planYearType
  refrigeratorPlanYear4: planYearType
  refrigeratorPlanYear5: planYearType
  coolingTowerResult: resultType
  coolingTowerDeficiency: string
  coolingTowerPlanYear1: planYearType
  coolingTowerPlanYear2: planYearType
  coolingTowerPlanYear3: planYearType
  coolingTowerPlanYear4: planYearType
  coolingTowerPlanYear5: planYearType
  thermalStorageResult: resultType
  thermalStorageDeficiency: string
  thermalStoragePlanYear1: planYearType
  thermalStoragePlanYear2: planYearType
  thermalStoragePlanYear3: planYearType
  thermalStoragePlanYear4: planYearType
  thermalStoragePlanYear5: planYearType
  boilerResult: resultType
  boilerDeficiency: string
  boilerPlanYear1: planYearType
  boilerPlanYear2: planYearType
  boilerPlanYear3: planYearType
  boilerPlanYear4: planYearType
  boilerPlanYear5: planYearType
  heatExchangerResult: resultType
  heatExchangerDeficiency: string
  heatExchangerPlanYear1: planYearType
  heatExchangerPlanYear2: planYearType
  heatExchangerPlanYear3: planYearType
  heatExchangerPlanYear4: planYearType
  heatExchangerPlanYear5: planYearType
  expansionTankResult: resultType
  expansionTankDeficiency: string
  expansionTankPlanYear1: planYearType
  expansionTankPlanYear2: planYearType
  expansionTankPlanYear3: planYearType
  expansionTankPlanYear4: planYearType
  expansionTankPlanYear5: planYearType
  pumpResult: resultType
  pumpDeficiency: string
  pumpPlanYear1: planYearType
  pumpPlanYear2: planYearType
  pumpPlanYear3: planYearType
  pumpPlanYear4: planYearType
  pumpPlanYear5: planYearType
  renewableEnergySystemResult: resultType
  renewableEnergySystemDeficiency: string
  renewableEnergySystemPlanYear1: planYearType
  renewableEnergySystemPlanYear2: planYearType
  renewableEnergySystemPlanYear3: planYearType
  renewableEnergySystemPlanYear4: planYearType
  renewableEnergySystemPlanYear5: planYearType
  packageAirConditionerResult: resultType
  packageAirConditionerDeficiency: string
  packageAirConditionerPlanYear1: planYearType
  packageAirConditionerPlanYear2: planYearType
  packageAirConditionerPlanYear3: planYearType
  packageAirConditionerPlanYear4: planYearType
  packageAirConditionerPlanYear5: planYearType
  precisionAirConditionerResult: resultType
  precisionAirConditionerDeficiency: string
  precisionAirConditionerPlanYear1: planYearType
  precisionAirConditionerPlanYear2: planYearType
  precisionAirConditionerPlanYear3: planYearType
  precisionAirConditionerPlanYear4: planYearType
  precisionAirConditionerPlanYear5: planYearType
  airHandlingUnitResult: resultType
  airHandlingUnitDeficiency: string
  airHandlingUnitPlanYear1: planYearType
  airHandlingUnitPlanYear2: planYearType
  airHandlingUnitPlanYear3: planYearType
  airHandlingUnitPlanYear4: planYearType
  airHandlingUnitPlanYear5: planYearType
  fanCoilUnitResult: resultType
  fanCoilUnitDeficiency: string
  fanCoilUnitPlanYear1: planYearType
  fanCoilUnitPlanYear2: planYearType
  fanCoilUnitPlanYear3: planYearType
  fanCoilUnitPlanYear4: planYearType
  fanCoilUnitPlanYear5: planYearType
  ventilationSystemResult: resultType
  ventilationSystemDeficiency: string
  ventilationSystemPlanYear1: planYearType
  ventilationSystemPlanYear2: planYearType
  ventilationSystemPlanYear3: planYearType
  ventilationSystemPlanYear4: planYearType
  ventilationSystemPlanYear5: planYearType
  filterResult: resultType
  filterDeficiency: string
  filterPlanYear1: planYearType
  filterPlanYear2: planYearType
  filterPlanYear3: planYearType
  filterPlanYear4: planYearType
  filterPlanYear5: planYearType
  sanitaryFacilityResult: resultType
  sanitaryFacilityDeficiency: string
  sanitaryFacilityPlanYear1: planYearType
  sanitaryFacilityPlanYear2: planYearType
  sanitaryFacilityPlanYear3: planYearType
  sanitaryFacilityPlanYear4: planYearType
  sanitaryFacilityPlanYear5: planYearType
  hotWaterSupplyResult: resultType
  hotWaterSupplyDeficiency: string
  hotWaterSupplyPlanYear1: planYearType
  hotWaterSupplyPlanYear2: planYearType
  hotWaterSupplyPlanYear3: planYearType
  hotWaterSupplyPlanYear4: planYearType
  hotWaterSupplyPlanYear5: planYearType
  waterTankResult: resultType
  waterTankDeficiency: string
  waterTankPlanYear1: planYearType
  waterTankPlanYear2: planYearType
  waterTankPlanYear3: planYearType
  waterTankPlanYear4: planYearType
  waterTankPlanYear5: planYearType
  drainageResult: resultType
  drainageDeficiency: string
  drainagePlanYear1: planYearType
  drainagePlanYear2: planYearType
  drainagePlanYear3: planYearType
  drainagePlanYear4: planYearType
  drainagePlanYear5: planYearType
  sewageTreatmentResult: resultType
  sewageTreatmentDeficiency: string
  sewageTreatmentPlanYear1: planYearType
  sewageTreatmentPlanYear2: planYearType
  sewageTreatmentPlanYear3: planYearType
  sewageTreatmentPlanYear4: planYearType
  sewageTreatmentPlanYear5: planYearType
  waterReuseResult: resultType
  waterReuseDeficiency: string
  waterReusePlanYear1: planYearType
  waterReusePlanYear2: planYearType
  waterReusePlanYear3: planYearType
  waterReusePlanYear4: planYearType
  waterReusePlanYear5: planYearType
  pipeLineResult: resultType
  pipeLineDeficiency: string
  pipeLinePlanYear1: planYearType
  pipeLinePlanYear2: planYearType
  pipeLinePlanYear3: planYearType
  pipeLinePlanYear4: planYearType
  pipeLinePlanYear5: planYearType
  ductResult: resultType
  ductDeficiency: string
  ductPlanYear1: planYearType
  ductPlanYear2: planYearType
  ductPlanYear3: planYearType
  ductPlanYear4: planYearType
  ductPlanYear5: planYearType
  insulationResult: resultType
  insulationDeficiency: string
  insulationPlanYear1: planYearType
  insulationPlanYear2: planYearType
  insulationPlanYear3: planYearType
  insulationPlanYear4: planYearType
  insulationPlanYear5: planYearType
  automaticControlResult: resultType
  automaticControlDeficiency: string
  automaticControlPlanYear1: planYearType
  automaticControlPlanYear2: planYearType
  automaticControlPlanYear3: planYearType
  automaticControlPlanYear4: planYearType
  automaticControlPlanYear5: planYearType
  noiseVibrationSeismicResult: resultType
  noiseVibrationSeismicDeficiency: string
  noiseVibrationSeismicPlanYear1: planYearType
  noiseVibrationSeismicPlanYear2: planYearType
  noiseVibrationSeismicPlanYear3: planYearType
  noiseVibrationSeismicPlanYear4: planYearType
  noiseVibrationSeismicPlanYear5: planYearType
  note: string
}

// GET /api/machine-projects/{machineProjectId}/machine-performance-review/operation-status 작동상태
export interface MachinePerformanceReviewOperationStatusResponseDtoType {
  refrigeratorResult: resultType
  refrigeratorRemark: string
  coolingTowerResult: resultType
  coolingTowerRemark: string
  thermalStorageResult: resultType
  thermalStorageRemark: string
  boilerResult: resultType
  boilerRemark: string
  heatExchangerResult: resultType
  heatExchangerRemark: string
  expansionTankResult: resultType
  expansionTankRemark: string
  pumpResult: resultType
  pumpRemark: string
  renewableEnergySystemResult: resultType
  renewableEnergySystemRemark: string
  packageAirConditionerResult: resultType
  packageAirConditionerRemark: string
  precisionAirConditionerResult: resultType
  precisionAirConditionerRemark: string
  airHandlingUnitResult: resultType
  airHandlingUnitRemark: string
  fanCoilUnitResult: resultType
  fanCoilUnitRemark: string
  ventilationSystemResult: resultType
  ventilationSystemRemark: string
  filterResult: resultType
  filterRemark: string
  sanitaryFacilityResult: resultType
  sanitaryFacilityRemark: string
  hotWaterSupplyResult: resultType
  hotWaterSupplyRemark: string
  waterTankResult: resultType
  waterTankRemark: string
  drainageResult: resultType
  drainageRemark: string
  sewageTreatmentResult: resultType
  sewageTreatmentRemark: string
  waterReuseResult: resultType
  waterReuseRemark: string
  pipeLineResult: resultType
  pipeLineRemark: string
  ductResult: resultType
  ductRemark: string
  insulationResult: resultType
  insulationRemark: string
  automaticControlResult: resultType
  automaticControlRemark: string
  noiseVibrationSeismicResult: resultType
  noiseVibrationSeismicRemark: string
  opinion: string
}

export type matchResultType = 'MATCH' | 'MISMATCH' | 'NONE'

// GET /api/machine-projects/{machineProjectId}/machine-performance-review/measurement 측정값 일치
export interface MachinePerformanceReviewMeasurementResponseDtoType {
  refrigeratorResult: matchResultType
  refrigeratorRemark: string
  coolingTowerResult: matchResultType
  coolingTowerRemark: string
  thermalStorageResult: matchResultType
  thermalStorageRemark: string
  boilerResult: matchResultType
  boilerRemark: string
  heatExchangerResult: matchResultType
  heatExchangerRemark: string
  expansionTankResult: matchResultType
  expansionTankRemark: string
  pumpResult: matchResultType
  pumpRemark: string
  renewableEnergySystemResult: matchResultType
  renewableEnergySystemRemark: string
  packageAirConditionerResult: matchResultType
  packageAirConditionerRemark: string
  precisionAirConditionerResult: matchResultType
  precisionAirConditionerRemark: string
  airHandlingUnitResult: matchResultType
  airHandlingUnitRemark: string
  fanCoilUnitResult: matchResultType
  fanCoilUnitRemark: string
  ventilationSystemResult: matchResultType
  ventilationSystemRemark: string
  filterResult: matchResultType
  filterRemark: string
  sanitaryFacilityResult: matchResultType
  sanitaryFacilityRemark: string
  hotWaterSupplyResult: matchResultType
  hotWaterSupplyRemark: string
  waterTankResult: matchResultType
  waterTankRemark: string
  drainageResult: matchResultType
  drainageRemark: string
  sewageTreatmentResult: matchResultType
  sewageTreatmentRemark: string
  waterReuseResult: matchResultType
  waterReuseRemark: string
  pipeLineResult: matchResultType
  pipeLineRemark: string
  ductResult: matchResultType
  ductRemark: string
  insulationResult: matchResultType
  insulationRemark: string
  automaticControlResult: matchResultType
  automaticControlRemark: string
  noiseVibrationSeismicResult: matchResultType
  noiseVibrationSeismicRemark: string
  opinion: string
}

// GET /api/machine-projects/{machineProjectId}/machine-performance-review/improvement 개선사항
export interface MachinePerformanceReviewImprovementResponseDtoType {
  refrigeratorResult: resultType
  refrigeratorDeficiency: string
  refrigeratorImprovement: string
  coolingTowerResult: resultType
  coolingTowerDeficiency: string
  coolingTowerImprovement: string
  thermalStorageResult: resultType
  thermalStorageDeficiency: string
  thermalStorageImprovement: string
  boilerResult: resultType
  boilerDeficiency: string
  boilerImprovement: string
  heatExchangerResult: resultType
  heatExchangerDeficiency: string
  heatExchangerImprovement: string
  expansionTankResult: resultType
  expansionTankDeficiency: string
  expansionTankImprovement: string
  pumpResult: resultType
  pumpDeficiency: string
  pumpImprovement: string
  renewableEnergySystemResult: resultType
  renewableEnergySystemDeficiency: string
  renewableEnergySystemImprovement: string
  packageAirConditionerResult: resultType
  packageAirConditionerDeficiency: string
  packageAirConditionerImprovement: string
  precisionAirConditionerResult: resultType
  precisionAirConditionerDeficiency: string
  precisionAirConditionerImprovement: string
  airHandlingUnitResult: resultType
  airHandlingUnitDeficiency: string
  airHandlingUnitImprovement: string
  fanCoilUnitResult: resultType
  fanCoilUnitDeficiency: string
  fanCoilUnitImprovement: string
  ventilationSystemResult: resultType
  ventilationSystemDeficiency: string
  ventilationSystemImprovement: string
  filterResult: resultType
  filterDeficiency: string
  filterImprovement: string
  sanitaryFacilityResult: resultType
  sanitaryFacilityDeficiency: string
  sanitaryFacilityImprovement: string
  hotWaterSupplyResult: resultType
  hotWaterSupplyDeficiency: string
  hotWaterSupplyImprovement: string
  waterTankResult: resultType
  waterTankDeficiency: string
  waterTankImprovement: string
  drainageResult: resultType
  drainageDeficiency: string
  drainageImprovement: string
  sewageTreatmentResult: resultType
  sewageTreatmentDeficiency: string
  sewageTreatmentImprovement: string
  waterReuseResult: resultType
  waterReuseDeficiency: string
  waterReuseImprovement: string
  pipeLineResult: resultType
  pipeLineDeficiency: string
  pipeLineImprovement: string
  ductResult: resultType
  ductDeficiency: string
  ductImprovement: string
  insulationResult: resultType
  insulationDeficiency: string
  insulationImprovement: string
  automaticControlResult: resultType
  automaticControlDeficiency: string
  automaticControlImprovement: string
  noiseVibrationSeismicResult: resultType
  noiseVibrationSeismicDeficiency: string
  noiseVibrationSeismicImprovement: string
  note: string
}

export type ynResultType = 'Y' | 'N'

// GET /api/machine-projects/{machineProjectId}/machine-performance-review/guide 검토가이드
export interface MachinePerformanceReviewGuideResponseDtoType {
  builtDrawingYn: ynResultType
  specificationYn: ynResultType
  loadCalculationYn: ynResultType
  operationManual: ynResultType
  manufacturerCertificateYn: ynResultType
  techStandardForm3Yn: ynResultType
  techStandardForm4Yn: ynResultType
  techStandardForm5Yn: ynResultType
  techStandardForm6Yn: ynResultType
}

export interface MachinePerformanceReviewAgingItemResponseDtoType {
  machineRootCategoryName: string
  systemName: string
  durableYearProcurement: number
  durableYearRealEstate: number
  usedYear: number
  remark: string
}

export type agingStandardType = 'KOREA_REAL_ESTATE_BOARD' | 'PUBLIC_PROCUREMENT_SERVICE'
export interface MachinePerformanceReviewAgingReadResponseDtoType {
  agingEquipments: MachinePerformanceReviewAgingItemResponseDtoType[]
  agingStandard: agingStandardType
  agingInspectionResult: string
}

export interface MachinePerformanceReviewAgingUpdateResponseDtoType {
  agingStandard: agingStandardType
  agingInspectionResult: string
}

// ----------- 로그인 -----------
// POST /api/auth/web/login
export interface LoginResponseDtoType {
  tokenResponseDto: TokenResponseDto
  loginMemberResponseDto: {
    memberId: number
    name: string
  }
}

// JWT 토큰 발급 DTO
export interface TokenResponseDto {
  tokenType: string
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
  refreshTokenExpiresIn: number
}

// ----------- 공통 -----------
// 성공 반환 데이터
export interface successResponseDtoType<T> {
  content: T
  page: PageInfoDtoType
}

// page
export interface PageInfoDtoType {
  size: number
  number: number
  totalElements: number
  totalPages: number
}

// 인풋 형식
export type InputFieldType = {
  size?: BoxSizeType
  type: InputType
  label: string
  options?: Array<{ value: string; label: string }>
  disabled?: boolean
}

// 테이블 헤더
export interface HeaderInfoType {
  label: string
  canSort: boolean
  hideOnTablet: boolean
}

export type HeaderType<T> = Record<keyof T, HeaderInfoType>

// 테이블 정렬
export type SortType = '' | 'asc' | 'desc'

export type SortInfoType<T> = Record<'target', keyof T | ''> & Record<'sort', SortType>

// 모달 Box 사이징, 입력 타입
export type BoxSizeType = 'sm' | 'md' | 'lg'
export type InputType = 'multi' | 'yn' | 'text' | 'number' | 'date' | 'long text' | 'juminNum' | 'map'
