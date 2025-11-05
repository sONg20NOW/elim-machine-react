import type { ProjectPicType } from '@/@core/types'

export const MACHINE_PROJECT_PICTURE_TYPE: { label: string; value: ProjectPicType }[] = [
  { label: '전경사진', value: 'OVERVIEW' },
  { label: '위치도', value: 'LOCATION_MAP' },
  { label: '기타', value: 'ETC' }
]
