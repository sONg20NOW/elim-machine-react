import type { memberDetailDtoType } from '@/app/_schema/types'

export const initialData: memberDetailDtoType = {
  memberBasicResponseDto: {
    companyName: '',
    email: '',
    memberId: undefined,
    memberStatus: '',
    memberStatusDescription: '',
    name: '',
    note: '',
    role: '',
    roleDescription: '',
    storedFileName: null,
    version: 0
  },
  memberCareerResponseDto: {
    grade: '',
    gradeDescription: '',
    industryOtherMonth: 0,
    industrySameMonth: 0,
    jobField: '',
    licenseName1: '',
    licenseName2: '',
    version: 0
  },
  memberEtcResponseDto: {
    employedType: '',
    incomeTaxReducedBeginDate: '',
    incomeTaxReducedEndDate: '',
    militaryPeriod: '',
    newMiddleAgedJobs: '',
    seniorInternship: '',
    youthDigital: '',
    youthEmploymentIncentive: '',
    youthJobLeap: '',
    version: 0
  },
  memberOfficeResponseDto: {
    apprentice: '',
    contractType: '',
    contractTypeDescription: '',
    contractYn: '',
    fieldworkYn: '',
    groupInsuranceYn: '',
    insuranceAcquisitionDate: '',
    insuranceLostDate: null,
    joinDate: '',
    laborForm: '',
    laborFormDescription: '',
    officeDepartmentId: undefined,
    officeDepartmentName: '',
    officePosition: '',
    officePositionDescription: '',
    resignDate: null,
    staffCardYn: '',
    staffNum: '',
    version: 0,
    workForm: '',
    workFormDescription: ''
  },
  memberPrivacyResponseDto: {
    address: {
      roadAddress: '',
      jibunAddress: null,
      detailAddress: ''
    },
    bankName: '',
    bankNumber: '',
    birthday: '',
    carNumber: '',
    carYn: '',
    educationLevel: '',
    educationMajor: '',
    emerNum1: '',
    emerNum2: '',
    familyCnt: 0,
    foreignYn: '',
    juminNum: '',
    phoneNumber: '',
    religion: '',
    version: 0
  }
}
