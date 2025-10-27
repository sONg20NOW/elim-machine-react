// React Imports
import type { ReactNode } from 'react'

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
export type memberInputType = InputInfoType<TabType['member'], memberDetailDtoType>

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
export type memberDetailDtoType = {
  memberBasicResponseDto: memberBasicDtoType
  memberCareerResponseDto: memberCareerDtoType
  memberEtcResponseDto: memberEtcDtoType
  memberOfficeResponseDto: memberOfficeDtoType
  memberPrivacyResponseDto: memberPrivacyDtoType
}
interface memberBasicDtoType {
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
interface memberCareerDtoType {
  grade: string
  gradeDescription: string
  industryOtherMonth: number
  industrySameMonth: number
  jobField: string
  licenseName1: string
  licenseName2: string
  version: number
}
interface memberEtcDtoType {
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
interface memberOfficeDtoType {
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
export interface memberPrivacyDtoType {
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

export type memberLookupResponseDtoType = {
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
  machineChecklistItemsWithPicCountResponseDtos: machineChecklistItemsWithPicCountResponseDtosType[]
  gasMeasurementResponseDto: GasMeasurementResponseDtoType
  pipeMeasurementResponseDtos: PipeMeasurementResponseDtoType[]
  windMeasurementResponseDtos: WindMeasurementResponseDtoType[]
}

// 점검 설비 기본 정보 응답 DTO
export interface MachineInspectionResponseDtoType {
  version: number
  id: number
  machineInspectionName: string
  machineCategoryId: number
  machineCategoryName: string
  purpose: string
  location: string
  installedDate: string
  manufacturedDate: string
  usedDate: string
  checkDate: string
  remark: string
}

// 점검 항목 + 사진 개수 등의 정보 목록
export interface machineChecklistItemsWithPicCountResponseDtosType {
  machineChecklistItemId: number
  machineChecklistItemName: string
  checklistSubItems: MachineChecklistSubItemWithPicCountResponseDtoMachineChecklistSubItemWithPicCountResponseDtoType[]
  totalMachinePicCount: number
  machineInspectionChecklistItemResultBasicResponseDto: machineInspectionChecklistItemResultBasicResponseDtoType
}

export interface machineInspectionChecklistItemResultBasicResponseDtoType {
  id: number
  version: number
  inspectionResult: string
  deficiencies: string
  actionRequired: string
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

// ----------- presignedURL 관련 -----------

// POST /api/machine-projects/{machineProjectId}/machine-pics 프로젝트 내 전체 사진 조회 (Presigned URL 포함)
export interface MachinePicPresignedUrlResponseDtoType {
  machineInspectionId: number
  machineInspectionName: string
  machinePicId: number
  version: number
  machineCategoryId: number
  machineChecklistItemId: number | null
  machineChecklistSubItemId: number | null
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
// GET /api/machine-projects/{machineProjectId}/machine-project-pics/overview
export interface MachineProjectOverviewPicReadResponseDtoType {
  id: number
  version: number
  originalFileName: string
  machineProjectPicType: 'OVERVIEW' | 'LOCATION_MAP' | 'ETC'
  presignedUrl: string
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

// ----------- 로그인 -----------
// POST /api/auth/web/login
export interface LoginResponseDtoType {
  tokenResponseDto: TokenResponseDto
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
