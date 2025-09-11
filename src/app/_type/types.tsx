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

// machine 인풋 정보 형식
export type machineInputType = InputInfoType<TabType['machine'], MachineProjectDetailDtoType>

// -------- 직원관리 --------
// POST api/members (필수: role)
export interface MemberCreateRequestDtoType {
  companyName: string
  name: string
  role: string
  memberStatus: string
  email: string
  note: string
}

// GET api/members (리스트)
export type memberPageDtoType = {
  memberId: number
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
  companyName?: string
  email?: string
  memberId?: number
  memberStatus?: string
  memberStatusDescription?: string
  name?: string
  note?: string
  role?: string
  roleDescription?: string
  storedFileName?: string | null
  version?: number
}
interface memberCareerDtoType {
  grade?: string
  gradeDescription?: string
  industryOtherMonth?: number
  industrySameMonth?: number
  jobField?: string
  licenseName1?: string
  licenseName2?: string
  version?: number
}
interface memberEtcDtoType {
  employedType?: string
  incomeTaxReducedBeginDate?: string
  incomeTaxReducedEndDate?: string
  militaryPeriod?: string
  newMiddleAgedJobs?: string
  seniorInternship?: string
  youthDigital?: string
  youthEmploymentIncentive?: string
  youthJobLeap?: string
  version?: number
}
interface memberOfficeDtoType {
  apprentice?: string
  contractType?: string
  contractTypeDescription?: string
  contractYn?: string
  fieldworkYn?: string
  groupInsuranceYn?: string
  insuranceAcquisitionDate?: string
  insuranceLostDate?: string | null
  joinDate?: string
  laborForm?: string
  laborFormDescription?: string
  officeDepartmentId?: number
  officeDepartmentName?: string
  officePosition?: string
  officePositionDescription?: string
  resignDate?: string | null
  staffCardYn?: string
  staffNum?: string
  version?: number
  workForm?: string
  workFormDescription?: string
}
export interface memberPrivacyDtoType {
  roadAddress?: string | null
  detailAddress?: string | null
  bankName?: string
  bankNumber?: string
  birthday?: string
  carNumber?: string
  carYn?: string
  educationLevel?: string
  educationMajor?: string
  emerNum1?: string
  emerNum2?: string
  familyCnt?: number
  foreignYn?: string
  juminNum?: string
  phoneNumber?: string
  religion?: string
  version?: number
}

// 직원관리 필터
export interface MemberFilterType {
  role: string
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
export interface machineProjectPageDtoType {
  machineProjectId: number
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

// GET api/machine-projects/[machineProjectId]
export type MachineProjectDetailDtoType = {
  machineProjectResponseDto: machineProjectDtoType
  machineProjectScheduleAndEngineerResponseDto: MachineProjectScheduleAndEngineerDtoType
}

// 관리 정보 DTO
export type machineProjectDtoType = {
  roadAddress?: string | null
  detailAddress?: string | null
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
  companyName?: string | null
  grossArea?: number | null
  houseCnt?: number | null
  institutionName?: string | null
  machineProjectName?: string | null
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
export type MachineProjectScheduleAndEngineerDtoType = {
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
  engineers: machineProjectEngineerDetailDtoType
}

// 엔지니어 정보
export interface machineProjectEngineerDetailDtoType {
  engineerId: number
  memberName: string
  grade: string
  gradeDescription: string
  licenseNum: string
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

// ----------- 공통 -----------
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
}

export type HeaderType<T> = Record<keyof T, HeaderInfoType>

// 테이블 정렬
export type SortType = '' | 'asc' | 'desc'

export type SortInfoType<T> = Record<'target', keyof T | ''> & Record<'sort', SortType>

// 모달 Box 사이징, 입력 타입
export type BoxSizeType = 'sm' | 'md' | 'lg'
export type InputType = 'multi' | 'yn' | 'text' | 'number' | 'date' | 'long text' | 'juminNum' | 'map'
