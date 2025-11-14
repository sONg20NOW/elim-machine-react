import { useState, type Dispatch, type SetStateAction } from 'react'

import { Button } from '@mui/material'

import DefaultModal from './DefaultModal'

interface DeleteModalProps {
  showDeleteModal: boolean
  setShowDeleteModal: Dispatch<SetStateAction<boolean>>
  onDelete: () => Promise<void>
  title?: string
}

export default function DeleteModal({ showDeleteModal, setShowDeleteModal, onDelete, title }: DeleteModalProps) {
  const [loading, setLoading] = useState(false)

  return (
    <DefaultModal
      size='xs'
      open={showDeleteModal}
      setOpen={setShowDeleteModal}
      title={title ?? '정말 삭제하시겠습니까?'}
      headerDescription='삭제 후에는 되돌리지 못합니다.'
      primaryButton={
        <Button
          variant='contained'
          className='bg-color-warning disabled:bg-color-warning-light hover:bg-color-warning-light'
          onClick={async () => {
            setLoading(true)
            await onDelete()
          }}
          type='submit'
          disabled={loading}
        >
          삭제
        </Button>
      }
      secondaryButton={
        <Button variant='contained' color='secondary' type='reset' onClick={() => setShowDeleteModal(false)}>
          취소
        </Button>
      }
    />
  )
}
