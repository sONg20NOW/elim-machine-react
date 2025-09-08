import type { HeaderInfoType, SortInfoType, machineProjectPageDtoType, memberPageDtoType } from './types'

export const BROWER_TAB_TITLE = 'ELIM'
export const BROWER_TAB_DESCRIPTION = 'Elim-safety 114'

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
    age: { label: '나이', canSort: true },
    email: { label: '이메일', canSort: true },
    phoneNumber: { label: '휴대폰', canSort: false },
    joinDate: { label: '입사일', canSort: true },
    careerYear: { label: '근속년수', canSort: true },
    memberStatusDescription: { label: '상태', canSort: false }
  } as Record<keyof memberPageDtoType, HeaderInfoType>,
  machine: {
    projectStatusDescription: { label: '상태', canSort: false },
    region: { label: '지역', canSort: true },
    machineProjectName: { label: '현장명', canSort: true },
    fieldBeginDate: { label: '현장점검', canSort: true },
    fieldEndDate: { label: '점검종료', canSort: true },
    reportDeadline: { label: '보고서마감', canSort: true },
    inspectionCount: { label: '설비', canSort: true },
    companyName: { label: '점검업체', canSort: true },
    engineerNames: { label: '참여기술진', canSort: false },
    grossArea: { label: '연면적(㎡)', canSort: true },
    tel: { label: '전화번호', canSort: false }
  } as Record<keyof machineProjectPageDtoType, HeaderInfoType>,
  engineers: {}
}

// 초기 정렬 값
export const InitialSorting = {
  target: '',
  sort: ''
} as SortInfoType<memberPageDtoType>
