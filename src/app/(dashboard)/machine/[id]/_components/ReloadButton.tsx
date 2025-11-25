'use client'

import { useRef, useState } from 'react'

import { IconButton, Snackbar, Tooltip, Typography } from '@mui/material'
import { IconReload } from '@tabler/icons-react'

interface ReloadButtonProps {
  handleClick: (() => Promise<void>) | (() => void)
  tooltipText?: string
}

export default function ReloadButton({ handleClick, tooltipText = '새로고침' }: ReloadButtonProps) {
  const reloadIconRef = useRef<HTMLDivElement>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)

  function handleOpenSnackbar() {
    setOpenSnackbar(true)
  }

  function handleCloseSnackbar() {
    setOpenSnackbar(false)
  }

  return (
    <>
      <Tooltip arrow title={tooltipText}>
        <IconButton
          onClick={async () => {
            if (!reloadIconRef.current || reloadIconRef.current.classList.contains('animate-spin')) return

            reloadIconRef.current.classList.add('animate-spin')
            setTimeout(() => {
              reloadIconRef.current?.classList.remove('animate-spin')
            }, 1000)
            await handleClick()
            handleOpenSnackbar()
          }}
          disabled={reloadIconRef.current?.classList.contains('animate-spin')}
        >
          <div ref={reloadIconRef} className='grid place-items-center'>
            <IconReload className='text-lime-600' />
          </div>
        </IconButton>
      </Tooltip>
      <Snackbar
        slotProps={{
          transition: { sx: { display: 'grid', placeItems: 'center', minWidth: '0 !important' } }
        }}
        open={openSnackbar}
        autoHideDuration={1000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={
          <Typography color='white' variant='subtitle1'>
            새로고침 완료
          </Typography>
        }
      />
    </>
  )
}
