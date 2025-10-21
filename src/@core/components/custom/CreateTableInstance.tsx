import type { Dispatch, SetStateAction } from 'react'

import type { ColumnDef } from '@tanstack/react-table'

// Third-party Imports
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

interface CreateTableProps<T> {
  data: T[]
  columns: ColumnDef<T, string>[]
  rowSelection: {}
  setRowSelection: Dispatch<SetStateAction<{}>>
  pageSize: number
}

export default function CreateTableInstance<T>({
  data,
  columns,
  rowSelection,
  setRowSelection,
  pageSize
}: CreateTableProps<T>) {
  // 필터 함수
  const filterFns = {
    fuzzy: (row: { getValue: (arg0: any) => any }, columnId: any, filterValue: string) => {
      const value = row.getValue(columnId)

      return value?.toString().toLowerCase().includes(filterValue.toLowerCase())
    }
  }

  // columns에 번호 추가.
  // const columnsWithOrder = [
  //   createColumnHelper().accessor('order', {
  //     header: '번호',
  //     cell: ({ row }: { row: { index: number } }) => row.index + 1
  //   }),
  //   ...columns
  // ]

  const table = useReactTable({
    data: data,
    columns,
    getSortedRowModel: getSortedRowModel(),
    manualFiltering: true,
    manualPagination: true,
    filterFns,
    state: {
      rowSelection
    },
    initialState: {
      pagination: {
        pageSize: pageSize
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel()
  })

  return table
}
