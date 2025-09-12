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
export type machineInputType = Partial<Record<keyof machineProjectResponseDtoType, InputFieldType>>

// machine-projects/[id]/schedule_tab 인풋 정보 형식
export type machineScheduleInputType = Partial<Record<keyof MachineProjectScheduleAndEngineerDtoType, InputFieldType>>

// engineers/[id] 인풋 정보 형식
export type engineerInputType = Partial<Record<keyof EngineerResponseDtoType, InputFieldType>>

// licenses/[id] 인풋 정보 형식
export type licenseInputType = Partial<Record<keyof LicenseResponseDtoType, InputFieldType>>

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

export type memberLookupResponseDtoType = {
  memberId: number
  email: string
  name: string
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
export interface MachineProjectPageDtoType {
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

// GET api/machine-projects/[machineProjectId] : 현장정보 조회
export type machineProjectResponseDtoType = {
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

// GET /api/machine-projects/{machineProjectId}/schedule-tab : 일정 및 기술진 DTO
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

// GET api/engineers
export interface MachineEngineerPageResponseDtoType {
  engineerId: number
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

// ----------- 라이선스 -----------
// api/licenses 라이선스 목록 조회 응답 DTO
export interface LicensePageResponseDtoType {
  licenseId: number
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
}

export type HeaderType<T> = Record<keyof T, HeaderInfoType>

// 테이블 정렬
export type SortType = '' | 'asc' | 'desc'

export type SortInfoType<T> = Record<'target', keyof T | ''> & Record<'sort', SortType>

// 모달 Box 사이징, 입력 타입
export type BoxSizeType = 'sm' | 'md' | 'lg'
export type InputType = 'multi' | 'yn' | 'text' | 'number' | 'date' | 'long text' | 'juminNum' | 'map'
