// 첫번째 키: members 정보 카테고리 (ex. basic, offic, ...)
// 두번째 키: MultiSelectBox의 id (ex. companyName, role) => types.tsx-EditUserInfoData의 속성값들
// label: id를 한글화한 것
// options: 선택지

export const multipleSelects = {
  basic: {
    companyName: {
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
      label: '권한',
      options: [
        { value: 'USER', label: '유저' },
        { value: 'STAFF', label: '직원' },
        { value: 'MANAGER', label: '매니저' },
        { value: 'ADMIN', label: '어드민' },
        { value: 'SUPERADMIN', label: '슈퍼어드민' }
      ]
    },
    memberStatusDescription: {
      label: '재직 상태',
      options: [
        { value: 'NORMAL', label: '재직중' },
        { value: 'QUIT', label: '퇴사' },
        { value: 'PENDING', label: '가입 승인대기' },
        { value: 'LEAVE', label: '휴직' }
      ]
    }
  },
  privacy: {},
  office: {
    officeDepartmentName: {
      label: '부서',
      options: [
        { value: '건설사업', label: '건설사업' },
        { value: '건설안전', label: '건설안전' },
        { value: '기술개발', label: '기술개발' },
        { value: '경영지원', label: '경영지원' },
        { value: '영업', label: '영업' },
        { value: '총무', label: '총무' },
        { value: '인사', label: '인사' }
      ]
    },
    officePosition: {
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
    contractType: {
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
    laborForm: {
      label: '상근/비상근',
      options: [
        { value: 'RESIDENT', label: '상근' },
        { value: 'NON_RESIDENT', label: '비상근' }
      ]
    },
    workForm: {
      label: '근무형태',
      options: [
        { value: 'DEEMED', label: '간주근로' },
        { value: 'SPECIAL', label: '별정근로' }
      ]
    }
  },
  career: {
    grade: {
      label: '등급',
      options: [
        { value: 'BEGINNER', label: '초급' },
        { value: 'INTERMEDIATE', label: '중급' },
        { value: 'ADVANCED', label: '고급' }
      ]
    }
  },
  etc: {}
}
