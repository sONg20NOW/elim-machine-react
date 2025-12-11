import { useContext, useEffect, useState, type ReactNode } from 'react'

import { Box, Typography } from '@mui/material'

import { isMobileContext } from '@/@core/contexts/mediaQueryContext'

interface MobileHeaderProps {
  left?: ReactNode
  title: ReactNode | string
  right?: ReactNode
  widerCenter?: boolean
}

export default function MobileHeader({ left, title, right, widerCenter = false }: MobileHeaderProps) {
  const [mobile, setMobile] = useState(true)
  const isMobile = useContext(isMobileContext)

  useEffect(() => {
    setMobile(isMobile ?? true)
  }, [isMobile])

  return (
    isMobile && (
      <>
        {/* 헤더 부분 */}
        <Box
          className={`items-center grid ${mobile || widerCenter ? 'grid-cols-4' : 'grid-cols-3'} ${mobile ? 'px-4 py-2' : 'p-4'}`}
          sx={{
            backgroundColor: 'primary.light',
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.0))'
          }}
        >
          {/* 왼쪽 영역 */}
          <div
            className={`flex justify-between gap-1 ${mobile ? 'flex-col items-start' : 'overflow-visible items-center'}`}
          >
            {left}
          </div>

          {/* 중앙 영역 */}
          <div
            className={`flex gap-1 items-center justify-center relative ${mobile || widerCenter ? 'col-span-2' : ''}`}
          >
            {typeof title === 'string' ? (
              <Typography color='white' variant={mobile ? 'h4' : 'h3'}>
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
  )
}
