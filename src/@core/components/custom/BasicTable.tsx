import { type Dispatch, type SetStateAction, type MouseEvent, useContext, useState } from 'react'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import classNames from 'classnames'

import { Checkbox, Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'

import type { HeaderType, SortInfoType } from '@/@core/types'
import { isMobileContext, isTabletContext } from './ProtectedPage'

interface BasicTableProps<T> {
  header: HeaderType<T>
  data: T[]
  RowRightClickMenu?: { iconClass: string; label: string; handleClick: (row: T) => void }[]
  handleRowClick: (row: T) => Promise<void>
  page: number
  pageSize: number
  sorting: SortInfoType<T>
  setSorting: Dispatch<SetStateAction<SortInfoType<T>>>
  multiException?: Partial<Record<keyof T, Array<keyof T>>>
  listException?: Array<keyof T>
  loading: boolean
  error: boolean
  showCheckBox?: boolean
  isChecked?: (item: T) => boolean
  handleCheckItem?: (item: T) => void
  handleCheckAllItems?: (checked: boolean) => void
  onClickPicCount?: (row: T) => void
}

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
  RowRightClickMenu,
  handleRowClick,
  page,
  pageSize,
  sorting,
  setSorting,
  multiException,
  listException,
  loading,
  error,
  showCheckBox = false,
  isChecked,
  handleCheckItem,
  handleCheckAllItems,
  onClickPicCount
}: BasicTableProps<T>) {
  const isTablet = useContext(isTabletContext)
  const isMobile = useContext(isMobileContext)

  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; row: T } | null>(null)

  const handleContextMenu = (event: MouseEvent, rowInfo: T) => {
    event.preventDefault()
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            row: rowInfo
          }
        : // 닫힌 상태에서 다시 열릴 때 위치를 재설정하여 메뉴가 제대로 표시되도록 함
          null
    )
  }

  const handleClose = () => {
    setContextMenu(null)
  }

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
    <TableContainer sx={{ overflowX: 'auto' }} className='px-2'>
      <Table aria-label='simple table' className='relative'>
        <TableHead className='select-none'>
          <TableRow>
            {showCheckBox && handleCheckAllItems && (
              <TableCell padding='checkbox'>
                <Checkbox
                  onChange={e => {
                    const checked = e.target.checked

                    handleCheckAllItems(checked)
                  }}
                />
              </TableCell>
            )}
            {!isTablet && (
              <TableCell align='center' key='order' className='font-medium text-base'>
                번호
              </TableCell>
            )}
            {Object.keys(header).map(key => {
              const k = key as keyof T

              return (
                <TableCell
                  size={isMobile ? 'small' : 'medium'}
                  key={key}
                  align='center'
                  className={classNames(
                    'relative text-base',
                    {
                      'cursor-pointer hover:underline': !(loading || error) && header[k].canSort,
                      'font-bold select-none': header[k].canSort,
                      'font-medium': !header[k].canSort
                    },
                    { hidden: isTablet && header[k].hideOnTablet }
                  )}
                  sx={isTablet ? { p: 0, py: 2, px: 1 } : {}}
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
          {data.map((info, index) => {
            return (
              <TableRow
                hover={true}
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                className='cursor-pointer'
                onClick={() => {
                  if (contextMenu) return

                  if (!showCheckBox) {
                    handleRowClick(info)
                  } else if (handleCheckItem) {
                    handleCheckItem(info)
                  }
                }}
                onContextMenu={e => {
                  RowRightClickMenu && handleContextMenu(e, info)
                }}
              >
                {contextMenu && (
                  <Menu
                    open={contextMenu !== null}
                    onClose={handleClose}
                    anchorReference='anchorPosition'
                    anchorPosition={
                      contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
                    }
                  >
                    <MenuItem
                      onClick={() => handleRowClick(contextMenu.row)}
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <ListItemIcon className='grid place-items-center'>
                        <i className={`tabler-exclamation-circle-filled text-blue-500`} />
                      </ListItemIcon>
                      <Typography variant='h5'>{contextMenu.row['machineProjectName' as keyof T]}</Typography>
                    </MenuItem>
                    <Divider />
                    {RowRightClickMenu?.map(v => (
                      <MenuItem
                        sx={{ display: 'flex', alignItems: 'center' }}
                        key={v.label}
                        onClick={() => {
                          v.handleClick(contextMenu.row)
                          setContextMenu(null)
                        }}
                      >
                        <ListItemIcon className='grid place-items-center'>
                          <i className={`${v.iconClass} text-gray-500`} />
                        </ListItemIcon>
                        <Typography variant='h6' className='text-gray-500'>
                          {v.label}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                )}
                {showCheckBox && isChecked && (
                  <TableCell size={isMobile ? 'small' : 'medium'} padding='checkbox'>
                    <Checkbox checked={isChecked(info)} />
                  </TableCell>
                )}
                {!isTablet && (
                  <TableCell size={isMobile ? 'small' : 'medium'} align='center' key={'order'}>
                    <Typography>{page * pageSize + index + 1}</Typography>
                  </TableCell>
                )}

                {Object.keys(header).map(property => {
                  const key = property as keyof T

                  let content: string | undefined = ''

                  if (!Object.keys(header).includes(property)) {
                    // header 속성에 포함되지 않다면 출력 x & 예외 출력
                    return null
                  } else if (multiException && Object.keys(multiException).includes(property)) {
                    // MultiException 예외 처리
                    const key = property as keyof typeof multiException

                    const pieces = multiException[key]?.map(value =>
                      value === 'latestProjectEndDate' ? info[value]?.toString().slice(5) : info[value]
                    )

                    content = pieces?.join(key === 'age' ? '  ' : ' ~ ')
                  } else if (listException && listException.includes(key)) {
                    // ListException 처리
                    const list = info[key] as string[]

                    // 세 개 이상일 경우 외 (length - 2) 로 처리
                    content =
                      list.length < 3
                        ? list.join(', ')
                        : list
                            .slice(0, 2)
                            .join(', ')
                            .concat(` 외 ${list.length - 2}`)
                  } else {
                    if (key === 'remark') {
                      content = info[key]
                        ?.toString()
                        .slice(0, 3)
                        .concat(info[key]?.toString().length > 3 ? '..' : '')
                    } else {
                      content = info[key] as string
                    }
                  }

                  return (
                    !(isTablet && header[key].hideOnTablet) && (
                      <TableCell
                        size={isMobile ? 'small' : 'medium'}
                        key={key.toString()}
                        align='center'
                        sx={isTablet ? { p: 0, py: 2, px: 1 } : {}}
                      >
                        {/* 사진의 경우 클릭 가능하도록 */}
                        <Typography
                          onClick={e => {
                            if (key === 'machinePicCount' && onClickPicCount) {
                              e.stopPropagation()
                              onClickPicCount(info)
                            }
                          }}
                          sx={{
                            ...(key === 'machinePicCount' && {
                              color: 'primary.main',
                              ':hover': { textDecoration: 'underline' }
                            })
                          }}
                        >
                          {content}
                        </Typography>
                      </TableCell>
                    )
                  )
                })}
              </TableRow>
            )
          })}
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
