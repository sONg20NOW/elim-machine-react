export type OldmemberDetailDtoType = {
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
