import type { machineInputType } from '../../_type/types'
import { MEMBER_INPUT_INFO } from './MemberInputInfo'

// 기계설비현장 상세페이지
export const MACHINE_INPUT_INFO: machineInputType = {
  // 현장정보 탭
  project: {
    institutionName: { type: 'text', label: '기관명' },
    roadAddress: { type: 'text', label: '주소' },
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
      options: [
        { value: 'CONTRACT_COMPLETED', label: '계약 완료' },
        { value: 'SITE_INSPECTION_COMPLETED', label: '현장 점검 완료' },
        { value: 'REPORT_WRITING', label: '보고서 작성중' },
        { value: 'REPORT_WRITING_COMPLETED', label: '보고서 작성완료' },
        { value: 'REPORT_SUBMITTING', label: '보고서 제출중' },
        { value: 'REPORT_SUBMITTED', label: '보고서 제출완료' }
      ]
    },
    contractPrice: { type: 'number', label: '계약금액' },
    companyName: MEMBER_INPUT_INFO.basic.companyName,
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
  },

  // 점검일정 / 참여기술진 탭
  schedule: {}
}
