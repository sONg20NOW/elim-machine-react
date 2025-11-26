// MUI Imports
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'

import { InputBox } from '@/@core/components/custom/InputBox'
import type { InputFieldType } from '@/@core/types'

interface TableFilterWithSearchParamsProps<T> {
  filterInfo: Record<keyof T, InputFieldType>
  disabled: boolean
}

/**
 * 필터 입력 시 바로 SearchParams로 설정하는 테이블 필터
 * @param filterInfo 필터에 대한 정보 - Record<keyof T, InputFieldType>
 * @param disabled 필터 비활성화 여부
 * @type 필터 타입 (ex. MemberFilterType, ...)
 * @returns
 */
export default function TableFilterWithSearchParams<T>({ filterInfo, disabled }: TableFilterWithSearchParamsProps<T>) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const setSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)

    params.set(key, value)

    router.replace(pathname + '?' + params.toString())
  }

  return (
    <CardContent>
      <Grid container spacing={3}>
        {Object.keys(filterInfo).map(property => (
          <InputBox
            key={property}
            size='sm'
            tabInfos={filterInfo}
            tabFieldKey={property}
            disabled={disabled}
            value={searchParams.get(property) ?? ''}
            onChange={value => setSearchParam(property, value)}
          />
        ))}
      </Grid>
    </CardContent>
  )
}
