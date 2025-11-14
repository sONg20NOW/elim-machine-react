import { useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

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
  Typography
} from '@mui/material'

import classNames from 'classnames'

import { Controller, useForm } from 'react-hook-form'

import type { MachineProjectPicReadResponseDtoType, MachineProjectPicUpdateRequestDtoType } from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import getS3Key from '@/@core/utils/getS3Key'
import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import { auth } from '@/lib/auth'
import { MACHINE_PROJECT_PICTURE_TYPE } from '@/app/_constants/MachineProjectPictureCategory'

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

  return (
    <form onSubmit={handleSubmit(handleSave)} id='picture-form'>
      <Dialog
        maxWidth='xl'
        fullWidth
        open={open}
        onClose={() => {
          setOpen(false)
        }}
      >
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
          <div className='flex justify-between'>
            <div className='flex gap-4 items-center'>
              <IconButton
                type='button'
                sx={{ height: 'fit-content', position: 'absolute', top: 5, right: 5 }}
                size='small'
                onClick={() => setOpen(false)}
              >
                <i className='tabler-x' />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div
            className={classNames('flex gap-4 w-full', {
              'flex-col': isMobile
            })}
          >
            {MovePicture && (
              <div
                className='grid place-items-center'
                onClick={() => {
                  if (isDirty) {
                    proceedingJob.current = () => MovePicture('previous')
                    setOpenAlert(true)
                  } else {
                    MovePicture('previous')
                  }
                }}
              >
                <IconButton>
                  <i className='tabler-chevron-compact-left size-[30px] text-gray-600' />
                </IconButton>
              </div>
            )}

            <div className='flex-1 flex flex-col gap-2 w-full items-start relative border-4 p-2 rounded-lg border-[1px solid lightgray]'>
              <TextField
                {...register('originalFileName')}
                variant='standard'
                fullWidth
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
              <img
                src={presignedUrl}
                alt={watchedOriginalFileName}
                style={{
                  width: '100%',
                  minHeight: '50dvh',
                  maxHeight: '60dvh',
                  objectFit: 'contain'
                }}
              />
              <Button
                type='button'
                sx={{
                  color: 'white',
                  boxShadow: 10,
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  backgroundColor: 'primary.dark'
                }}
                onClick={() => cameraInputRef.current?.click()}
              >
                사진 변경
              </Button>
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
                          {MACHINE_PROJECT_PICTURE_TYPE.map(v => (
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
            {MovePicture && (
              <div
                className='grid place-items-center'
                onClick={() => {
                  if (isDirty) {
                    proceedingJob.current = () => MovePicture('next')
                    setOpenAlert(true)
                  } else {
                    MovePicture('next')
                  }
                }}
              >
                <IconButton>
                  <i className='tabler-chevron-compact-right size-[30px] text-gray-600' />
                </IconButton>
              </div>
            )}
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
              form='picture-form'
              disabled={!isDirty || !watchedMachineProjectPicType || saving}
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
      {
        <Dialog open={openAlert}>
          <DialogTitle sx={{ position: 'relative' }}>
            <div className='flex gap-2 text-xl items-center'>
              <i className='tabler-alert-triangle' />
              <Typography variant='inherit'>변경사항이 저장되지 않았습니다</Typography>
            </div>
          </DialogTitle>
          <DialogActions>
            <Button
              type='button'
              variant='contained'
              color='error'
              onClick={() => {
                proceedingJob.current && proceedingJob.current()
                setOpenAlert(false)
              }}
            >
              저장하지 않음
            </Button>
            <Button type='button' variant='contained' color='secondary' onClick={() => setOpenAlert(false)}>
              계속 수정
            </Button>
          </DialogActions>
        </Dialog>
      }
    </form>
  )
}
