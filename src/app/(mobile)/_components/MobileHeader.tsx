import { useContext, type ReactNode } from 'react'

import { Box, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material'

import { DrawerContext } from '../check/page'

interface MobileHeaderProps {
  left: ReactNode
  title: string
  right?: ReactNode
}

export default function MobileHeader({ left, title, right }: MobileHeaderProps) {
  const openDrawer = useContext(DrawerContext).openDrawer

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box
      className={` border-b items-center grid ${isMobile ? 'grid-cols-4 px-4 py-2' : 'grid-cols-3 p-4'}`}
      sx={{ backgroundColor: 'primary.light' }}
    >
      {/* 왼쪽 영역 */}
      <div className={`flex gap-5 ${isMobile ? 'flex-col items-start' : 'overflow-visible items-center'}`}>
        <IconButton sx={{ boxShadow: 3, backgroundColor: 'white' }} onClick={() => openDrawer()}>
          <i className='tabler-user' />
        </IconButton>
        {left}
      </div>

      {/* 중앙 영역 */}
      <div className={`flex gap-1 items-center justify-center relative ${isMobile ? 'col-span-2' : ''}`}>
        <Typography color='white' variant={isMobile ? 'h4' : 'h3'}>{`${title}`}</Typography>
      </div>

      {/* 오른쪽 영역 */}
      <div className='flex justify-end'>{right}</div>
    </Box>
  )
}
