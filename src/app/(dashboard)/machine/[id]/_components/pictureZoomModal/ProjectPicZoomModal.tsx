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

import { Controller, useForm } from 'react-hook-form'

import ImageZoom from 'react-image-zooom'

import { IconCircleCaretLeftFilled, IconCircleCaretRightFilled } from '@tabler/icons-react'

import { createPortal } from 'react-dom'

import type { MachineProjectPicReadResponseDtoType, MachineProjectPicUpdateRequestDtoType } from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import getS3Key from '@/@core/utils/getS3Key'
import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import { auth } from '@/lib/auth'
import { projectPicOption } from '@/app/_constants/options'
import AlertModal from '@/@core/components/custom/AlertModal'

interface ProjectPicZoomModalProps {
  MovePicture?: (dir: 'next' | 'previous') => void
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  selectedPic: MachineProjectPicReadResponseDtoType
  setPictures: Dispatch<SetStateAction<MachineProjectPicReadResponseDtoType[]>>
}

// ! 확대 기능 구현, 현재 리스트에 있는 목록 슬라이드로 이동 가능 기능 구현, 사진 정보 수정 기능 구현(이름 수정은 연필로)
export default function ProjectPicZoomModal({
  MovePicture,
  open,
  setOpen,
  selectedPic,
  setPictures
}: ProjectPicZoomModalProps) {
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
    watch
  } = useForm<MachineProjectPicUpdateRequestDtoType>({
    defaultValues: {
      ...selectedPic
    }
  })

  const watchedMachineProjectPicType = watch('machineProjectPicType')
  const watchedOriginalFileName = watch('originalFileName')

  const [presignedUrl, setPresignedUrl] = useState(selectedPic.presignedUrl)
  const [saving, setSaving] = useState(false)

  const cameraInputRef = useRef<HTMLInputElement>(null)

  // 반응형을 위한 미디어쿼리
  const isMobile = useContext(isMobileContext)

  const formName = 'project-pic-form'

  useEffect(() => {
    reset(selectedPic)
    setPresignedUrl(selectedPic.presignedUrl)
  }, [selectedPic, reset])

  const onChangeImage = async (file: File) => {
    const S3KeyResult = await getS3Key(
      machineProjectId,
      [file],
      undefined,
      undefined,
      undefined,
      watchedMachineProjectPicType
    )

    if (!S3KeyResult) return

    setPresignedUrl(URL.createObjectURL(file))
    setValue('s3Key', S3KeyResult[0].s3Key, { shouldDirty: true })
  }

  const handleSave = async (data: MachineProjectPicUpdateRequestDtoType) => {
    const updateRequest = dirtyFields.s3Key ? data : { ...data, s3Key: null }

    try {
      setSaving(true)

      const response = await auth
        .put<{
          data: MachineProjectPicUpdateRequestDtoType
        }>(`/api/machine-projects/${machineProjectId}/machine-project-pics/${selectedPic.id}`, updateRequest)
        .then(v => v.data.data)

      reset(response)

      handleSuccess('사진 정보가 변경되었습니다.')
      setPictures(prev =>
        prev.map(v => (v.id === selectedPic.id ? { ...v, ...response, presignedUrl: presignedUrl } : v))
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
              <IconCircleCaretRightFilled color='white' size={50} />
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
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
          <TextField
            {...register('originalFileName')}
            variant='standard'
            fullWidth
            label='현장사진명'
            size='small'
            sx={{ width: '50%' }}
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
              <ImageZoom src={presignedUrl} alt={watchedOriginalFileName} zoom={200} />
            </div>
            <Box>
              <Grid2 sx={{ marginTop: 2, width: { xs: 'full', sm: 400 } }} container spacing={4} columns={2}>
                <Grid2 size={2}>
                  <Controller
                    name='machineProjectPicType'
                    control={control}
                    render={({ field }) => (
                      <>
                        <InputLabel>사진 종류</InputLabel>
                        <TextField
                          select
                          value={field.value}
                          onChange={v => {
                            field.onChange(v.target.value)
                          }}
                          hiddenLabel
                          size='small'
                          fullWidth
                        >
                          {projectPicOption.map(v => (
                            <MenuItem key={v.value} value={v.value}>
                              {v.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </>
                    )}
                  />
                </Grid2>
                <Grid2 size={2}>
                  <InputLabel>비고</InputLabel>

                  <TextField
                    {...register('remark')}
                    placeholder='비고를 입력해주세요'
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
              {!isDirty ? '변경사항이 없습니다' : !watchedMachineProjectPicType && '※사진종류를 지정해주세요'}
            </Typography>
            <Button
              sx={{ width: 'fit-content' }}
              variant='contained'
              type='submit'
              form={formName}
              disabled={!isDirty || !watchedMachineProjectPicType || saving}
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
}
