import { useState, type Dispatch, type SetStateAction } from 'react'

import { Dialog, DialogContent, DialogTitle, IconButton, Typography, useMediaQuery } from '@mui/material'

import type { MachinePicPresignedUrlResponseDtoType } from '@/app/_type/types'

interface PictureZoomModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  selectedPic: MachinePicPresignedUrlResponseDtoType
}

// ! 확대 기능 구현, 현재 리스트에 있는 목록 슬라이드로 이동 가능 기능 구현, 사진 정보 수정 기능 구현(이름 수정은 연필로)
export default function PictureZoomModal({ open, setOpen, selectedPic }: PictureZoomModalProps) {
  const [editData, setEditData] = useState<MachinePicPresignedUrlResponseDtoType>(
    JSON.parse(JSON.stringify(selectedPic))
  )

  const [isEditingPicName, setIsEditingPicName] = useState(false)

  // 반응형을 위한 미디어쿼리
  const isMobile = useMediaQuery('(max-width:600px)')

  return (
    <Dialog maxWidth='xl' open={open} onClose={() => setOpen(false)}>
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className='flex gap-1'>
          <Typography sx={{ fontWeight: 700, fontSize: isMobile ? 20 : 24 }}>{selectedPic.originalFileName}</Typography>
          <IconButton
            onClick={() => {
              if (isEditingPicName) {
                const projectNameInputElement = document.getElementById('projectNameInput') as HTMLInputElement

                handleChangeProjectName(projectNameInputElement.value)
              }

              setIsEditingPicName(prev => !prev)
            }}
          >
            <i className='tabler-pencil' />
          </IconButton>
        </div>
        <Typography>{`[${selectedPic.machineCategoryName}] ${selectedPic.machineChecklistItemName} - ${selectedPic.machineChecklistSubItemName}`}</Typography>
      </DialogTitle>
      <DialogContent>
        <img
          src={selectedPic.presignedUrl}
          alt={selectedPic.originalFileName}
          style={{
            width: '100%',
            height: '50%',
            objectFit: 'cover'
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
