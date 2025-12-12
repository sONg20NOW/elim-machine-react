import { useCallback, useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { Button, IconButton, TextField, Typography } from '@mui/material'

import { IconClipboard } from '@tabler/icons-react'

import type {
  MachineInspectionChecklistItemResultBasicResponseDtoType,
  MachineInspectionDetailResponseDtoType
} from '@/@core/types'
import { useHandleSaveChecklistContext } from '../../InspectionDetailModal'

import { printSuccessSnackbar } from '@/@core/utils/snackbarHandler'
import { handleApiError } from '@/@core/utils/errorHandler'

import DefaultModal from '@/@core/components/elim-modal/DefaultModal'
import AlertModal from '@/@core/components/elim-modal/AlertModal'

interface DeficiencyModalProps<T> {
  editData: T
  checklistItemId: number
}

// 미흡사항 클립보드 클릭 시 나오는 모달
const DeficiencyModal = ({
  checklistItemId,
  editData
}: DeficiencyModalProps<MachineInspectionDetailResponseDtoType>) => {
  const [open, setOpen] = useState(false)
  const [openAlert, setOpenAlert] = useState(false)

  const handleSaveChecklist = useHandleSaveChecklistContext()

  const currentChecklist = editData.machineChecklistItemsWithPicCountResponseDtos.find(
    v => v.machineProjectChecklistItemId === checklistItemId
  )

  const currentChecklistResult = currentChecklist?.machineInspectionChecklistItemResultBasicResponseDto

  const [checklistItemResult, setChecklistItemResult] = useState(currentChecklistResult)

  type formType = Pick<MachineInspectionChecklistItemResultBasicResponseDtoType, 'deficiencies' | 'actionRequired'>

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = useForm<formType>({
    defaultValues: {
      deficiencies: checklistItemResult?.deficiencies ?? '',
      actionRequired: checklistItemResult?.actionRequired ?? ''
    }
  })

  useEffect(() => {
    setChecklistItemResult(currentChecklistResult)
  }, [currentChecklistResult])

  const handleSave = useCallback(
    (data: formType) => {
      if (currentChecklistResult) {
        handleSaveChecklist([{ ...currentChecklistResult, ...data }])
        setOpen(false)
        setTimeout(() => {
          reset(data)
        }, 100)

        printSuccessSnackbar(`미흡사항/조치필요사항 변경 완료`, 2000)
      } else {
        handleApiError('', `점검결과를 찾을 수 없습니다\n관리자에게 문의하세요`)
      }
    },
    [currentChecklistResult, handleSaveChecklist, reset]
  )

  function handleDontSaveQuit() {
    setOpen(false)
    setOpenAlert(false)

    setTimeout(
      () =>
        reset({
          deficiencies: checklistItemResult?.deficiencies ?? '',
          actionRequired: checklistItemResult?.actionRequired ?? ''
        }),
      100
    )
  }

  function onClose() {
    if (isDirty) {
      setOpenAlert(true)
    } else {
      setOpen(false)
    }
  }

  return (
    checklistItemResult && (
      <>
        <IconButton
          className='absolute right-1 top-[50%] -translate-y-1/2'
          size='small'
          onClick={() => {
            setOpen(true)
          }}
        >
          <IconClipboard />
        </IconButton>
        <DefaultModal
          size='sm'
          title={
            <Typography variant='h3' fontWeight={600}>
              {currentChecklist?.machineProjectChecklistItemName ?? '미흡사항'}
            </Typography>
          }
          open={open}
          setOpen={setOpen}
          onClose={onClose}
          primaryButton={
            <Button variant='contained' disabled={!isDirty} onClick={handleSubmit(handleSave)}>
              확인
            </Button>
          }
          secondaryButton={
            <Button variant='contained' color='secondary' onClick={onClose}>
              취소
            </Button>
          }
        >
          {currentChecklistResult ? (
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1'>
                <Typography variant='h5'>미흡사항</Typography>
                <TextField
                  {...register('deficiencies')}
                  minRows={3}
                  multiline
                  slotProps={{ input: { sx: { padding: 4 } } }}
                />
              </div>
              <div className='flex flex-col gap-1'>
                <Typography variant='h5'>조치필요사항</Typography>
                <TextField
                  {...register('actionRequired')}
                  minRows={3}
                  multiline
                  slotProps={{ input: { sx: { padding: 4 } } }}
                />
              </div>
            </div>
          ) : (
            <Typography>미흡사항 데이터를 불러오는 데 실패했습니다.</Typography>
          )}
          {
            <div className='grid place-items-center'>
              <Typography color='warning.main' sx={{ opacity: !isDirty ? '' : '0%' }}>
                ※변경사항이 없습니다※
              </Typography>
            </div>
          }
        </DefaultModal>
        <AlertModal open={openAlert} setOpen={setOpenAlert} handleConfirm={handleDontSaveQuit} />
      </>
    )
  )
}

export default DeficiencyModal
