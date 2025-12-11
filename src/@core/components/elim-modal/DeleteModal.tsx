import type { Dispatch, SetStateAction } from 'react'

import AlertModal from './AlertModal'

interface DeleteModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onDelete: () => Promise<void>
  title?: string
}

const DeleteModal = ({ open, setOpen, onDelete, title }: DeleteModalProps) => (
  <AlertModal
    open={open}
    setOpen={setOpen}
    handleConfirm={onDelete}
    title={title ?? '정말 삭제하시겠습니까?'}
    subtitle={'삭제 후에는 되돌리지 못합니다.'}
    confirmMessage='삭제'
  />
)

export default DeleteModal
