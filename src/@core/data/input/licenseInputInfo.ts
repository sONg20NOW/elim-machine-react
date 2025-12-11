import type { licenseInputInfoType } from '@core/types'

export const LICENSE_INPUT_INFO: licenseInputInfoType = {
  companyName: { type: 'text', label: '업체명' },
  companyNameAbbr: { type: 'text', label: '영문약어' },
  bizno: { type: 'text', label: '사업자번호' },
  ceoName: { type: 'text', label: '대표자명' },
  managerName: { type: 'text', label: '담당자명' },
  managerPhoneNumber: { type: 'text', label: '담당자 휴대폰 번호' },
  managerEmail: { type: 'text', label: '담당자 이메일' },
  taxEmail: { type: 'text', label: '계산서메일' },
  homepageAddr: { type: 'text', label: '홈페이지' },
  tel: { type: 'text', label: '회사 전화번호' },
  fax: { type: 'text', label: '팩스번호' },
  roadAddress: { type: 'map', label: '주소' },
  detailAddress: { type: 'text', label: '상세주소' },
  businessType: { type: 'text', label: '업태' },
  businessCategory: { type: 'text', label: '업종' },
  contractDate: { type: 'date', label: '계약일' },
  expireDate: { type: 'date', label: '만료일' },
  remark: { type: 'long text', label: '비고' }
}
