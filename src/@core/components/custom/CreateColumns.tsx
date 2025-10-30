// Third-party Imports
import type { ReactNode } from 'react'
import { useMemo } from 'react'

function createColumnHelper<T>() {
  return {
    accessor: (
      id: keyof T,
      options: {
        header: string
        cell: ({ row }: { row: { original: T; index: number } }) => ReactNode
        id: keyof T
      }
    ) => ({
      ...options,
      accessorKey: id
    })
  }
}

/**
 * 칼럼 생성 함수
 *
 * row.original = 해당 행의 원본 데이터 객체
 * @param id
 * 컬럼의 키로 사용되는 값
 * @param header
 * 테이블 헤더 텍스트
 * @returns
 */
function ColumnAccessor<T>(id: keyof T, header: string) {
  return createColumnHelper<T>().accessor(id, {
    header,
    cell: ({ row }: { row: { original: T; index: number } }) => (
      <div className='flex items-center gap-2'>
        {typeof row.original[id] === 'object' && row.original[id] !== null
          ? JSON.stringify(row.original[id])
          : String(row.original[id])}
      </div>
    ),
    id
  })
}

/**
 *
 * @param headerList
 * header에 대한 정보가 담긴 객체 Record<keyof T, string> (ex. {memberId: 'ID', roleDescription: '권한'})
 * @returns
 */
export default function CreateColumns<T>(headerList: Record<keyof T, string>) {
  const columns = useMemo(
    () =>
      (Object.keys(headerList) as Array<keyof typeof headerList>).map(key => ColumnAccessor<T>(key, headerList[key])),
    [headerList]
  )

  return columns
}
