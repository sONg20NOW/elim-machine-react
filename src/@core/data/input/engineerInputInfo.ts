import { gradeOption } from '@/@core/data/options'
import type { engineerInputInfoType } from '@core/types'

export const ENGINEER_INPUT_INFO: engineerInputInfoType = {
  name: { type: 'text', label: '이름' },
  email: { type: 'text', label: '이메일' },
  phoneNumber: { type: 'text', label: '번호' },
  grade: {
    type: 'multi',
    label: '등급',
    options: gradeOption
  },
  engineerLicenseNum: { type: 'text', label: '수첩발급번호' },
  remark: { type: 'long text', label: '비고' }
}
