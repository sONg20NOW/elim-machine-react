// Type Imports
import type { ThemeColor } from '@core/types'

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

export type OldUsersType = {
  memberId: number
  role: string
  status: string
  avatar: string
  company: string
  country: string
  contact: string
  fullName: string
  username: string
  currentPlan: string
  avatarColor?: ThemeColor
  billing: string

  // 여기부터 직원관리
  auth: string
  roleDescription: string
  name: string
  officeDepartmentName: string
  companyName: string
  age: number
  email: string
  phoneNumber: string
  joinDate: string
  careerYear: number
  memberStatusDescription: string
  staffNum: string
  officePosition: string
  officePositionDescription: string
  memberEtcResponseDto: {
    militaryPeriod: string
  }
  isTechnician: string
  contractType: string
}

// userInfoTypes.ts
export type EditUserInfoData = {
  memberBasicResponseDto?: {
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
  memberCareerResponseDto?: {
    grade?: string
    gradeDescription?: string
    industryOtherMonth?: number
    industrySameMonth?: number
    jobField?: string
    licenseName1?: string
    licenseName2?: string
    version?: number
  }
  memberEtcResponseDto?: {
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
  memberOfficeResponseDto?: {
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
  memberPrivacyResponseDto?: {
    address?: {
      roadAddress?: string
      jibunAddress?: string | null
      detailAddress?: string
    }
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
}
