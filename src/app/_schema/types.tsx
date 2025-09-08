// Type Imports
// import type { ThemeColor } from '@core/types'
// export type OldmemberPageDtoType = {
//   memberId: number
//   role: string
//   status: string
//   avatar: string
//   company: string
//   country: string
//   contact: string
//   fullName: string
//   username: string
//   currentPlan: string
//   avatarColor?: ThemeColor
//   billing: string

//   // 여기부터 직원관리
//   auth: string
//   roleDescription: string
//   name: string
//   officeDepartmentName: string
//   companyName: string
//   age: number
//   email: string
//   phoneNumber: string
//   joinDate: string
//   careerYear: number
//   memberStatusDescription: string
//   staffNum: string
//   officePosition: string
//   officePositionDescription: string
//   memberEtcResponseDto: {
//     militaryPeriod: string
//   }
//   isTechnician: string
//   contractType: string
// }

// -------- 직원관리 타입 --------
// api/members
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

// api/members/[memberId]
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
  jibunAddress?: string | null
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

// 모달 Box 관련 타입
export type BoxSizeType = 'sm' | 'md' | 'lg'

export type InputType = 'multi' | 'yn' | 'text' | 'number' | 'date'

export type TabType = {
  employee: 'basic' | 'privacy' | 'office' | 'career' | 'etc'
}

// filter 관련 타입
export interface EmployeeFilterType {
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

// table header 관련 타입
export interface HeaderInfoType {
  label: string
  canSort: boolean
}

export type HeaderType<T> = Record<keyof T, HeaderInfoType>

export type SortType = '' | 'asc' | 'desc'

export type SortInfoType<T> = Record<'target', keyof T> & Record<'sort', SortType>
