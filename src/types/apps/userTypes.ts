// Type Imports
import type { ThemeColor } from '@core/types'

export type UsersType = {
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

  // 여기부터 기계설비
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
