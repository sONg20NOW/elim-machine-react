import type { MouseEvent } from 'react'
import { useCallback, useContext, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import classNames from 'classnames'

import type { TableCellProps } from '@mui/material'
import { Checkbox, Divider, ListItemIcon, Menu, MenuItem, styled, TableCell, Typography } from '@mui/material'

import { IconCaretDownFilled, IconCaretUpFilled, IconExclamationCircleFilled } from '@tabler/icons-react'

import type { HeaderType } from '@core/types'
import { isMobileContext, isTabletContext } from './ProtectedPage'
import useCurrentUserStore from '@core/utils/useCurrentUserStore'

const StyledTableCell = styled(TableCell)<TableCellProps>({ padding: 14 })

interface BasicTableProps<T> {
  header: HeaderType<T>
  data?: T[]
  handleRowClick: (row: T) => Promise<void>
  page: number
  pageSize: number
  loading: boolean
  error: boolean
  multiException?: Partial<Record<keyof T, Array<keyof T>>>
  listException?: Array<keyof T>
  showCheckBox?: boolean
  isChecked?: (item: T) => boolean
  handleCheckItem?: (item: T) => void
  handleCheckAllItems?: (checked: boolean) => void
  onClickPicCount?: (row: T) => void
  rightClickMenuHeader?: (contextMenu: { mouseX: number; mouseY: number; row: T }) => string
  rightClickMenu?: { icon: JSX.Element; label: string; handleClick: (row: T) => void }[]
}

/**
 * @type 데이터 배열 요소의 타입
 * @param header* 테이블 헤더 정보 (ex. {name: {label: '이름', canSort: true}, ...})
 * @param data*
 * @param handleRowClick*
 * @param page*
 * @param pageSize*
 * @param loading*
 * @param error*
 * @param multiException 하나의 column에 여러 데이터 표시 예외처리
 * @param listException 리스트 타입의 데이터 예외처리
 * @param isChecked 체크박스 prop
 * @param showCheckBox 체크박스 prop
 * @param handleCheckItem 체크박스 prop
 * @param handleCheckAllItems 체크박스 prop
 * @param rightClickMenuHeader 우클릭 prop: 우클릭 시 보이는 헤더의 문자열을 반환하는 함수
 * @param rightClickMenu 우클릭 prop: 우클릭 시 보이는 메뉴별 아이콘, 이름, 클릭 함수
 * @param onClickPicCount 테이블의 picCount 클릭 동작 함수
 *
 * @returns prop으로 받은 테이블 정보로 테이블 생성
 */
export default function BasicTable<T extends Record<keyof T, string | number | string[]>>({
  header,
  data,
  rightClickMenuHeader,
  rightClickMenu,
  handleRowClick,
  page,
  pageSize,
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
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const sort = searchParams.get('sort')?.split(',')

  const currentUserId = useCurrentUserStore(set => set.currentUser)?.memberId

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

  const handleSorting = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams)

      if (!sort) {
        params.set('sort', `${key},asc`)
      } else if (sort[0] === key) {
        switch (sort[1]) {
          case 'asc':
            params.set('sort', `${key},desc`)
            break
          case 'desc':
            params.delete('sort')
            break
          default:
            break
        }
      } else {
        params.set('sort', `${key},asc`)
      }

      router.replace(pathname + '?' + params.toString())
    },
    [sort, searchParams, router, pathname]
  )

  return (
    <TableContainer
      sx={{
        mx: 2,
        width: theme => `calc(100% - ${theme.spacing(4)})`,
        border: '1px solid lightgray',
        overflowY: 'auto',
        maxHeight: '100%'
      }}
    >
      <Table stickyHeader aria-label='simple table' sx={{ position: 'relative', height: '100%' }}>
        <TableHead className='select-none'>
          <TableRow sx={{ zIndex: '2' }}>
            {showCheckBox && handleCheckAllItems && (
              <StyledTableCell>
                <Checkbox
                  sx={{ padding: 0 }}
                  onChange={e => {
                    const checked = e.target.checked

                    handleCheckAllItems(checked)
                  }}
                />
              </StyledTableCell>
            )}
            {!isTablet && (
              <StyledTableCell align='center' key='order' className='font-medium text-base'>
                번호
              </StyledTableCell>
            )}
            {Object.keys(header).map(key => {
              const k = key as keyof T

              return (
                <StyledTableCell
                  size={isMobile ? 'small' : 'medium'}
                  key={key}
                  align='center'
                  className={classNames(
                    'text-base',
                    {
                      'cursor-pointer hover:underline': !(loading || error) && header[k].canSort,
                      'font-bold select-none': header[k].canSort,
                      'font-medium': !header[k].canSort
                    },
                    { hidden: isTablet && header[k].hideOnTablet }
                  )}
                  sx={isTablet ? { p: 0, py: 2, px: 1 } : {}}
                  onClick={!(loading || error) && header[k].canSort ? () => handleSorting(key) : undefined}
                >
                  {header[k].label}
                  {header[k].canSort &&
                    sort &&
                    sort[0] === k &&
                    (sort[1] === 'desc' ? (
                      <IconCaretDownFilled color='gray' className='absolute text-xl top-[50%] -translate-y-1/2' />
                    ) : (
                      <IconCaretUpFilled color='gray' className='absolute text-xl top-[50%] -translate-y-1/2' />
                    ))}
                </StyledTableCell>
              )
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            new Array(3)
              .fill(0)
              .map((_, idx) => idx)
              .map(v => (
                <TableRow sx={{ zIndex: 0 }} key={v} className='animate-pulse'>
                  {['번호'].concat(Object.keys(header)).map(header => (
                    <StyledTableCell key={header}>
                      <div className='h-[22px] w-full grid place-items-center'>
                        <div className='h-2 w-full rounded bg-gray-300'></div>
                      </div>
                    </StyledTableCell>
                  ))}
                </TableRow>
              ))
          ) : data && data.length > 0 ? (
            data.map((info, index) => {
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
                    rightClickMenu && handleContextMenu(e, info)
                  }}
                >
                  {contextMenu && (
                    <Menu
                      slotProps={{ paper: { sx: { boxShadow: 'var(--mui-customShadows-sm)' } } }}
                      open={contextMenu !== null}
                      onClose={handleClose}
                      anchorReference='anchorPosition'
                      anchorPosition={
                        contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
                      }
                    >
                      {
                        <MenuItem
                          onClick={() => {
                            handleRowClick(contextMenu.row)
                            handleClose()
                          }}
                          sx={{ display: 'flex', alignItems: 'center', px: 3 }}
                        >
                          {rightClickMenuHeader && (
                            <div className='flex gap-2'>
                              <ListItemIcon className='grid place-items-center'>
                                <IconExclamationCircleFilled size={26} className='text-blue-500' />
                              </ListItemIcon>
                              <Typography variant='h5'>{rightClickMenuHeader(contextMenu)}</Typography>
                            </div>
                          )}
                        </MenuItem>
                      }
                      <Divider />
                      {rightClickMenu?.map(v => (
                        <MenuItem
                          sx={{ display: 'flex', alignItems: 'center' }}
                          key={v.label}
                          onClick={() => {
                            v.handleClick(contextMenu.row)
                            setContextMenu(null)
                          }}
                        >
                          <ListItemIcon className='grid place-items-center'>{v.icon}</ListItemIcon>
                          <Typography variant='h6' className='text-gray-500'>
                            {v.label}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Menu>
                  )}
                  {showCheckBox && isChecked && (
                    <StyledTableCell size={isMobile ? 'small' : 'medium'}>
                      <Checkbox
                        sx={{ padding: 0 }}
                        disabled={(info as any)?.memberId === currentUserId}
                        checked={isChecked(info)}
                      />
                    </StyledTableCell>
                  )}
                  {!isTablet && (
                    <StyledTableCell size={isMobile ? 'small' : 'medium'} align='center' key={'order'}>
                      <Typography>{page * pageSize + index + 1}</Typography>
                    </StyledTableCell>
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
                        <StyledTableCell
                          size={isMobile ? 'small' : 'medium'}
                          key={key?.toString()}
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
                        </StyledTableCell>
                      )
                    )
                  })}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <StyledTableCell
                colSpan={Object.keys(header).length + 1}
                className='text-center'
                variant='body'
                sx={{ ...(error && { color: 'error.main' }) }}
              >
                {error ? '데이터를 불러오는 데 실패했습니다.' : '데이터가 없습니다.'}
              </StyledTableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
