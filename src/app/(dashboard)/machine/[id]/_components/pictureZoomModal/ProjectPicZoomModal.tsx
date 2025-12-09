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
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material'

import classNames from 'classnames'

import { useForm } from 'react-hook-form'

import ImageZoom from 'react-image-zooom'

import { IconCircleCaretLeftFilled, IconCircleCaretRightFilled, IconX } from '@tabler/icons-react'

import { createPortal } from 'react-dom'

import type {
  MachineProjectPicReadResponseDtoType,
  MachineProjectPicUpdateRequestDtoType,
  ProjectPicType
} from '@/@core/types'
import { handleApiError, handleSuccess } from '@/@core/utils/errorHandler'
import getS3Key from '@/@core/utils/getS3Key'
import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import { auth } from '@/@core/utils/auth'
import { projectPicOption } from '@/app/_constants/options'
import AlertModal from '@/@core/components/custom/AlertModal'
import TextInputBox from '@/@core/components/inputbox/TextInputBox'
import MultiInputBox from '@/@core/components/inputbox/MultiInputBox'
import DeleteModal from '@/@core/components/custom/DeleteModal'

interface formType {
  originalFileName: string
  machineProjectPicType: ProjectPicType
  remark: string
}

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
  const [openDelete, setOpenDelete] = useState(false)
  const proceedingJob = useRef<() => void>()

  const form = useForm<formType>({
    defaultValues: {
      originalFileName: selectedPic.originalFileName ?? '',
      machineProjectPicType: selectedPic.machineProjectPicType ?? '',
      remark: selectedPic.remark ?? ''
    }
  })

  useEffect(() => {
    form.reset({
      originalFileName: selectedPic.originalFileName ?? '',
      machineProjectPicType: selectedPic.machineProjectPicType ?? '',
      remark: selectedPic.remark ?? ''
    })
  }, [form, selectedPic.id, selectedPic.originalFileName, selectedPic.machineProjectPicType, selectedPic.remark])

  const isDirty = form.formState.isDirty

  const watchedMachineProjectPicType = form.watch('machineProjectPicType')
  const watchedOriginalFileName = form.watch('originalFileName')

  const [loading, setLoading] = useState(false)

  const cameraInputRef = useRef<HTMLInputElement>(null)

  // 반응형을 위한 미디어쿼리
  const isMobile = useContext(isMobileContext)

  const formName = 'project-pic-form'

  const onChangeImage = async (file: File) => {
    try {
      setLoading(true)

      const S3KeyResult = await getS3Key(
        machineProjectId,
        [file],
        undefined,
        undefined,
        undefined,
        watchedMachineProjectPicType
      )

      if (!S3KeyResult) return

      const presignedUrl = URL.createObjectURL(file)
      const s3Key = S3KeyResult[0].s3Key

      const response = await auth
        .put<{
          data: MachineProjectPicUpdateRequestDtoType
        }>(`/api/machine-projects/${machineProjectId}/machine-project-pics/${selectedPic.id}`, {
          version: selectedPic.version,
          s3Key: s3Key
        })
        .then(v => v.data.data)

      setPictures(prev =>
        prev.map(v => (v.id === selectedPic.id ? { ...v, ...response, presignedUrl: presignedUrl } : v))
      )
      handleSuccess('사진이 교체되었습니다')
    } catch (e) {
      handleApiError(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = form.handleSubmit(async data => {
    try {
      setLoading(true)

      const response = await auth
        .put<{
          data: MachineProjectPicUpdateRequestDtoType
        }>(`/api/machine-projects/${machineProjectId}/machine-project-pics/${selectedPic.id}`, {
          ...data,
          version: selectedPic.version
        })
        .then(v => v.data.data)

      form.reset({
        originalFileName: response.originalFileName ?? '',
        machineProjectPicType: response.machineProjectPicType ?? '',
        remark: response.remark ?? ''
      })
      setPictures(prev => prev.map(v => (v.id === selectedPic.id ? { ...v, ...response } : v)))

      handleSuccess('사진 정보가 변경되었습니다.')
    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  })

  const handleClose = () => {
    setOpen(false)
  }

  const handleDontSave = useCallback(() => {
    proceedingJob.current && proceedingJob.current()
    form.reset()
    setOpenAlert(false)
  }, [form])

  const handleDelete = useCallback(async () => {
    try {
      setLoading(true)
      await auth.delete(`/api/machine-projects/${machineProjectId}/machine-project-pics`, {
        data: {
          machineProjectPicDeleteRequestDtos: [{ id: selectedPic.id, version: selectedPic.version }]
        }
      } as any)

      setOpen(false)
      setPictures(prev => prev.filter(v => v.id !== selectedPic.id))
      handleSuccess('사진이 정상적으로 삭제되었습니다')
    } catch (e) {
      handleApiError(e)
    } finally {
      setOpenDelete(false)
      setLoading(false)
    }
  }, [machineProjectId, selectedPic.id, selectedPic.version, setOpen, setPictures])

  return (
    <form className='hidden' onSubmit={handleSave} id={formName}>
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
            key={selectedPic.id}
            {...form.register('originalFileName')}
            variant='standard'
            fullWidth
            label={
              <Typography {...(form.formState.dirtyFields.originalFileName && { color: 'primary.main' })}>
                현장사진명
              </Typography>
            }
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
          />
          <IconButton
            type='button'
            sx={{ height: 'fit-content', position: 'absolute', top: 5, right: 5 }}
            size='small'
            onClick={handleClose}
          >
            <IconX />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '60dvh' }}>
          <div
            className={classNames('flex gap-4 w-full h-full', {
              'flex-col': isMobile
            })}
          >
            <div className='flex-1 flex flex-col gap-6 w-full items-center h-full border-4 p-2 rounded-lg bg-gray-300'>
              <div className='w-full flex justify-between'>
                <div className='flex gap-2'>
                  <Button color='error' variant='contained' onClick={() => setOpenDelete(true)}>
                    삭제
                  </Button>
                  <Button
                    color='error'
                    disabled={!isDirty}
                    onClick={() => {
                      proceedingJob.current = undefined
                      setOpenAlert(true)
                    }}
                  >
                    변경사항 폐기
                  </Button>
                </div>
                <div className='flex gap-2'>
                  <Button
                    LinkComponent='a'
                    href={selectedPic.downloadPresignedUrl}
                    download
                    variant='contained'
                    className='bg-blue-500 hover:bg-blue-600'
                  >
                    다운로드
                  </Button>
                  <Button type='button' variant='contained' onClick={() => cameraInputRef.current?.click()}>
                    사진 교체
                  </Button>
                </div>
              </div>
              <ImageZoom src={selectedPic.presignedUrl} alt={watchedOriginalFileName} />
            </div>
            <Box>
              <Grid2
                key={selectedPic.id}
                sx={{ marginTop: 2, width: { xs: 'full', sm: 400 } }}
                container
                spacing={4}
                columns={1}
              >
                <MultiInputBox
                  form={form}
                  name='machineProjectPicType'
                  labelMap={{ machineProjectPicType: { label: '사진 종류', options: projectPicOption } }}
                />
                <TextInputBox multiline form={form} name='remark' labelMap={{ remark: { label: '비고' } }} />
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
              disabled={!isDirty || !watchedMachineProjectPicType || loading}
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
      <DeleteModal open={openDelete} setOpen={setOpenDelete} onDelete={handleDelete} />
    </form>
  )
}
