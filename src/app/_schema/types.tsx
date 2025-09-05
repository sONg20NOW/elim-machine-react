// Type Imports
// import type { ThemeColor } from '@core/types'
// export type OldUsersType = {
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

// UserTypes.ts
export type UsersType = {
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
  isTechnician: string
}

// userInfoTypes.ts
interface memberBasicData {
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
interface memberCareerData {
  grade?: string
  gradeDescription?: string
  industryOtherMonth?: number
  industrySameMonth?: number
  jobField?: string
  licenseName1?: string
  licenseName2?: string
  version?: number
}
interface memberEtcData {
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
interface memberOfficeData {
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
export interface memberPrivacyData {
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

export type EditUserInfoData = {
  memberBasicResponseDto: memberBasicData
  memberCareerResponseDto: memberCareerData
  memberEtcResponseDto: memberEtcData
  memberOfficeResponseDto: memberOfficeData
  memberPrivacyResponseDto: memberPrivacyData
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
