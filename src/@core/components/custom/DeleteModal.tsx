import { useState, type Dispatch, type SetStateAction } from 'react'

import { Button, Dialog, DialogActions, DialogTitle, Typography } from '@mui/material'

import { IconAlertCircleFilled } from '@tabler/icons-react'

interface DeleteModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onDelete: () => Promise<void>
  title?: string
}

export default function DeleteModal({ open, setOpen, onDelete, title }: DeleteModalProps) {
  const [loading, setLoading] = useState(false)

  const handleClose = () => setOpen(false)

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='xs'>
      {/* Title */}
      <DialogTitle sx={{ textAlign: 'center' }}>
        <IconAlertCircleFilled size={40} className='text-red-400 mx-auto' />
        <Typography component={'div'} variant='inherit'>
          {title ?? '정말 삭제하시겠습니까?'}
        </Typography>
        <Typography component={'div'} variant='subtitle1'>
          삭제 후에는 되돌리지 못합니다.
        </Typography>
      </DialogTitle>

      {/* Buttons */}
      <DialogActions>
        <Button
          variant='contained'
          className='bg-color-warning disabled:bg-color-warning-light hover:bg-color-warning-light'
          onClick={async () => {
            setLoading(true)
            await onDelete()
          }}
          disabled={loading}
        >
          삭제
        </Button>

        <Button variant='contained' color='secondary' onClick={handleClose}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  )
}
