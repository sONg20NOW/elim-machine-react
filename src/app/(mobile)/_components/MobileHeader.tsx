import type { Dispatch, SetStateAction } from 'react'

import { Box, Button, Card, IconButton, Typography } from '@mui/material'

import SearchBar from '@/app/_components/SearchBar'

interface MobileHeaderProps {
  currentPage: 'machine_main' | 'machine_detail' | 'inspection_main' | 'inspection_detail'
  isMobile: boolean
  myProject?: boolean
  setMyProject?: Dispatch<SetStateAction<boolean>>
  setOpenDrawer?: Dispatch<SetStateAction<boolean>>
  totalCount?: number
  setProjectName?: Dispatch<SetStateAction<string>>
  setPage?: Dispatch<SetStateAction<number>>
  disabled?: boolean
}

export default function MobileHeader({
  currentPage,
  isMobile,
  myProject,
  setMyProject,
  setOpenDrawer,
  totalCount,
  setProjectName,
  setPage,
  disabled
}: MobileHeaderProps) {
  if (currentPage === 'machine_main' && setMyProject && setOpenDrawer && setProjectName && setPage) {
    const ProjectToggle = () => (
      <Box
        sx={{
          border: '1px solid lightgray',
          borderRadius: isMobile ? 1 : 10,
          p: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          position: 'relative',
          backgroundColor: 'white'
        }}
      >
        <Card
          sx={{
            position: 'absolute',
            backgroundColor: 'primary.main',
            borderRadius: isMobile ? 1 : 10,
            width: isMobile ? '90%' : '47%',
            height: isMobile ? '45%' : '80%'
          }}
          className={
            isMobile
              ? `left-1 top-[50%] -translate-y-1/2 ${!myProject ? '-translate-y-full' : 'translate-y-0'}`
              : `transition-transform duration-300 ease-in-out left-[50%] top-[50%] -translate-y-1/2 ${
                  !myProject ? '-translate-x-full' : '-translate-x-0'
                }`
          }
        />
        <Button
          onClick={() => setMyProject(false)}
          sx={
            !myProject ? { color: 'white', boxShadow: 2, borderRadius: isMobile ? 1 : 10 } : { color: 'primary.main' }
          }
        >
          전체 현장
        </Button>
        <Button
          onClick={() => setMyProject(true)}
          sx={myProject ? { color: 'white', boxShadow: 2, borderRadius: isMobile ? 1 : 10 } : { color: 'primary.main' }}
        >
          나의 현장
        </Button>
      </Box>
    )

    return (
      <Box
        className={` border-b items-center grid ${isMobile ? 'grid-cols-4 px-4 py-2' : 'grid-cols-3 p-4'}`}
        sx={{ backgroundColor: 'primary.light' }}
      >
        {/* 왼쪽 영역 */}
        <div className={`flex gap-2 ${isMobile ? 'flex-col items-start' : 'overflow-visible items-center'}`}>
          <IconButton sx={{ boxShadow: 3, backgroundColor: 'white' }} onClick={() => setOpenDrawer(true)}>
            <i className='tabler-user' />
          </IconButton>
          {!isMobile && <ProjectToggle />}
        </div>

        {/* 중앙 영역 */}
        <div className={`flex gap-1 items-center justify-center relative ${isMobile ? 'col-span-2' : ''}`}>
          <Typography color='white' variant={isMobile ? 'h4' : 'h3'}>
            {`${myProject ? '내 현장' : '현장 목록'}(${totalCount})`}
          </Typography>
        </div>

        {/* 오른쪽 영역 */}
        <div className='flex justify-end'>
          {isMobile ? (
            <ProjectToggle />
          ) : (
            <SearchBar
              placeholder='이름으로 검색'
              setSearchKeyword={projectName => {
                setProjectName(projectName)
                setPage(0)
              }}
              disabled={disabled}
            />
          )}
        </div>
      </Box>
    )
  }
}
