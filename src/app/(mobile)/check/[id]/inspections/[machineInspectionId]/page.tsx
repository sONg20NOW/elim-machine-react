'use client'

import { useRouter } from 'next/navigation'

import { Box, IconButton } from '@mui/material'

import MobileHeader from '@/app/(mobile)/_components/MobileHeader'

export default function CheckInspectionDetailPage() {
  const router = useRouter()
  const inspectionName = '설비명'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <MobileHeader
        left={
          <IconButton sx={{ p: 0 }} onClick={() => router.back()}>
            <i className='tabler-chevron-left text-white text-3xl' />
          </IconButton>
        }
        title={`${inspectionName}`}
      />
    </Box>
  )
}
