import type { InputFieldType, MachineFilterType } from '../../_type/types'
import { MACHINE_INPUT_INFO } from '../input/MachineInputInfo'

const { projectStatus, companyName } = MACHINE_INPUT_INFO.project

export const MACHINE_FILTER_INFO: Record<keyof MachineFilterType | 'region', InputFieldType> = {
  projectStatus: projectStatus!,
  region: {
    type: 'multi',
    label: '지역',
    options: [
      { value: '서울', label: '서울' },
      { value: '인천', label: '인천' },
      { value: '대전', label: '대전' },
      { value: '대구', label: '대구' },
      { value: '부산', label: '부산' },
      { value: '울산', label: '울산' },
      { value: '광주', label: '광주' },
      { value: '세종', label: '세종' },
      { value: '경기', label: '경기' },
      { value: '강원', label: '강원' },
      { value: '충북', label: '충북' },
      { value: '충남', label: '충남' },
      { value: '전북', label: '전북' },
      { value: '전남', label: '전남' },
      { value: '경북', label: '경북' },
      { value: '경남', label: '경남' },
      { value: '제주', label: '제주' }
    ]
  },
  companyName: companyName!,
  engineerName: {
    type: 'multi',
    label: '점검자',

    // ! option은 API로 가져와서 유동적으로 설정
    options: []
  }
}
