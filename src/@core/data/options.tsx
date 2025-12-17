import { IconBackslash, IconPercentage0, IconX } from '@tabler/icons-react'

import type {
  contractTypeType,
  equipmentPhaseType,
  gradeType,
  laborFormType,
  officePositionType,
  machineProjectPicTypeType,
  workFormType,
  projectStatusType,
  safetyInspectionTypeType,
  checkTypeType
} from '@core/types'

export const YNOption = [
  { value: 'Y', label: '예' },
  { value: 'N', label: '아니오' }
]

// member
// 해당 옵션은 실제로 사용되지 않음. InputBox에서 실제 라이선스 리스트를 가져와서 사용하기 때문.
export const companyNameOption = []

export const roleOption = [
  { value: 'GUEST', label: '게스트' },
  { value: 'USER', label: '일반 사용자' },
  { value: 'STAFF', label: '직원' },
  { value: 'MANAGER', label: '매니저' },
  { value: 'ADMIN', label: '관리자' },
  { value: 'SUPERADMIN', label: '최고 관리자' }
]

export const memberStatusOption = [
  { value: 'NORMAL', label: '재직중' },
  { value: 'QUIT', label: '퇴사' },
  { value: 'PENDING', label: '가입 승인대기' },
  { value: 'LEAVE', label: '휴직' }
]

