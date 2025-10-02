import { useState, type ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import { Box, Button, Drawer, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material'

import { auth } from '@/lib/auth'
import { handleApiError } from '@/utils/errorHandler'

interface MobileHeaderProps {
  left: ReactNode
  title: string
  right?: ReactNode
}

export default function MobileHeader({ left, title, right }: MobileHeaderProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [open, setOpen] = useState(false)
  const router = useRouter()

  // ! 나중에 accessToken 디코딩해서 실제 정보로
  const currentUser = {
    name: '테스트슈퍼관리자20',
    gradeDescription: '보조',
    engineerLicenseNum: '259-1004',
    companyName: '엘림주식회사(주)'
  }

  const handleLogout = async () => {
    try {
      // ! CSRF token 같이 넣어서 POST
      await auth.post(`/api/authentication/web/logout`)
    } catch (e) {
      handleApiError(e)
    } finally {
      localStorage.removeItem('accessToken')
      router.push('/login')
    }
  }

  return (
    <>
      {/* Drawer 부분 */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: { sx: { width: isMobile ? '80%' : '40%', borderTopRightRadius: 8, borderBottomRightRadius: 8 } },
          root: { sx: { position: 'relative' } }
        }}
        anchor='left'
      >
        <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', right: 0, top: 0 }}>
          <i className='tabler-x text-white' />
        </IconButton>
        <Box>
          <Box sx={{ backgroundColor: 'primary.light', p: 2 }}>
            {/* ! 유저 이미지로 변경 */}
            <div className='w-[70px] h-[70px] bg-white rounded-full m-3'>
              <i className='tabler-user text-[70px]' />
            </div>
            <div className='flex gap-2'>
              <Typography variant='h4' color='white'>
                {`[${currentUser.gradeDescription}] ${currentUser.name}`}
              </Typography>
            </div>
            <Typography variant='h5' color='white' sx={{ fontWeight: 300 }}>
              {currentUser.companyName}
            </Typography>

            <Typography variant='h5' color='white' sx={{ fontWeight: 300 }}>
              수첩발급번호: {currentUser.engineerLicenseNum}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 5, mt: 5 }}>
          <Button
            fullWidth
            sx={{ display: 'flex', justifyContent: 'start', boxShadow: 4, color: 'dimgray', borderColor: 'dimgray' }}
            variant='outlined'
            onClick={() => handleLogout()}
          >
            <i className='tabler-logout text-[30px]' />
            <Typography variant='h4' sx={{ fontWeight: 600, marginLeft: 2 }} color='inherit'>
              로그아웃
            </Typography>
          </Button>
        </Box>
      </Drawer>
      {/* 헤더 부분 */}
      <Box
        className={` border-b items-center grid ${isMobile ? 'grid-cols-4 px-4 py-2' : 'grid-cols-3 p-4'}`}
        sx={{ backgroundColor: 'primary.light' }}
      >
        {/* 왼쪽 영역 */}
        <div className={`flex gap-5 ${isMobile ? 'flex-col items-start' : 'overflow-visible items-center'}`}>
          <IconButton sx={{ boxShadow: 3, backgroundColor: 'white' }} onClick={() => setOpen(true)}>
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
    </>
  )
}
