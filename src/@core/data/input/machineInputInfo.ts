import {
  buildingGradeOption,
  checkTypeOption,
  companyNameOption,
  gradeOption,
  projectStatusOption
} from '@/@core/data/options'
import type {
  machineProjectInputInfoType,
  machineProjectEngineerInputInfoType,
  machineScheduleInputInfoType
} from '../../types'

// 기계설비현장 상세페이지
export const MACHINE_PROJECT_INPUT_INFO: machineProjectInputInfoType = {
  institutionName: { type: 'text', label: '기관명' },
  machineProjectName: { type: 'text', label: '현장명' },
  roadAddress: { type: 'map', label: '주소' },
  detailAddress: { type: 'text', label: '상세주소' },
  representative: { type: 'text', label: '대표자' },
  grossArea: { type: 'number', label: '연면적(㎡)' },
  bizno: { type: 'text', label: '사업자번호' },
  houseCnt: { type: 'number', label: '세대수' },
  purpose: { type: 'text', label: '용도' },
  manager: { type: 'text', label: '담당자' },
  structure: { type: 'text', label: '건물구조' },
  managerPhone: { type: 'text', label: '연락처' },
  tel: { type: 'text', label: '전화번호' },
  completeDate: { type: 'date', label: '준공일' },
  contractDate: { type: 'date', label: '계약일' },
  projectStatus: {
    type: 'multi',
    label: '진행상태',
    options: projectStatusOption
  },
  contractPrice: { type: 'number', label: '계약금액' },
  companyName: { type: 'multi', label: '점검업체', options: companyNameOption },
  contractManager: { type: 'text', label: '계약담당자(이름)' },
  contractManagerTel: { type: 'text', label: '계약담당자(연락처)' },
  contractManagerEmail: { type: 'text', label: '계약담당자(이메일)' },
  contractPartner: { type: 'text', label: '계약상대자(이름)' },
  contractPartnerTel: { type: 'text', label: '계약상대자(연락처)' },
  contractPartnerEmail: { type: 'text', label: '계약상대자(이메일)' },
  requirement: { type: 'long text', label: '요구사항' },
  machineMaintainer1Name: { type: 'text', label: '유지관리자1(이름)' },
  machineMaintainer1Info: { type: 'text', label: '유지관리자1(정보)' },
  machineManager1Name: { type: 'text', label: '담당자1(이름)' },
  machineManager1Info: { type: 'text', label: '담당자1(정보)' },
  machineMaintainer2Name: { type: 'text', label: '유지관리자2(이름)' },
  machineMaintainer2Info: { type: 'text', label: '유지관리자2(정보)' },
  machineManager2Name: { type: 'text', label: '담당자2(이름)' },
  machineManager2Info: { type: 'text', label: '담당자2(정보)' },
  machineMaintainer3Name: { type: 'text', label: '유지관리자3(이름)' },
  machineMaintainer3Info: { type: 'text', label: '유지관리자3(정보)' },
  machineManager3Name: { type: 'text', label: '담당자3(이름)' },
  machineManager3Info: { type: 'text', label: '담당자3(정보)' }
}

// 점검일정 / 참여기술진 탭 테이블 수정에 사용.
export const MACHINE_SCHEDULE_INPUT_INFO: machineScheduleInputInfoType = {
  fieldBeginDate: {
    type: 'date',
    label: '현장점검시작'
  },
  fieldEndDate: {
    type: 'date',
    label: '현장점검종료'
  },
  beginDate: {
    type: 'date',
    label: '투입시작'
  },
  endDate: {
    type: 'date',
    label: '투입종료'
  },
  reportDeadline: {
    type: 'date',
    label: '보고서마감일'
  },
  projectEndDate: {
    type: 'date',
    label: '프로젝트종료'
  },
  checkType: {
    type: 'multi',
    label: '점검종류',
    options: checkTypeOption
  },
  buildingGrade: {
    type: 'multi',
    label: '건물등급',
    options: buildingGradeOption
  },
  reportManagerEmail: {
    type: 'text',
    label: '담당자 이메일'
  },
  tiIssueDate: {
    type: 'date',
    label: '계산서 발급일'
  },
  engineers: {
    type: 'multi',
    label: '참여기술진',

    // ! engineer API
    options: []
  }
}

// 점검일정/참여기술진 - 참여기술진 수정
export const MACHINE_PROJECT_ENGINEER_INPUT_INFO: machineProjectEngineerInputInfoType = {
  engineerName: { type: 'text', label: '이름' },
  grade: {
    type: 'multi',
    label: '등급',
    options: gradeOption
  },
  engineerLicenseNum: { type: 'text', label: '수첩발급번호' },
  beginDate: { type: 'date', label: '투입시작일' },
  endDate: { type: 'date', label: '투입종료일' },
  note: { type: 'text', label: '비고' }
}
