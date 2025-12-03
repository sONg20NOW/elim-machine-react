import { useCallback, useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import { useParams } from 'next/navigation'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material'

import classNames from 'classnames'

import { toast } from 'react-toastify'

import { Controller, useForm } from 'react-hook-form'

import ImageZoom from 'react-image-zooom'

import { createPortal } from 'react-dom'

import { IconCircleCaretLeftFilled, IconCircleCaretRightFilled } from '@tabler/icons-react'

import type {
  MachineInspectionDetailResponseDtoType,
  MachinePicPresignedUrlResponseDtoType,
  MachinePicUpdateResponseDtoType
} from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import getS3Key from '@/@core/utils/getS3Key'
import { useGetInspectionsSimple } from '@/@core/hooks/customTanstackQueries'
import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import { auth } from '@/lib/auth'
import AlertModal from '@/@core/components/custom/AlertModal'

interface InspectionPicZoomModalProps {
  MovePicture?: (dir: 'next' | 'previous') => void
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  selectedPic: MachinePicPresignedUrlResponseDtoType
  selectedInspection: MachineInspectionDetailResponseDtoType
  setPictures: Dispatch<SetStateAction<MachinePicPresignedUrlResponseDtoType[]>>
}

// ! 확대 기능 구현, 현재 리스트에 있는 목록 슬라이드로 이동 가능 기능 구현, 사진 정보 수정 기능 구현(이름 수정은 연필로)
export default function InspectionPicZoomModal({
  MovePicture,
  open,
  setOpen,
  selectedPic,
  selectedInspection,
  setPictures
}: InspectionPicZoomModalProps) {
  const machineProjectId = useParams().id?.toString() as string

  const showMovePicBtns = useMediaQuery('(min-width:1755px)')

  const [openAlert, setOpenAlert] = useState(false)
  const proceedingJob = useRef<() => void>()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isDirty, dirtyFields },
    setValue,
    getValues,
    watch
  } = useForm<MachinePicUpdateResponseDtoType & { machineInspectionId: number }>({
    defaultValues: {
      ...selectedPic
    }
  })

  const watchedSubItemId = watch('machineChecklistSubItemId')
  const watchedAlternativeSubTitle = watch('alternativeSubTitle')

  const [machineChecklistItemId, setMachineChecklistItemId] = useState(selectedPic.machineChecklistItemId)
  const [presignedUrl, setPresignedUrl] = useState(selectedPic.presignedUrl)

  // 사진 정보 수정을 위한 상태관리
  const [urlInspectionId, setUrlInspectionId] = useState(selectedPic.machineInspectionId)
  const [saving, setSaving] = useState(false)

  const { data: inspectionList } = useGetInspectionsSimple(machineProjectId)

  const cameraInputRef = useRef<HTMLInputElement>(null)

  const isMobile = useContext(isMobileContext)

  const formName = 'inspection-pic-form'

  useEffect(() => {
    reset(selectedPic)
    setPresignedUrl(selectedPic.presignedUrl)
    setMachineChecklistItemId(selectedPic.machineChecklistItemId)
    setUrlInspectionId(selectedPic.machineInspectionId)
  }, [selectedPic, reset])

  const onChangeImage = async (file: File) => {
    if (!watchedSubItemId) {
      toast.error('하위항목을 선택해주세요')

      return
    }

    const S3KeyResult = await getS3Key(
      machineProjectId,
      [file],
      getValues().machineInspectionId.toString(),
      machineChecklistItemId,
      getValues().machineChecklistSubItemId,
      undefined
    )

    if (!S3KeyResult) return

    setPresignedUrl(URL.createObjectURL(file))
    setValue('s3Key', S3KeyResult[0].s3Key, { shouldDirty: true })
  }

  const handleSave = async (data: MachinePicUpdateResponseDtoType) => {
    if (!watchedSubItemId) {
      toast.error('하위항목을 선택해주세요')

      return
    }

    const updateRequest = dirtyFields.s3Key ? data : { ...data, s3Key: null }

    try {
      setSaving(true)

      const response = await auth
        .put<{
          data: MachinePicUpdateResponseDtoType
        }>(
          `/api/machine-projects/${machineProjectId}/machine-inspections/${urlInspectionId}/machine-pics/${selectedPic.machinePicId}`,
          updateRequest
        )
        .then(v => v.data.data)

      reset(response)
      setUrlInspectionId(response.machineInspectionId)

      handleSuccess('사진 정보가 변경되었습니다.')
      setPictures(prev =>
        prev.map(v =>
          v.machinePicId === selectedPic.machinePicId ? { ...v, ...response, presignedUrl: presignedUrl } : v
        )
      )
    } catch (error) {
      handleApiError(error)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleDontSave = useCallback(() => {
    proceedingJob.current && proceedingJob.current()
    setOpenAlert(false)
  }, [])

  return (
    inspectionList && (
      <form className='hidden' onSubmit={handleSubmit(handleSave)} id={formName}>
        <style>
          {`#imageZoom {
              object-fit: contain;
              height: 100%;
            }`}
        </style>
        {showMovePicBtns &&
          MovePicture &&
          open &&
          createPortal(
            <>
              <IconButton
                sx={theme => ({ zIndex: theme.zIndex.modal + 1 })}
                className='fixed left-10 top-1/2'
                onClick={() => {
                  if (isDirty) {
                    proceedingJob.current = () => MovePicture('previous')
                    setOpenAlert(true)
                  } else {
                    MovePicture('previous')
                  }
                }}
              >
                <IconCircleCaretLeftFilled size={50} color='white' />
              </IconButton>
              <IconButton
                sx={theme => ({ zIndex: theme.zIndex.modal + 1 })}
                className='fixed right-10 top-1/2'
                onClick={() => {
                  if (isDirty) {
                    proceedingJob.current = () => MovePicture('next')
                    setOpenAlert(true)
                  } else {
                    MovePicture('next')
                  }
                }}
              >
                <IconCircleCaretRightFilled size={50} color='white' />
              </IconButton>
            </>,
            document.body
          )}
        <Dialog
          maxWidth='xl'
          fullWidth
          open={open}
          onClose={(_, reason) => {
            if (reason === 'backdropClick') return
            handleClose()
          }}
        >
          <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', pb: 2 }}>
            <TextField
              {...register('originalFileName')}
              variant='standard'
              fullWidth
              label='설비사진명'
              size='small'
              sx={{ width: '30%' }}
              slotProps={{
                htmlInput: {
                  sx: {
                    fontWeight: 700,
                    fontSize: isMobile ? 20 : 24
                  }
                }
              }}
              id='new-picture-name-input'
            />
            <IconButton
              type='button'
              sx={{ height: 'fit-content', position: 'absolute', top: 5, right: 5 }}
              size='small'
              onClick={handleClose}
            >
              <i className='tabler-x' />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '60dvh' }}>
            <div
              className={classNames('flex gap-4 w-full h-full', {
                'flex-col': isMobile
              })}
            >
              <div className='flex-1 flex flex-col gap-2 w-full items-center h-full border-4 p-2 rounded-lg bg-gray-300'>
                <div className='flex gap-2 self-end'>
                  <Button sx={{ width: 'fit-content' }} variant='contained' className='bg-blue-500 hover:bg-blue-600'>
                    다운로드
                  </Button>
                  <Button sx={{ width: 'fit-content' }} color='error' variant='contained'>
                    삭제
                  </Button>
                  <Button
                    type='button'
                    sx={{
                      color: 'white',
                      boxShadow: 10,
                      backgroundColor: 'primary.dark',
                      zIndex: 5
                    }}
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    사진 변경
                  </Button>
                </div>
                <ImageZoom src={presignedUrl} alt={watchedAlternativeSubTitle} />
              </div>
              <Box>
                <Grid2 sx={{ marginTop: 2, width: { xs: 'full', sm: 400 } }} container spacing={4} columns={2}>
                  <Grid2 size={2}>
                    <Controller
                      name='machineInspectionId'
                      control={control}
                      render={({ field }) => (
                        <>
                          <InputLabel>설비명</InputLabel>
                          <TextField
                            select
                            value={field.value}
                            onChange={v => {
                              field.onChange(Number(v.target.value))
                              setMachineChecklistItemId(0)
                              setValue('machineChecklistSubItemId', 0, { shouldDirty: true })
                            }}
                            hiddenLabel
                            size='small'
                            fullWidth
                          >
                            {inspectionList?.map(v => (
                              <MenuItem key={v.id} value={v.id}>
                                {v.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </>
                      )}
                    />
                  </Grid2>
                  <Grid2 size={2}>
                    <InputLabel>점검항목</InputLabel>

                    <TextField
                      select
                      hiddenLabel
                      size='small'
                      fullWidth
                      value={machineChecklistItemId}
                      onChange={e => setMachineChecklistItemId(Number(e.target.value))}
                    >
                      {selectedInspection.machineChecklistItemsWithPicCountResponseDtos?.map(v => (
                        <MenuItem key={v.machineChecklistItemId} value={v.machineChecklistItemId}>
                          {v.machineChecklistItemName}
                        </MenuItem>
                      )) ?? <MenuItem></MenuItem>}
                    </TextField>
                  </Grid2>
                  <Grid2 size={2}>
                    <Controller
                      name='machineChecklistSubItemId'
                      control={control}
                      render={({ field }) => (
                        <>
                          <InputLabel>하위항목</InputLabel>
                          <TextField
                            select
                            value={field.value}
                            onChange={e => field.onChange(Number(e.target.value))}
                            hiddenLabel
                            size='small'
                            fullWidth
                          >
                            {selectedInspection.machineChecklistItemsWithPicCountResponseDtos
                              .find(v => v.machineChecklistItemId === machineChecklistItemId)
                              ?.checklistSubItems.map(v => (
                                <MenuItem key={v.machineChecklistSubItemId} value={v.machineChecklistSubItemId}>
                                  {v.checklistSubItemName}
                                </MenuItem>
                              )) ?? <MenuItem></MenuItem>}
                          </TextField>
                        </>
                      )}
                    />
                  </Grid2>
                  <Grid2 size={2}>
                    <InputLabel>대체타이틀</InputLabel>

                    <TextField
                      {...register('alternativeSubTitle')}
                      placeholder='대체타이틀을 입력해주세요'
                      hiddenLabel
                      size='small'
                      fullWidth
                    />
                  </Grid2>
                  <Grid2 size={2}>
                    <InputLabel>측정값</InputLabel>

                    <TextField
                      {...register('measuredValue')}
                      placeholder='측정값을 입력해주세요'
                      hiddenLabel
                      size='small'
                      fullWidth
                    />
                  </Grid2>
                  <Grid2 size={2}>
                    <InputLabel>비고</InputLabel>

                    <TextField
                      placeholder='비고는 보고서에 포함되지 않습니다'
                      {...register('remark')}
                      minRows={3}
                      multiline
                      fullWidth
                      hiddenLabel
                    />
                  </Grid2>
                </Grid2>
              </Box>
            </div>
          </DialogContent>
          <DialogActions>
            <div className='flex items-end gap-4'>
              <Typography color={isDirty ? 'error.main' : 'warning.main'}>
                {!isDirty ? '변경사항이 없습니다' : !watchedSubItemId && '※하위항목을 지정해주세요'}
              </Typography>
              <Button
                sx={{ width: 'fit-content' }}
                variant='contained'
                type='submit'
                form={formName}
                disabled={!isDirty || !watchedSubItemId || saving}
                color='success'
              >
                저장
              </Button>
            </div>
          </DialogActions>
          <input
            type='file'
            accept='image/*'
            className='hidden'
            ref={cameraInputRef}
            onChange={e => {
              if (!e.target.files) return

              const files = Array.from(e.target.files)

              onChangeImage(files[0])
            }}
          />
        </Dialog>
        <AlertModal open={openAlert} setOpen={setOpenAlert} handleConfirm={handleDontSave} />
      </form>
    )
  )
}
