import type { Dispatch, SetStateAction } from 'react'

import { Button, Dialog, DialogActions, DialogTitle, Typography } from '@mui/material'

import { IconAlertCircleFilled } from '@tabler/icons-react'

interface AlertModalProps {
  showAlertModal: boolean
  setShowAlertModal: Dispatch<SetStateAction<boolean>>
  handleDontSave: () => void
}

export default function ProgressedAlertModal({ showAlertModal, setShowAlertModal, handleDontSave }: AlertModalProps) {
  const handleClose = () => setShowAlertModal(false)

  return (
    <Dialog open={showAlertModal} onClose={handleClose} fullWidth maxWidth='xs'>
      {/* Icon Title */}
      <DialogTitle sx={{ textAlign: 'center' }}>
        <IconAlertCircleFilled size={40} className='text-red-400 mx-auto' />
        <Typography variant='inherit'>지금까지 수정한 내용이 저장되지 않습니다.</Typography>
        <Typography variant='inherit'>그래도 나가시겠습니까?</Typography>
      </DialogTitle>

      {/* Buttons */}
      <DialogActions>
        <Button variant='contained' className='bg-color-warning hover:bg-color-warning-light' onClick={handleDontSave}>
          저장하지 않음
        </Button>

        <Button variant='contained' color='secondary' onClick={handleClose}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  )
}
