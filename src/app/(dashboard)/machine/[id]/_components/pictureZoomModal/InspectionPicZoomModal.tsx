import { useCallback, useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import { useParams } from 'next/navigation'

import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
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

import { toast } from 'react-toastify'

import { useForm } from 'react-hook-form'

import ImageZoom from 'react-image-zooom'

import { createPortal } from 'react-dom'

import { IconCircleCaretLeftFilled, IconCircleCaretRightFilled, IconX } from '@tabler/icons-react'

import type {
  MachinePicPresignedUrlResponseDtoType,
  MachinePicUpdateRequestDtoType,
  MachinePicUpdateResponseDtoType
} from '@core/types'
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import getS3Key from '@core/utils/getS3Key'
import { useGetInspectionsSimple, useGetSingleInspection } from '@core/hooks/customTanstackQueries'
import { auth } from '@core/utils/auth'
import AlertModal from '@/@core/components/elim-modal/AlertModal'
import TextInputBox from '@/@core/components/elim-inputbox/TextInputBox'
import MultiInputBox from '@/@core/components/elim-inputbox/MultiInputBox'
import DeleteModal from '@/@core/components/elim-modal/DeleteModal'
import { isMobileContext } from '@/@core/contexts/mediaQueryContext'

type formType = Omit<MachinePicUpdateRequestDtoType, 'version' | 's3Key'> & { machineProjectChecklistItemId: number }

interface InspectionPicZoomModalProps {
  MovePicture?: (dir: 'next' | 'previous') => void
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  selectedPic: MachinePicPresignedUrlResponseDtoType
  setPictures: Dispatch<SetStateAction<MachinePicPresignedUrlResponseDtoType[]>>
}

// ! 확대 기능 구현, 현재 리스트에 있는 목록 슬라이드로 이동 가능 기능 구현, 사진 정보 수정 기능 구현(이름 수정은 연필로)
export default function InspectionPicZoomModal({
  MovePicture,
  open,
  setOpen,
  selectedPic,
  setPictures
}: InspectionPicZoomModalProps) {
  const machineProjectId = useParams().id?.toString() as string

  const showMovePicBtns = useMediaQuery('(min-width:1755px)')

  const [openAlert, setOpenAlert] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const proceedingJob = useRef<() => void>()

  const form = useForm<formType>({
    defaultValues: {
      machineInspectionId: selectedPic.machineInspectionId ?? 0,
      machineProjectChecklistItemId: selectedPic.machineProjectChecklistItemId ?? 0,
      machineProjectChecklistSubItemId: selectedPic.machineProjectChecklistSubItemId ?? 0,
      originalFileName: selectedPic.originalFileName ?? '',
      alternativeSubTitle: selectedPic.alternativeSubTitle ?? '',
      measuredValue: selectedPic.measuredValue ?? '',
      remark: selectedPic.remark ?? ''
    }
  })

  const isDirty = form.formState.isDirty

  const watchedChecklistItemId = form.watch('machineProjectChecklistItemId')
  const watchedChecklistSubItemId = form.watch('machineProjectChecklistSubItemId')
  const watchedAlternativeSubTitle = form.watch('alternativeSubTitle')
  const watchedMachineInspectionId = form.watch('machineInspectionId')

  const { data: selectedInspection } = useGetSingleInspection(machineProjectId, watchedMachineInspectionId.toString())

  const machineChecklistItemIdOption = selectedInspection?.machineChecklistItemsWithPicCountResponseDtos.map(v => ({
    label: v.machineProjectChecklistItemName,
    value: v.machineProjectChecklistItemId
  }))

  const machineChecklistSubItemIdOption = selectedInspection?.machineChecklistItemsWithPicCountResponseDtos
    .find(v => v.machineProjectChecklistItemId === watchedChecklistItemId)
    ?.checklistSubItems.map(v => ({
      label: v.machineProjectChecklistSubItemName,
      value: v.machineProjectChecklistSubItemId
    }))

  // 사진 정보 수정을 위한 상태관리
  const [loading, setLoading] = useState(false)

  const { data: inspectionList } = useGetInspectionsSimple(machineProjectId)

  const cameraInputRef = useRef<HTMLInputElement>(null)

  const isMobile = useContext(isMobileContext)

  const formName = 'inspection-pic-form'

  useEffect(() => {
    form.reset({
      machineInspectionId: selectedPic.machineInspectionId ?? 0,
      machineProjectChecklistItemId: selectedPic.machineProjectChecklistItemId ?? 0,
      machineProjectChecklistSubItemId: selectedPic.machineProjectChecklistSubItemId ?? 0,
      originalFileName: selectedPic.originalFileName ?? '',
      alternativeSubTitle: selectedPic.alternativeSubTitle ?? '',
      measuredValue: selectedPic.measuredValue ?? '',
      remark: selectedPic.remark ?? ''
    })
  }, [
    selectedPic.machinePicId,
    selectedPic.machineInspectionId,
    selectedPic.machineProjectChecklistItemId,
    selectedPic.machineProjectChecklistSubItemId,
    selectedPic.originalFileName,
    selectedPic.alternativeSubTitle,
    selectedPic.measuredValue,
    selectedPic.remark,
    form
  ])

  useEffect(() => {
    if (form.formState.isDirty) {
      form.setValue('machineProjectChecklistItemId', 0, { shouldDirty: false })
    }
  }, [watchedMachineInspectionId, form])

  useEffect(() => {
    if (form.formState.isDirty) {
      form.setValue('machineProjectChecklistSubItemId', 0, { shouldDirty: false })
    }
  }, [watchedChecklistItemId, form])

  const onChangeImage = async (file: File) => {
    try {
      setLoading(true)

      const S3KeyResult = await getS3Key(
        machineProjectId,
        [file],
        selectedPic.machineInspectionId.toString(),
        selectedPic.machineProjectChecklistItemId,
        selectedPic.machineProjectChecklistSubItemId,
        undefined
      )

      if (!S3KeyResult) return

      const presignedUrl = URL.createObjectURL(file)
      const s3Key = S3KeyResult[0].s3Key

      const response = await auth
        .put<{
          data: MachinePicUpdateResponseDtoType
        }>(
          `/api/machine-projects/${machineProjectId}/machine-inspections/${selectedPic.machineInspectionId}/machine-pics/${selectedPic.machinePicId}`,
          { version: selectedPic.version, s3Key: s3Key } as MachinePicUpdateRequestDtoType
        )
        .then(v => v.data.data)

      setPictures(prev =>
        prev.map(v =>
          v.machinePicId === selectedPic.machinePicId ? { ...v, ...response, presignedUrl: presignedUrl } : v
        )
      )
      handleSuccess('사진이 교체되었습니다')
    } catch (e) {
      handleApiError(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = form.handleSubmit(async data => {
    if (!watchedChecklistSubItemId) {
      toast.error('하위항목을 선택해주세요')

      return
    }

    try {
      setLoading(true)

      const response = await auth
        .put<{
          data: MachinePicUpdateResponseDtoType
        }>(
          `/api/machine-projects/${machineProjectId}/machine-inspections/${selectedPic.machineInspectionId}/machine-pics/${selectedPic.machinePicId}`,
          { ...data, version: selectedPic.version } as Omit<MachinePicUpdateRequestDtoType, 's3Key'>
        )
        .then(v => v.data.data)

      setPictures(prev =>
        prev.map(v =>
          v.machinePicId === selectedPic.machinePicId
            ? {
                ...v,
                ...response,
                machineProjectChecklistItemId: watchedChecklistItemId,
                machineProjectChecklistItemName:
                  machineChecklistItemIdOption?.find(v => v.value === watchedChecklistItemId)?.label ?? '',
                machineProjectChecklistSubItemName:
                  machineChecklistSubItemIdOption?.find(v => v.value === watchedChecklistSubItemId)?.label ?? ''
              }
            : v
        )
      )
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
      await auth.delete(`/api/machine-projects/${machineProjectId}/machine-pics`, {
        data: {
          machinePicDeleteRequestDtos: [{ machinePicId: selectedPic.machinePicId, version: selectedPic.version }]
        }
      } as any)

      setOpen(false)
      setPictures(prev => prev.filter(v => v.machinePicId !== selectedPic.machinePicId))
      handleSuccess('사진이 정상적으로 삭제되었습니다')
    } catch (e) {
      handleApiError(e)
    } finally {
      setOpenDelete(false)
      setLoading(false)
    }
  }, [machineProjectId, selectedPic.machinePicId, selectedPic.version, setOpen, setPictures])

  return (
    inspectionList && (
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
                disabled={loading}
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
                disabled={loading}
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
          <Backdrop sx={theme => ({ zIndex: theme.zIndex.modal + 4 })} open={loading}>
            <CircularProgress size={60} sx={{ color: 'white' }} />
          </Backdrop>
          <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', pb: 2 }}>
            <TextField
              {...form.register('originalFileName')}
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
                      LinkComponent={'a'}
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
                <ImageZoom src={selectedPic.presignedUrl} alt={watchedAlternativeSubTitle} />
              </div>
              <Box>
                <Grid2 sx={{ marginTop: 2, width: { xs: 'full', sm: 400 } }} container spacing={4} columns={1}>
                  <MultiInputBox
                    form={form}
                    name='machineInspectionId'
                    labelMap={{
                      machineInspectionId: {
                        label: '설비명',
                        options: inspectionList.map(v => ({ label: v.name, value: v.id }))
                      }
                    }}
                  />
                  <MultiInputBox
                    form={form}
                    name='machineProjectChecklistItemId'
                    labelMap={{
                      machineProjectChecklistItemId: {
                        label: '점검항목',
                        options: machineChecklistItemIdOption
                      }
                    }}
                  />
                  <MultiInputBox
                    form={form}
                    name='machineProjectChecklistSubItemId'
                    labelMap={{
                      machineProjectChecklistSubItemId: {
                        label: '하위항목',
                        options: machineChecklistSubItemIdOption
                      }
                    }}
                  />
                  <TextInputBox
                    form={form}
                    name='alternativeSubTitle'
                    labelMap={{ alternativeSubTitle: { label: '대체타이틀' } }}
                    placeholder='대체타이틀을 입력해주세요'
                  />
                  <TextInputBox
                    form={form}
                    name='measuredValue'
                    labelMap={{ measuredValue: { label: '측정값' } }}
                    placeholder='측정값을 입력해주세요'
                  />
                  <TextInputBox
                    multiline
                    form={form}
                    name='remark'
                    labelMap={{ remark: { label: '비고' } }}
                    placeholder='비고는 보고서에 포함되지 않습니다'
                  />
                </Grid2>
              </Box>
            </div>
          </DialogContent>
          <DialogActions>
            <div className='flex items-end gap-4'>
              <Typography color={isDirty ? 'error.main' : 'warning.main'}>
                {!isDirty ? '변경사항이 없습니다' : !watchedChecklistSubItemId && '※하위항목을 지정해주세요'}
              </Typography>
              <Button
                sx={{ width: 'fit-content' }}
                variant='contained'
                type='submit'
                form={formName}
                disabled={!isDirty || !watchedChecklistSubItemId || loading}
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
  )
}
