import type { memberInputType } from '../types'

// 기계설비현장 상세페이지
export const MACHINE_INPUT_INFO: memberInputType = {
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
      options: [
        { value: '엘림기술원(주)', label: '엘림기술원(주)' },
        { value: '엘림주식회사', label: '엘림주식회사' },
        { value: '엘림테크원(주)', label: '엘림테크원(주)' },
        { value: '이엘엔지니어링(주)', label: '이엘엔지니어링(주)' },
        { value: '이엘테크원(주)', label: '이엘테크원(주)' }
      ]
    },
    role: {
      size: 'md',
      type: 'multi',
      label: '권한',
      options: [
        { value: 'GUEST', label: '게스트' },
        { value: 'USER', label: '일반 사용자' },
        { value: 'STAFF', label: '직원' },
        { value: 'MANAGER', label: '매니저' },
        { value: 'ADMIN', label: '관리자' },
        { value: 'SUPERADMIN', label: '최고 관리자' }
      ]
    },
    memberStatus: {
      size: 'md',
      type: 'multi',
      label: '재직 상태',
      options: [
        { value: 'NORMAL', label: '재직중' },
        { value: 'QUIT', label: '퇴사' },
        { value: 'PENDING', label: '가입 승인대기' },
        { value: 'LEAVE', label: '휴직' }
      ]
    },
    note: {
      size: 'lg',
      type: 'text',
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
      type: 'text',
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
      type: 'text',
      label: '도로명 주소'
    },
    detailAddress: {
      size: 'lg',
      type: 'text',
      label: '상세 주소'
    },
    jibunAddress: {
      size: 'lg',
      type: 'text',
      label: '지번 주소'
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
      options: [
        { value: '건설사업', label: '건설사업' },
        { value: '건설안전', label: '건설안전' },
        { value: '건축기술', label: '건축기술' },
        { value: '경영기획', label: '경영기획' },
        { value: '경영지원', label: '경영지원' },
        { value: '구조', label: '구조' },
        { value: '구조기술', label: '구조기술' },
        { value: '기계설비', label: '기계설비' },
        { value: '기술영업', label: '기술영업' },
        { value: '기술영업CS', label: '기술영업CS' },
        { value: '기술자료', label: '기술자료' },
        { value: '기업부설연구소', label: '기업부설연구소' },
        { value: '기획부', label: '기획부' },
        { value: '기획홍보', label: '기획홍보' },
        { value: '대외협력팀', label: '대외협력팀' },
        { value: '대표이사', label: '대표이사' },
        { value: '법률자문', label: '법률자문' },
        { value: '사무', label: '사무' },
        { value: '설계팀', label: '설계팀' },
        { value: '안전진단부', label: '안전진단부' },
        { value: '임원실', label: '임원실' },
        { value: '토목기술', label: '토목기술' },
        { value: '토목부', label: '토목부' }
      ]
    },
    officePosition: {
      size: 'md',
      type: 'multi', // 다중 선택 가능
      label: '직위',
      options: [
        { value: 'TEMPORARY', label: '단기' },
        { value: 'INTERN', label: '인턴' },
        { value: 'STAFF', label: '사원' },
        { value: 'JUNIOR_STAFF', label: '주임' },
        { value: 'ASSISTANT_MANAGER', label: '대리' },
        { value: 'SENIOR_ASSISTANT_MANAGER', label: '선임' },
        { value: 'RESPONSIBLE', label: '책임' },
        { value: 'TEAM_LEADER', label: '팀장' },
        { value: 'SECTION_CHIEF', label: '소장' },
        { value: 'DEPUTY_GENERAL_MANAGER', label: '본부장' },
        { value: 'MANAGER', label: '과장' },
        { value: 'SENIOR_MANAGER', label: '부장' },
        { value: 'DEPUTY_MANAGER', label: '차장' },
        { value: 'DIRECTOR', label: '이사' },
        { value: 'EXECUTIVE_DIRECTOR', label: '상무' },
        { value: 'SENIOR_EXECUTIVE_DIRECTOR', label: '전무' },
        { value: 'ADVISOR', label: '고문' },
        { value: 'VICE_PRESIDENT', label: '부사장' },
        { value: 'PRESIDENT', label: '사장' }
      ]
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
      options: [
        { value: 'REGULAR', label: '정규직' },
        { value: 'CONTRACT_1Y', label: '계약직1년' },
        { value: 'CONTRACT_2Y', label: '계약직2년' },
        { value: 'NON_REGULAR', label: '무기계약직' },
        { value: 'DAILY', label: '일용직' },
        { value: 'TEMPORARY', label: '단기시급' }
      ]
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
      options: [
        { value: 'DEEMED', label: '간주근로' },
        { value: 'SPECIAL', label: '별정근로' }
      ]
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
      options: [
        { value: 'BEGINNER', label: '초급' },
        { value: 'INTERMEDIATE', label: '중급' },
        { value: 'ADVANCED', label: '고급' }
      ],
      disable: true
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
