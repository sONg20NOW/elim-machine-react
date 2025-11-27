import type { Dispatch, SetStateAction } from 'react'

import { Button, Dialog, DialogActions, DialogTitle, Typography } from '@mui/material'

import { IconAlertCircleFilled } from '@tabler/icons-react'

interface AlertModalProps<T> {
  showAlertModal: boolean
  setShowAlertModal: Dispatch<SetStateAction<boolean>>
  setEditData: Dispatch<SetStateAction<T>>
  setIsEditing: (isEditing: boolean) => void
  originalData: T
  onQuit?: () => void
}

export default function AlertModal<T>({
  showAlertModal,
  setShowAlertModal,
  setEditData,
  setIsEditing,
  originalData,
  onQuit
}: AlertModalProps<T>) {
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
        <Button
          variant='contained'
          className='bg-color-warning hover:bg-color-warning-light'
          onClick={() => {
            setEditData(structuredClone(originalData))
            setShowAlertModal(false)
            setIsEditing(false)
            onQuit && onQuit()
          }}
        >
          저장하지 않음
        </Button>

        <Button variant='contained' color='secondary' onClick={handleClose}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  )
}
