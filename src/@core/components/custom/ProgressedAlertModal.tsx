import type { Dispatch, SetStateAction } from 'react'

import { Button, Dialog, DialogActions, DialogTitle, Typography } from '@mui/material'

import { IconAlertCircleFilled } from '@tabler/icons-react'

interface AlertModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  handleConfirm: () => void
  title?: string
  subtitle?: string
  confirmMessage?: string
}

export default function ProgressedAlertModal({
  open,
  setOpen,
  handleConfirm,
  title,
  subtitle,
  confirmMessage
}: AlertModalProps) {
  const handleClose = () => setOpen(false)

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='xs'>
      {/* Icon Title */}
      <DialogTitle sx={{ textAlign: 'center', display: 'grid' }}>
        <IconAlertCircleFilled size={40} className='text-red-400 mx-auto mb-3' />

        <Typography variant='inherit'>{title ?? '지금까지 수정한 내용이 저장되지 않습니다.'}</Typography>

        <Typography variant='subtitle1'>{subtitle ?? '그래도 나가시겠습니까?'}</Typography>
      </DialogTitle>

      {/* Buttons */}
      <DialogActions>
        <Button variant='contained' className='bg-color-warning hover:bg-color-warning-light' onClick={handleConfirm}>
          {confirmMessage ?? '저장하지 않음'}
        </Button>

        <Button variant='contained' color='secondary' onClick={handleClose}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  )
}
