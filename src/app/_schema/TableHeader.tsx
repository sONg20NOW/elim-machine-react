import type { UsersType } from './types'

export const BROWER_TAB_TITLE = 'ELIM'
export const BROWER_TAB_DESCRIPTION = 'Elim-safety 114'

// table 생성 중 헤더 생성에 필요.
export const HEADERS = {
  // 직원관리 탭 테이블
  employee: {
    roleDescription: '권한',
    name: '이름',
    staffNum: '사번',
    companyName: '소속',
    officeDepartmentName: '부서',
    officePositionDescription: '직위',
    age: '나이',
    email: '이메일',
    phoneNumber: '휴대폰',
    isTechnician: '기술인',
    joinDate: '입사일',
    careerYear: '근속년수',
    memberStatusDescription: '상태'
  } as Record<keyof UsersType, string>,
  engineers: {}
}