export const officeDepartmentNameOption = [
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

export const officePositionOption: { value: officePositionType; label: string }[] = [
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

export const contractTypeOption: { value: contractTypeType; label: string }[] = [
  { value: 'REGULAR', label: '정규직' },
  { value: 'CONTRACT_1Y', label: '계약직1년' },
  { value: 'CONTRACT_2Y', label: '계약직2년' },
  { value: 'NON_REGULAR', label: '무기계약직' },
  { value: 'DAILY', label: '일용직' },
  { value: 'TEMPORARY', label: '단기시급' }
]

export const laborFormOption: { value: laborFormType; label: string }[] = [
  { value: 'RESIDENT', label: '상근' },
  { value: 'NON_RESIDENT', label: '비상근' }
]

export const workFormOption: { value: workFormType; label: string }[] = [
  { value: 'DEEMED', label: '간주근로' },
  { value: 'SPECIAL', label: '별정근로' }
]

export const gradeOption: { value: gradeType; label: string }[] = [
  { value: 'ASSIST', label: '보조' },
  { value: 'BEGINNER', label: '초급' },
  { value: 'INTERMEDIATE', label: '중급' },
  { value: 'ADVANCED', label: '고급' },
  { value: 'EXPERT', label: '특급' }
]

export const genderOption = [
  { value: 'MALE', label: '남' },
  { value: 'FEMALE', label: '여' }
]

export const careerYearOption = [
  { value: '1', label: '1년차 이상' },
  { value: '2', label: '2년차 이상' },
  { value: '3', label: '3년차 이상' },
  { value: '4', label: '4년차 이상' },
  { value: '5', label: '5년차 이상' },
  { value: '6', label: '6년차 이상' },
  { value: '7', label: '7년차 이상' },
  { value: '8', label: '8년차 이상' },
  { value: '9', label: '9년차 이상' },
  { value: '10', label: '10년차 이상' }
]

export const birthMonthOption = Array.from({ length: 12 }, (_, i) => ({
  value: `${i + 1}`,
  label: `${i + 1}월 생일자`
}))

// machine - project
export const projectStatusOption: { value: projectStatusType; label: string }[] = [
  { value: 'CONTRACT_COMPLETED', label: '계약 완료' },
  { value: 'SITE_INSPECTION_COMPLETED', label: '현장 점검 완료' },
  { value: 'REPORT_WRITING', label: '보고서 작성중' },
  { value: 'REPORT_WRITING_COMPLETED', label: '보고서 작성완료' },
  { value: 'REPORT_SUBMITTING', label: '보고서 제출중' },
  { value: 'REPORT_SUBMITTED', label: '보고서 제출완료' }
]

// machine - schedule
export const checkTypeOption: { value: checkTypeType; label: string }[] = [
  { value: 'COOLING', label: '냉방 점검' },
  { value: 'HEATING', label: '난방 점검' }
]

export const buildingGradeOption = [
  { value: 'BASIC', label: '초급' },
  { value: 'INTERMEDIATE', label: '중급' },
  { value: 'ADVANCED', label: '고급' },
  { value: 'SUPREME', label: '특급' }
]

// machine - inspection
export const picCateInspectionStatusOption = [
  { value: 'NONE', label: <IconBackslash size={20} /> },
  { value: 'PASS', label: <IconPercentage0 size={20} /> },
  { value: 'FAIL', label: <IconX size={20} /> }
]

// machine-inspection - gas
export const fuelTypeOption = [
  { value: 'LNG', label: 'LNG' }, // 액화천연가스지만 LNG 그대로 많이 씀
  { value: 'LPG', label: 'LPG' }, // 액화석유가스지만 LPG 그대로 씀
  { value: 'LIQUID_FUEL', label: '액체연료' },
  { value: 'SOLID_FUEL', label: '고체연료' },
  { value: 'GASEOUS_FUEL', label: '기체연료' },
  { value: 'PET_COKE', label: '석유코크스' },
  { value: 'BIOGAS', label: '바이오가스' },
  { value: 'GAS_HEATPUMP', label: '가스히트펌프' },
  { value: 'ETC', label: '기타' }
]

// machine-inspection - gas
export const fanTypeOption = [
  { value: 'SA', label: '급기팬 (SA)' },
  { value: 'RA', label: '환기팬 (RA)' }
]

// machine-inspection - pipe
export const pipeTypeOption = [
  { value: 'CARBON_STEEL', label: '탄소강관' },
  { value: 'STAINLESS_STEEL', label: '스테인리스강관' },
  { value: 'COPPER_PIPE', label: '구리관' }
]

// safety project
export const safetyInspectionTypeOption: { label: string; value: safetyInspectionTypeType }[] = [
  {
    value: 'REGULAR_SAFETY_INSPECTION',
    label: '정기안전점검'
  },
  { value: 'PRECISE_SAFETY_INSPECTION', label: '정밀안전점검' },
  { value: 'PRECISE_SAFETY_DIAGNOSTIC', label: '정밀안전진단' },
  { value: 'SEISMIC_PERFORMANCE_EVALUATION', label: '내진성능평가' },
  { value: 'STRUCTURAL_SAFETY_ASSESSMENT', label: '구조안전성검토' }
]

// engineer
export const engineersOption: { value: string | number; label: string }[] = []

export const workStatusOption = [
  { value: 'WAITING', label: '대기' },
  { value: 'ONSITE', label: '현장' },
  { value: 'WORKING', label: '작업' },
  { value: 'RESERVED', label: '예약' }
]

// machine project pic (현장사진)
export const projectPicOption: { label: string; value: machineProjectPicTypeType }[] = [
  { label: '전경사진', value: 'OVERVIEW' },
  { label: '위치도', value: 'LOCATION_MAP' },
  { label: '기타', value: 'ETC' }
]

// 설비 정보
export const equipmentPhaseOption: { label: string; value: equipmentPhaseType }[] = [
  { label: '설치일', value: 'INSTALL' },
  { label: '제조일', value: 'MANUFACTURE' },
  { label: '사용일', value: 'USE' }
]

// 측정값 자동입력
export const measuredValueOption = [
  '양호',
  '없음',
  '정상',
  'A',
  '㎝',
  '㎝Hg',
  'CO',
  'CO₂',
  'dB(A)',
  'Eff',
  'kgf/㎠',
  '㎾',
  'mbar',
  '㎜',
  '㎜/s',
  '㎜Aq',
  '㎜Hg',
  '㎫',
  '㏁',
  'NO',
  'NOx',
  'Nm³/h',
  'O₂',
  'Ratio',
  'rpm',
  'V',
  'XAir',
  'Ω',
  '℃',
  'm³',
  'm³/h',
  'm³/min'
].map(v => ({ value: v, label: v }))

// 공통
export const PageSizeOptions = [15, 20, 25, 30, 50, 100]

export const DEFAULT_PAGESIZE = 15

export const DEFAULT_PIC_PAGESIZE = 30
