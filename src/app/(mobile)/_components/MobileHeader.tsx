import { type ReactNode } from 'react'

import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'

interface MobileHeaderProps {
  left?: ReactNode
  title: ReactNode | string
  right?: ReactNode
}

export default function MobileHeader({ left, title, right }: MobileHeaderProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <>
      {/* 헤더 부분 */}
      <Box
        className={`items-center grid ${isMobile ? 'grid-cols-4 px-4 py-2' : 'grid-cols-3 p-4'}`}
        sx={{
          backgroundColor: 'primary.light',
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.0))'
        }}
      >
        {/* 왼쪽 영역 */}
        <div
          className={`flex justify-between gap-1 ${isMobile ? 'flex-col items-start' : 'overflow-visible items-center'}`}
        >
          {left}
        </div>

        {/* 중앙 영역 */}
        <div className={`flex gap-1 items-center justify-center relative ${isMobile ? 'col-span-2' : ''}`}>
          {typeof title === 'string' ? (
            <Typography color='white' variant={isMobile ? 'h4' : 'h3'}>
              {title}
            </Typography>
          ) : (
            title
          )}
        </div>

        {/* 오른쪽 영역 */}
        <div className='flex justify-end'>{right}</div>
      </Box>
    </>
  )
}
