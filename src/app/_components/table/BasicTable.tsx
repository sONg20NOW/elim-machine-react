import type { Dispatch, SetStateAction } from 'react'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import classNames from 'classnames'

import type { HeaderType, SortInfoType } from '@/app/_type/types'

/**
 * @param header
 * 테이블 헤더를 정의 (ex. {name: {label: '이름', canSort: true}, ...})
 * @type HeaderTpye<T>
 * @param listException
 * 리스트 데이터를 가진 데이터를 표시
 * @param multiException
 * 해당 열에 표시할 데이터 객체
 * @param headerTextSize
 * (optional) 헤더의 텍스트 크기 (tailwind className)
 *
 * (ex. {age: ['age', 'genderDescription']}) => 나이 항목에 나이와 성별을 동시에 표시.
 * @returns
 */
export default function BasicTable<T extends Record<keyof T, string | number | string[]>>({
  header,
  data,
  handleRowClick,
  page,
  pageSize,
  sorting,
  setSorting,
  multiException,
  listException,
  loading,
  error
}: {
  header: HeaderType<T>
  data: T[]
  handleRowClick: (row: T) => Promise<void>
  page: number
  pageSize: number
  sorting: SortInfoType<T>
  setSorting: Dispatch<SetStateAction<SortInfoType<T>>>
  multiException?: Partial<Record<keyof T, Array<keyof T>>>
  listException?: Array<keyof T>
  loading: boolean
  error: boolean
}) {
  function toggleOrder(key: string) {
    // 로딩이 끝나고 에러가 없으면 not disabled
    if (key !== sorting.target) {
      setSorting({ target: key as keyof T, sort: 'asc' })
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
    <TableContainer className='px-2'>
      <Table sx={{ minWidth: 650 }} aria-label='simple table' className='relative'>
        <TableHead className='select-none'>
          <TableRow>
            <TableCell align='center' key='order' className={'font-medium text-base'}>
              번호
            </TableCell>
            {Object.keys(header).map(key => {
              const k = key as keyof T

              return (
                <TableCell
                  key={key}
                  align='center'
                  className={classNames('relativetext-base', {
                    'cursor-pointer hover:underline': !(loading || error) && header[k].canSort,
                    'font-bold select-none': header[k].canSort,
                    'font-medium': !header[k].canSort
                  })}
                  onClick={!(loading || error) && header[k].canSort ? () => toggleOrder(key) : undefined}
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
          {data.map((info, index) => (
            <TableRow
              hover={true}
              onClick={() => handleRowClick(info)}
              key={index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              className='cursor-pointer'
            >
              <TableCell align='center' key={'order'}>
                {page * pageSize + index + 1}
              </TableCell>
              {Object.keys(header).map(property => {
                const key = property as keyof T

                // header 속성에 포함되지 않다면 출력 x & 예외 출력
                if (!Object.keys(header).includes(property)) return null
                else if (multiException && Object.keys(multiException).includes(property)) {
                  const key = property as keyof typeof multiException

                  const pieces = multiException[key]?.map(value =>
                    value === 'latestProjectEndDate' ? info[value]?.toString().slice(5) : info[value]
                  )

                  return (
                    <TableCell key={key.toString()} align='center'>
                      {pieces?.join(key === 'age' ? '  ' : ' ~ ')}
                    </TableCell>
                  )
                } else if (listException && listException.includes(key)) {
                  const list = info[key] as string[]

                  // 세 개 이상일 경우 외 ... 로 처리
                  return (
                    <TableCell key={key.toString()} align='center'>
                      {list.length < 3 ? list.join(', ') : list.slice(0, 2).join(', ').concat(' 외 ...')}
                    </TableCell>
                  )
                } else {
                  return (
                    <TableCell key={key.toString()} align='center'>
                      {key === 'remark'
                        ? info[key]
                            ?.toString()
                            .slice(0, 3)
                            .concat(info[key]?.toString().length > 3 ? '..' : '')
                        : info[key]}
                    </TableCell>
                  )
                }
              })}
            </TableRow>
          ))}
        </TableBody>

        {/* 전달된 데이터가 없을 때 */}
        {data.length === 0 && (
          <caption className='text-center py-5'>
            {loading ? 'Loading...' : error ? '데이터를 불러오는 데 실패했습니다.' : '데이터가 없습니다.'}
          </caption>
        )}
      </Table>
    </TableContainer>
  )
}
