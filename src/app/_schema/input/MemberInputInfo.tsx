import {
  companyNameOption,
  contractTypeOption,
  gradeOption,
  memberStatusOption,
  officeDepartmentNameOption,
  officePositionOption,
  roleOption,
  workFormOption
} from '@/app/_constants/options'
import type { memberInputType } from '../../_type/types'

// 직원 상세 페이지
export const MEMBER_INPUT_INFO: memberInputType = {
  basic: {
    name: {
      size: 'md',
      type: 'text',
      label: '이름'
    },
    email: {
      size: 'md',
      type: 'text',
      label: '이메일'
    },
    companyName: {
      size: 'md',
      type: 'multi',
      label: '소속',
      options: companyNameOption
    },
    role: {
      size: 'md',
      type: 'multi',
      label: '권한',
      options: roleOption
    },
    memberStatus: {
      size: 'md',
      type: 'multi',
      label: '재직 상태',
      options: memberStatusOption
    },
    note: {
      size: 'lg',
      type: 'long text',
      label: '비고'
    }
  },
  privacy: {
    foreignYn: {
      size: 'md',
      type: 'yn',
      label: '외국인 여부'
    },
    juminNum: {
      size: 'md',
      type: 'juminNum',
      label: '주민번호'
    },
    birthday: {
      size: 'md',
      type: 'date',
      label: '생년월일'
    },
    phoneNumber: {
      size: 'md',
      type: 'text',
      label: '전화번호'
    },
    emerNum1: {
      size: 'md',
      type: 'text',
      label: '비상연락처1'
    },
    emerNum2: {
      size: 'md',
      type: 'text',
      label: '비상연락처2'
    },
    familyCnt: {
      size: 'md',
      type: 'number',
      label: '가족 수'
    },
    religion: {
      size: 'md',
      type: 'text',
      label: '종교'
    },
    roadAddress: {
      size: 'lg',
      type: 'map',
      label: '도로명 주소'
    },
    detailAddress: {
      size: 'lg',
      type: 'text',
      label: '상세 주소'
    },
    educationLevel: {
      size: 'md',
      type: 'text',
      label: '최종학력'
    },
    educationMajor: {
      size: 'md',
      type: 'text',
      label: '전공'
    },
    carYn: {
      size: 'md',
      type: 'yn',
      label: '차량 보유 여부'
    },
    carNumber: {
      size: 'md',
      type: 'text',
      label: '차량번호'
    },
    bankName: {
      size: 'md',
      type: 'text',
      label: '은행명'
    },
    bankNumber: {
      size: 'md',
      type: 'text',
      label: '계좌번호'
    }
  },
  office: {
    staffNum: {
      size: 'md',
      type: 'text',
      label: '사번'
    },
    officeDepartmentName: {
      size: 'md',
      type: 'multi', // 다중 선택 가능
      label: '부서',
      options: officeDepartmentNameOption
    },
    officePosition: {
      size: 'md',
      type: 'multi', // 다중 선택 가능
      label: '직위',
      options: officePositionOption
    },
    apprentice: {
      size: 'md',
      type: 'text',
      label: '수습'
    },
    contractType: {
      size: 'md',
      type: 'multi', // 다중 선택 가능
      label: '계약 유형',
      options: contractTypeOption
    },
    contractYn: {
      size: 'md',
      type: 'yn',
      label: '계약 여부'
    },
    laborForm: {
      size: 'md',
      type: 'multi', // 다중 선택 가능
      label: '상근/비상근',
      options: [
        { value: 'RESIDENT', label: '상근' },
        { value: 'NON_RESIDENT', label: '비상근' }
      ]
    },
    workForm: {
      size: 'md',
      type: 'multi', // 다중 선택 가능
      label: '근무형태',
      options: workFormOption
    },
    fieldworkYn: {
      size: 'md',
      type: 'yn',
      label: '현장근무 여부'
    },
    staffCardYn: {
      size: 'md',
      type: 'yn',
      label: '사원증 여부'
    },
    joinDate: {
      size: 'md',
      type: 'date',
      label: '입사일'
    },
    resignDate: {
      size: 'md',
      type: 'date',
      label: '퇴사일'
    },
    insuranceAcquisitionDate: {
      size: 'md',
      type: 'date',
      label: '보험 취득일'
    },
    insuranceLostDate: {
      size: 'md',
      type: 'date',
      label: '보험 상실일'
    },
    groupInsuranceYn: {
      size: 'md',
      type: 'yn',
      label: '단체보험 가입여부'
    }
  },
  career: {
    grade: {
      size: 'md',
      type: 'multi', // 다중 선택 가능
      label: '등급',
      options: gradeOption,
      disabled: true
    },
    jobField: {
      size: 'md',
      type: 'text',
      label: '직무분야'
    },
    industrySameMonth: {
      size: 'md',
      type: 'number',
      label: '동종업계 경력(월)'
    },
    industryOtherMonth: {
      size: 'md',
      type: 'number',
      label: '타업계 경력(월)'
    },
    licenseName1: {
      size: 'md',
      type: 'text',
      label: '자격증1'
    },
    licenseName2: {
      size: 'md',
      type: 'text',
      label: '자격증2'
    }
  },
  etc: {
    employedType: {
      size: 'md',
      type: 'text',
      label: '취업자 유형'
    },
    incomeTaxReducedBeginDate: {
      size: 'md',
      type: 'date',
      label: '소득세 감면 시작일'
    },
    incomeTaxReducedEndDate: {
      size: 'md',
      type: 'date',
      label: '소득세 감면 종료일'
    },
    militaryPeriod: {
      size: 'md',
      type: 'text',
      label: '군복무 기간'
    },
    newMiddleAgedJobs: {
      size: 'md',
      type: 'text',
      label: '신중년 적합직무'
    },
    seniorInternship: {
      size: 'md',
      type: 'text',
      label: '시니어 인턴십'
    },
    youthDigital: {
      size: 'md',
      type: 'text',
      label: '청년 디지털'
    },
    youthEmploymentIncentive: {
      size: 'md',
      type: 'text',
      label: '청년 채용 특별 장려금'
    },
    youthJobLeap: {
      size: 'md',
      type: 'text',
      label: '청년 일자리 도약'
    }
  }
}
