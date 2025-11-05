import type { Dispatch, SetStateAction } from 'react'

import { Button } from '@mui/material'

import DefaultModal from './DefaultModal'

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
  return (
    <DefaultModal
      size='xs'
      open={showAlertModal}
      setOpen={setShowAlertModal}
      title={'변경사항이\n저장되지 않았습니다'}
      headerDescription={`지금까지 수정한 내용이 저장되지 않습니다.\n그래도 나가시겠습니까?`}
      primaryButton={
        <Button
          variant='contained'
          className='bg-color-warning hover:bg-color-warning-light'
          onClick={() => {
            setEditData(JSON.parse(JSON.stringify(originalData)))
            setShowAlertModal(false)
            setIsEditing(false)
            onQuit && onQuit()
          }}
          type='submit'
        >
          저장하지 않음
        </Button>
      }
      secondaryButton={
        <Button variant='contained' color='secondary' type='reset' onClick={() => setShowAlertModal(false)}>
          취소
        </Button>
      }
    />
  )
}
