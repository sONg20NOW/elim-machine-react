// Third-party Imports
import classnames from 'classnames'
import { flexRender } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

interface TableProps<T> {
  table: Table<T>
  data: T[]
  loading: boolean
  handleRowClick: (row: T) => void
}

export function CustomizedTable<T>({ table, data, loading, handleRowClick }: TableProps<T>) {
  return (
    <div className='overflow-x-auto'>
      <table className={tableStyles.table}>
        {/* 헤더 */}
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {/* 오름차순, 내림차순 토글 */}
                  {header.isPlaceholder ? null : (
                    <div
                      key={header.id}
                      className={classnames({
                        'flex items-center': header.column.getIsSorted(),
                        'cursor-pointer select-none': header.column.getCanSort()
                      })}
                      onClick={() => {
                        header.column.toggleSorting()
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {
                        <i
                          className={
                            {
                              none: '',
                              asc: 'tabler-chevron-up text-xl',
                              desc: 'tabler-chevron-down text-xl'
                            }[String(header.column.getIsSorted() ? header.column.getIsSorted() : 'none')] ?? ''
                          }
                        />
                      }
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        {/* 바디 */}
        {data.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                {loading ? 'Loading...' : 'No data available'}
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {data.map((row, index) => {
              const tableRow = table.getRowModel().rows[index]

              if (!tableRow) return null

              return (
                <tr
                  key={index}
                  className={classnames({ selected: tableRow.getIsSelected() }, 'cursor-pointer hover:bg-gray-50')}
                  onClick={() => handleRowClick(row)}
                >
                  {tableRow.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        )}
      </table>
    </div>
  )
}
