import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material'

import axios from 'axios'

import classNames from 'classnames'

import { toast } from 'react-toastify'

import type {
  MachineInspectionDetailResponseDtoType,
  MachineInspectionPageResponseDtoType,
  MachinePicPresignedUrlResponseDtoType,
  MachinePicUpdateResponseDtoType,
  successResponseDtoType
} from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

interface PictureZoomModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  selectedPic: MachinePicPresignedUrlResponseDtoType
  reloadPics: () => void
  machineProjectId: string
  selectedInspection: MachineInspectionDetailResponseDtoType
  refetchSelectedInspection?: () => Promise<void>
}

// ! 확대 기능 구현, 현재 리스트에 있는 목록 슬라이드로 이동 가능 기능 구현, 사진 정보 수정 기능 구현(이름 수정은 연필로)
export default function PictureZoomModal({
  open,
  setOpen,
  selectedPic,
  reloadPics,
  machineProjectId,
  selectedInspection,
  refetchSelectedInspection
}: PictureZoomModalProps) {
  const [editData, setEditData] = useState<MachinePicPresignedUrlResponseDtoType>(
    JSON.parse(JSON.stringify(selectedPic))
  )

  const [inspectionList, setInspectionList] = useState<MachineInspectionPageResponseDtoType[]>([])

  useEffect(() => {
    if (open) setEditData(JSON.parse(JSON.stringify(selectedPic)))
  }, [open, selectedPic])

  const [isEditingPicName, setIsEditingPicName] = useState(false)

  // 반응형을 위한 미디어쿼리
  const isMobile = useMediaQuery('(max-width:600px)')

  // 설비목록 가져오기
  const getInspectionList = useCallback(async () => {
    try {
      const response = await axios.get<{ data: successResponseDtoType<MachineInspectionPageResponseDtoType[]> }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections`
      )

      setInspectionList(response.data.data.content)
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId])

  useEffect(() => {
    getInspectionList()
  }, [getInspectionList])

  const handleSave = useCallback(async () => {
    if (!editData.machineChecklistItemId) {
      toast.error('점검항목과 하위항목을 선택해주세요')

      return
    }

    if (!editData.machineChecklistSubItemId) {
      toast.error('하위항목을 선택해주세요')

      return
    }

    try {
      const response = await axios.put<{ data: MachinePicUpdateResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedPic.machineInspectionId}/machine-pics/${selectedPic.machinePicId}`,
        editData
      )

      const updatedData = response.data.data

      reloadPics()
      if (refetchSelectedInspection) refetchSelectedInspection()
      setEditData(prev => ({ ...prev, ...updatedData }))
      handleSuccess('사진 정보가 변경되었습니다.')
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId, selectedPic, reloadPics, refetchSelectedInspection, editData])

  useEffect(() => setEditData(JSON.parse(JSON.stringify(selectedPic))), [selectedPic])

  return (
    <Dialog
      maxWidth='xl'
      open={open}
      onClose={() => {
        setOpen(false)
        setIsEditingPicName(false)
      }}
    >
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className='flex gap-1'>
          {!isEditingPicName ? (
            <Typography sx={{ fontWeight: 700, fontSize: isMobile ? 20 : 24 }}>{editData.originalFileName}</Typography>
          ) : (
            <TextField
              variant='standard'
              fullWidth
              size='small'
              slotProps={{
                htmlInput: {
                  sx: {
                    fontWeight: 700,
                    fontSize: isMobile ? 20 : 24
                  }
                }
              }}
              id='new-picture-name-input'
              value={editData.originalFileName}
              onChange={e => setEditData(prev => ({ ...prev, originalFileName: e.target.value }))}
            />
          )}
          <IconButton
            onClick={() => {
              setIsEditingPicName(prev => !prev)
            }}
          >
            {!isEditingPicName ? <i className='tabler-pencil' /> : <i className='tabler-check' />}
          </IconButton>
          {isEditingPicName && (
            <IconButton
              color='error'
              onClick={() => {
                setEditData(prev => ({ ...prev, originalFileName: selectedPic.originalFileName }))
                setIsEditingPicName(false)
              }}
            >
              <i className='tabler-x' />
            </IconButton>
          )}
        </div>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div
          className={classNames('flex gap-4', {
            'flex-col': isMobile
          })}
        >
          <img
            src={editData.presignedUrl}
            alt={editData.originalFileName}
            style={{
              width: '100%',
              height: '50%',
              objectFit: 'cover',
              maxWidth: isMobile ? '' : 1000
            }}
          />
          <Box>
            <Grid2 sx={{ marginTop: 2, width: { xs: 'full', sm: 400 } }} container spacing={4} columns={2}>
              <Grid2 size={2}>
                <TextField
                  select
                  value={editData.machineInspectionId ?? ''}
                  onChange={e =>
                    setEditData(prev => ({
                      ...prev,
                      machineInspectionId: Number(e.target.value),
                      machineChecklistSubItemId: null,
                      machineChecklistItemId: null
                    }))
                  }
                  label='설비명'
                  size='small'
                  fullWidth
                >
                  {inspectionList.map(v => (
                    <MenuItem key={v.machineInspectionId} value={v.machineInspectionId}>
                      {v.machineInspectionName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 size={2}>
                <TextField
                  select
                  value={editData.machineChecklistItemId ?? ''}
                  onChange={e =>
                    setEditData(prev => ({
                      ...prev,
                      machineChecklistSubItemId: null,
                      machineChecklistItemId: Number(e.target.value)
                    }))
                  }
                  label='점검항목'
                  size='small'
                  fullWidth
                >
                  {selectedInspection.machineChecklistItemsWithPicCountResponseDtos?.map(v => (
                    <MenuItem key={v.machineChecklistItemId} value={v.machineChecklistItemId}>
                      {v.machineChecklistItemName}
                    </MenuItem>
                  )) ?? <MenuItem></MenuItem>}
                </TextField>
              </Grid2>
              <Grid2 size={2}>
                <TextField
                  select
                  value={editData.machineChecklistSubItemId ?? ''}
                  onChange={e => setEditData(prev => ({ ...prev, machineChecklistSubItemId: Number(e.target.value) }))}
                  label='하위항목'
                  size='small'
                  fullWidth
                >
                  {selectedInspection.machineChecklistItemsWithPicCountResponseDtos
                    .find(v => v.machineChecklistItemId === editData.machineChecklistItemId)
                    ?.checklistSubItems.map(v => (
                      <MenuItem key={v.machineChecklistSubItemId} value={v.machineChecklistSubItemId}>
                        {v.checklistSubItemName}
                      </MenuItem>
                    )) ?? <MenuItem></MenuItem>}
                </TextField>
              </Grid2>
              <Grid2 size={2}>
                <TextField
                  label='대체타이틀'
                  size='small'
                  fullWidth
                  value={editData.alternativeSubTitle ?? ''}
                  onChange={e => setEditData(prev => ({ ...prev, alternativeSubTitle: e.target.value }))}
                />
              </Grid2>
              <Grid2 size={2}>
                <TextField
                  label='측정값'
                  size='small'
                  fullWidth
                  value={editData.measuredValue ?? ''}
                  onChange={e => setEditData(prev => ({ ...prev, measuredValue: e.target.value }))}
                />
              </Grid2>
            </Grid2>
          </Box>
        </div>
        <TextField
          minRows={3}
          multiline
          fullWidth
          label='비고'
          value={editData.remark ?? ''}
          onChange={e => setEditData(prev => ({ ...prev, remark: e.target.value }))}
        />
      </DialogContent>
      <DialogActions>
        <Button variant='contained' onClick={() => handleSave()}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  )
}
