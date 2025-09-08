import type { HeaderInfoType, SortInfoType, memberPageDtoType } from './types'

export const BROWER_TAB_TITLE = 'ELIM'
export const BROWER_TAB_DESCRIPTION = 'Elim-safety 114'

// table 생성 중 헤더 생성에 필요.
export const HEADERS = {
  // 직원관리 탭 테이블
  employee: {
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
  engineers: {}
}

// 초기 정렬 값
export const InitialSorting = {
  target: 'roleDescription',
  sort: ''
} as SortInfoType<memberPageDtoType>
