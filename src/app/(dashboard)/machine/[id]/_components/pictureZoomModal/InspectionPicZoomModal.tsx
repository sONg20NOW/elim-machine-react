import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

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
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material'

import { toast } from 'react-toastify'

import { useForm } from 'react-hook-form'

import { createPortal } from 'react-dom'

import { IconCircleCaretLeftFilled, IconCircleCaretRightFilled, IconDownload, IconPhotoUp } from '@tabler/icons-react'

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
import ImageZoomCard from './ImageZoomCard'

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

  const showMovePicBtns = useMediaQuery('(min-width:1100px)')

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

      const s3Key = S3KeyResult[0].s3Key

      const response = await auth
        .put<{
          data: MachinePicUpdateResponseDtoType
        }>(
          `/api/machine-projects/${machineProjectId}/machine-inspections/${selectedPic.machineInspectionId}/machine-pics/${selectedPic.machinePicId}`,
          { version: selectedPic.version, s3Key: s3Key } as MachinePicUpdateRequestDtoType
        )
        .then(v => v.data.data)

      setPictures(prev => prev.map(v => (v.machinePicId === selectedPic.machinePicId ? { ...v, ...response } : v)))
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
    if (isDirty) {
      proceedingJob.current = () => setOpen(false)
      setOpenAlert(true)
    } else {
      setOpen(false)
    }
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
          maxWidth='md'
          fullWidth
          open={open}
          onClose={(_, reason) => {
            if (reason === 'backdropClick') return
            handleClose()
          }}
        >
          <Backdrop sx={theme => ({ zIndex: theme.zIndex.modal + 10 })} open={loading}>
            <CircularProgress size={60} sx={{ color: 'white' }} />
          </Backdrop>
          <DialogTitle
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, position: 'relative', pb: 2, pt: 4 }}
          >
            <div className='flex gap-2 items-center'>
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
            <div className='flex gap-2 items-center'>
              <Tooltip title='사진 다운로드' arrow>
                <IconButton type='button' LinkComponent={'a'} href={selectedPic.downloadPresignedUrl} download>
                  <IconDownload color='dimgray' size={30} />
                </IconButton>
              </Tooltip>
              <Tooltip title='사진 업로드(교체)' arrow>
                <IconButton type='button' onClick={() => cameraInputRef.current?.click()}>
                  <IconPhotoUp color='dimgray' size={30} />
                </IconButton>
              </Tooltip>
            </div>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 4, height: '80dvh' }}>
            {/* 사진창 */}
            <div className='flex-1 overflow-hidden'>
              <ImageZoomCard src={selectedPic.presignedUrl} alt={selectedPic.originalFileName} />
            </div>
            {/* 정보 수정 창 */}
            <Box>
              <Grid2 sx={{ marginTop: 2, width: 'full' }} container columnSpacing={3} rowSpacing={2} columns={2}>
                <TextInputBox
                  form={form}
                  name='originalFileName'
                  labelMap={{ originalFileName: { label: '사진명' } }}
                  placeholder='사진명을 입력해주세요'
                />
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
                  measuredValue
                  labelMap={{ measuredValue: { label: '측정값' } }}
                  placeholder='측정값을 입력해주세요'
                />
                <TextInputBox
                  column={2}
                  multiline
                  form={form}
                  name='remark'
                  labelMap={{ remark: { label: '비고' } }}
                  placeholder='비고는 보고서에 포함되지 않습니다'
                />
              </Grid2>
            </Box>
          </DialogContent>
          <DialogActions sx={{ mt: 2 }}>
            <div className='flex items-end gap-4'>
              <Typography color={isDirty ? 'error.main' : 'warning.main'}>
                {!isDirty ? '변경사항이 없습니다' : !watchedChecklistSubItemId && '※하위항목을 지정해주세요'}
              </Typography>
              <div className='flex'>
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
                <Button
                  sx={{ width: 'fit-content' }}
                  variant='contained'
                  type='button'
                  onClick={handleClose}
                  color='secondary'
                >
                  닫기
                </Button>
              </div>
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
