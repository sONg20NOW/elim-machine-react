import type { Dispatch, SetStateAction } from 'react'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import classNames from 'classnames'

import type { HeaderType, SortInfoType } from '@/app/_schema/types'

/**
 * @param header
 * 테이블 헤더를 정의 (ex. {name: {label: '이름', canSort: true}, ...})
 * @type HeaderTpye<T>
 * @param Exceptions
 * 기본적으로 데이터의 해당되는 속성만 row에 표시하는데, 다르게 표시할 속성들을 정의
 *
 * (ex. {age: ['age', 'genderDescription']}) => 나이 항목에 나이와 성별을 동시에 표시.
 * @returns
 */
export default function BasicTable<T extends Record<string, string | number>>({
  header,
  data,
  handleRowClick,
  page,
  pageSize,
  sorting,
  setSorting,
  Exceptions,
  disabled = false
}: {
  header: HeaderType<T>
  data: T[]
  handleRowClick: (row: T) => Promise<void>
  page: number
  pageSize: number
  sorting: SortInfoType<T>
  setSorting: Dispatch<SetStateAction<SortInfoType<T>>>
  Exceptions?: Partial<Record<keyof T, Array<keyof T>>>
  disabled?: boolean
}) {
  function toggleOrder(key: string) {
    if (key !== sorting.target) {
      setSorting({ target: key, sort: 'asc' })
    } else {
      switch (sorting.sort) {
        case '':
          setSorting({ ...sorting, sort: 'asc' })
          break
        case 'asc':
          setSorting({ ...sorting, sort: 'desc' })
          break
        case 'desc':
          setSorting({ ...sorting, sort: '' })
          break
        default:
          break
      }
    }
  }

  return (
    <TableContainer className='rounded-t-lg p-2'>
      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
        <TableHead className='select-none'>
          <TableRow>
            <TableCell align='center' key='order' className='font-medium text-base'>
              번호
            </TableCell>
            {Object.keys(header).map(key => {
              const k = key as keyof T

              return (
                <TableCell
                  key={key}
                  align='center'
                  className={classNames('font-medium relative text-base', {
                    'cursor-pointer hover:underline': !disabled,
                    'font-extrabold select-none': header[k].canSort
                  })}
                  onClick={!disabled && header[k].canSort ? () => toggleOrder(key) : undefined}
                >
                  <div className='flex'></div>
                  <span>{header[k].label}</span>
                  {header[k].canSort && sorting.target === k && (
                    <i
                      className={classNames('absolute text-xl top-[30%] text-color-primary-dark', {
                        'tabler-square-chevron-down': sorting.sort === 'desc',
                        'tabler-square-chevron-up': sorting.sort === 'asc'
                      })}
                    />
                  )}
                </TableCell>
              )
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((user, index) => (
            <TableRow
              hover={true}
              onClick={() => handleRowClick(user)}
              key={index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              className='cursor-pointer'
            >
              <TableCell align='center' key={'order'}>
                {page * pageSize + index + 1}
              </TableCell>
              {Object.keys(user).map(property => {
                const key = property as keyof T

                // header 속성에 포함되지 않다면 출력 x & 예외 출력
                if (!Object.keys(header).includes(property)) return null
                else if (Exceptions && Object.keys(Exceptions).includes(property)) {
                  const pieces = Exceptions[property]?.map(value => user[value])
                  const output = pieces?.join('  ')

                  return (
                    <TableCell key={key.toString()} align='center'>
                      {output}
                    </TableCell>
                  )
                } else {
                  return (
                    <TableCell key={key.toString()} align='center'>
                      {user[key]}
                    </TableCell>
                  )
                }
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// 원본 형식
// <TableContainer component={Paper}>
//   <Table sx={{ minWidth: 650 }} aria-label='simple table'>
//     <TableHead>
//       <TableRow>
//         <TableCell>Dessert (100g serving)</TableCell>
//         <TableCell align='right'>Calories</TableCell>
//         <TableCell align='right'>Fat&nbsp;(g)</TableCell>
//         <TableCell align='right'>Carbs&nbsp;(g)</TableCell>
//         <TableCell align='right'>Protein&nbsp;(g)</TableCell>
//       </TableRow>
//     </TableHead>
//     <TableBody>
//       {rows.map(row => (
//         <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
//           <TableCell component='th' scope='row'>
//             {row.name}
//           </TableCell>
//           <TableCell align='right'>{row.calories}</TableCell>
//           <TableCell align='right'>{row.fat}</TableCell>
//           <TableCell align='right'>{row.carbs}</TableCell>
//           <TableCell align='right'>{row.protein}</TableCell>
//         </TableRow>
//       ))}
//     </TableBody>
//   </Table>
// </TableContainer>
