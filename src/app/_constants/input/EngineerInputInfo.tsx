import { gradeOption } from '@/app/_constants/options'
import type { engineerInputType } from '@/app/_type/types'

export const ENGINEER_INPUT_INFO: engineerInputType = {
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
