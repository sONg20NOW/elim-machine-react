import type {
  HeaderInfoType,
  MachineEngineerPageResponseDtoType,
  SortInfoType,
  MachineProjectPageDtoType,
  memberPageDtoType,
  LicensePageResponseDtoType,
  MachineInspectionPageResponseDtoType
} from '../_type/types'

export const BROWER_TAB_TITLE = 'ELIM'
export const BROWER_TAB_DESCRIPTION = 'Elim-safety 114'

// TODO: 추후 input info와 연동..? 타입들에 대해서 번역한 단어를 저장해두는 것도 좋을 듯..
// table 생성 중 헤더 생성에 필요.
export const HEADERS = {
  // 직원관리 탭 테이블
  member: {
    roleDescription: { label: '권한', canSort: true },
    name: { label: '이름', canSort: true },
    staffNum: { label: '사번', canSort: false },
    companyName: { label: '소속', canSort: true },
    officeDepartmentName: { label: '부서', canSort: true },
    officePositionDescription: { label: '직위', canSort: false },
    age: { label: '나이', canSort: true }, //gender도 함께 표시
    email: { label: '이메일', canSort: true },
    phoneNumber: { label: '휴대폰', canSort: false },
    joinDate: { label: '입사일', canSort: true },
    careerYear: { label: '근속년수', canSort: true },
    memberStatusDescription: { label: '상태', canSort: false }
  } as Record<keyof memberPageDtoType, HeaderInfoType>,
  machine: {
    projectStatusDescription: { label: '상태', canSort: false },
    region: { label: '지역', canSort: false },
    machineProjectName: { label: '현장명', canSort: true },
    fieldBeginDate: { label: '현장점검', canSort: true },
    fieldEndDate: { label: '점검종료', canSort: true },
    reportDeadline: { label: '보고서마감', canSort: true },
    inspectionCount: { label: '설비', canSort: false },
    companyName: { label: '점검업체', canSort: true },
    engineerNames: { label: '참여기술진', canSort: false },
    grossArea: { label: '연면적(㎡)', canSort: true },
    tel: { label: '전화번호', canSort: false }
  } as Record<keyof MachineProjectPageDtoType, HeaderInfoType>,
  machineInspection: {
    machineParentCateName: { label: '분류', canSort: false },
    machineInspectionName: { label: '설비명', canSort: false },
    machinePicCount: { label: '사진', canSort: false },
    purpose: { label: '용도', canSort: false },
    location: { label: '위치', canSort: false },
    engineerNames: { label: '점검자', canSort: false },
    checkDate: { label: '점검일', canSort: false },
    inspectionStatus: { label: '결과', canSort: false }
  } as Record<keyof MachineInspectionPageResponseDtoType, HeaderInfoType>,
  engineers: {
    companyName: { label: '회사명', canSort: false },
    gradeDescription: { label: '등급', canSort: true },
    name: { label: '이름', canSort: true },
    officeDepartmentName: { label: '부서', canSort: false },
    officePositionDescription: { label: '직급', canSort: false },
    engineerLicenseNum: { label: '수첩발급번호', canSort: false },
    email: { label: '이메일', canSort: false },
    phoneNumber: { label: '휴대폰', canSort: false },
    workStatusDescription: { label: '상태', canSort: false },
    projectCnt: { label: '현장수', canSort: false },
    latestProjectName: { label: '마지막현장', canSort: false },
    latestProjectBeginDate: { label: '투입기간', canSort: false }, // latestProjectEndDate도 함께 표시
    remark: { label: '비고', canSort: false }
  } as Record<keyof MachineEngineerPageResponseDtoType, HeaderInfoType>,
  licenses: {
    companyName: { label: '업체명', canSort: false },
    bizno: { label: '사업자번호', canSort: false, hideOnMobile: true },
    region: { label: '지역', canSort: false },
    ceoName: { label: '대표자명', canSort: false },
    memberCount: { label: '직원', canSort: true, hideOnMobile: true },
    machineEngineerCount: { label: '기계설비', canSort: true, hideOnMobile: true },
    safetyEngineerCount: { label: '안전진단', canSort: true, hideOnMobile: true },
    managerName: { label: '담당자명', canSort: false, hideOnMobile: true },
    managerEmail: { label: '이메일', canSort: false, hideOnMobile: true },
    managerPhoneNumber: { label: '휴대폰', canSort: false, hideOnMobile: true },
    tel: { label: '전화번호', canSort: false },
    contractDate: { label: '계약일', canSort: false, hideOnMobile: true },
    expireDate: { label: '만료일', canSort: false, hideOnMobile: true }
  } as Record<keyof LicensePageResponseDtoType, HeaderInfoType>
}

// 초기 정렬 생성
export function createInitialSorting<T>(): SortInfoType<T> {
  return {
    target: '',
    sort: ''
  }
}
