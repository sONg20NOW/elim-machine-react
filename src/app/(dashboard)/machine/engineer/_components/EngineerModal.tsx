'use client'

// React Imports
import { createContext, useCallback, useRef, useState } from 'react'

// MUI Imports

import Button from '@mui/material/Button'

import { Backdrop, CircularProgress, Grid2, Typography } from '@mui/material'

import { useForm } from 'react-hook-form'

import DefaultModal from '@/@core/components/elim-modal/DefaultModal'
import type { EngineerResponseDtoType } from '@core/types'
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import DeleteModal from '@/@core/components/elim-modal/DeleteModal'

import { useMutateEngineer } from '@core/hooks/customTanstackQueries'
import deleteEngineer from '../_util/deleteEngineer'
import { printWarningSnackbar } from '@core/utils/snackbarHandler'
import AlertModal from '@/@core/components/elim-modal/AlertModal'
import TextInputBox from '@/@core/components/elim-inputbox/TextInputBox'
import MultiInputBox from '@/@core/components/elim-inputbox/MultiInputBox'
import { ENGINEER_INPUT_INFO } from '@/@core/data/input/engineerInputInfo'
import { emailRule, phoneRule } from '@/@core/data/inputRule'

type EngineerModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  initialData: EngineerResponseDtoType
  reloadPages: () => void
}

export const MemberIdContext = createContext<number>(0)

const EngineerModal = ({ open, setOpen, initialData, reloadPages }: EngineerModalProps) => {
  const engineerId = initialData.id

  const [loading, setLoading] = useState(false)
  const { mutate: mutateEngineer, isPending } = useMutateEngineer(engineerId.toString())

  const [openDelete, setOpenDelete] = useState(false)
  const [openAlert, setOpenAlert] = useState(false)
  const [openAlertNoSave, setOpenAlertNoSave] = useState(false)

  const changedEvenOnce = useRef(false)

  const form = useForm<EngineerResponseDtoType>({
    defaultValues: {
      name: initialData.name ?? '',
      email: initialData.email ?? '',
      phoneNumber: initialData.phoneNumber ?? '',
      grade: initialData.grade ?? '',
      engineerLicenseNum: initialData.engineerLicenseNum ?? '',
      remark: initialData.remark ?? ''
    }
  })

  const isDirty = form.formState.isDirty

  const handleDeleteEngineer = async () => {
    setLoading(true)
    await deleteEngineer(engineerId, initialData.version)
    reloadPages()
    setOpen(false)
    setLoading(false)
  }

  const handleSave = form.handleSubmit(async data => {
    if (!isDirty) {
      printWarningSnackbar('변경사항이 없습니다.', 1500)

      return
    }

    try {
      setLoading(true)

      mutateEngineer({ ...data, version: initialData.version })

      form.reset(data)
      changedEvenOnce.current = true
      handleSuccess(`설비인력 정보가 수정되었습니다.`)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  })

  const handleDontSave = useCallback(() => {
    form.reset()

    setOpenAlertNoSave(false)
  }, [form])

  // 실제로 창이 닫힐 때 동작하는 함수
  const onClose = useCallback(() => {
    if (changedEvenOnce.current) {
      reloadPages()
    }

    setOpen(false)
  }, [setOpen, reloadPages])

  // 창을 닫으려 할 때 동작하는 함수 - 변경사항이 있으면 경고창 출력
  const handleClose = useCallback(() => {
    if (isDirty) {
      setOpenAlert(true)
    } else {
      onClose()
    }
  }, [isDirty, onClose])

  return (
    <DefaultModal
      size='sm'
      open={open}
      setOpen={setOpen}
      title={<Typography variant='h3'>{initialData.name}</Typography>}
      onClose={handleClose}
      headerDescription={initialData.engineerLicenseNum}
      primaryButton={
        <Button variant='contained' type='submit' color='success' disabled={!isDirty || loading} onClick={handleSave}>
          저장
        </Button>
      }
      secondaryButton={
        <Button variant='contained' color='secondary' onClick={handleClose}>
          닫기
        </Button>
      }
      modifyButton={
        <div className='flex gap-3'>
          <Button variant='contained' color='error' type='reset' onClick={() => setOpenDelete(true)} disabled={loading}>
            삭제
          </Button>
          <Button
            disabled={!isDirty}
            color='error'
            onClick={() => {
              if (isDirty) setOpenAlertNoSave(true)
            }}
          >
            변경사항 폐기
          </Button>
        </div>
      }
    >
      <div className='flex flex-col overflow-visible pbs-0 sm:pli-16 gap-4'>
        {loading ? (
          <div className='h-full w-full grid place-items-center'>
            <CircularProgress />
          </div>
        ) : (
          <div className='grid gap-7'>
            <Grid2 container rowSpacing={2} columnSpacing={5} columns={2}>
              <TextInputBox column={2} form={form} name={'name'} labelMap={ENGINEER_INPUT_INFO} />
              <TextInputBox column={2} form={form} name={'email'} labelMap={ENGINEER_INPUT_INFO} rule={emailRule} />
              <TextInputBox
                column={2}
                form={form}
                name={'phoneNumber'}
                labelMap={ENGINEER_INPUT_INFO}
                rule={phoneRule}
              />
              <MultiInputBox column={2} form={form} name={'grade'} labelMap={ENGINEER_INPUT_INFO} />
              <TextInputBox column={2} form={form} name={'engineerLicenseNum'} labelMap={ENGINEER_INPUT_INFO} />
            </Grid2>
            <Grid2 container rowSpacing={1} columnSpacing={5} columns={2}>
              <TextInputBox column={2} multiline form={form} name={'remark'} labelMap={ENGINEER_INPUT_INFO} />
            </Grid2>
          </div>
        )}
      </div>
      {openDelete && <DeleteModal open={openDelete} setOpen={setOpenDelete} onDelete={handleDeleteEngineer} />}
      {openAlert && <AlertModal open={openAlert} setOpen={setOpenAlert} handleConfirm={onClose} />}
      {openAlertNoSave && (
        <AlertModal
          open={openAlertNoSave}
          setOpen={setOpenAlertNoSave}
          handleConfirm={handleDontSave}
          title={'변경사항을 모두 폐기하시겠습니까?'}
          subtitle='폐기한 후에는 복구할 수 없습니다'
          confirmMessage='폐기'
        />
      )}
      <Backdrop sx={theme => ({ zIndex: theme.zIndex.drawer + 1 })} open={isPending}>
        <CircularProgress sx={{ color: 'white' }} size={50} />
      </Backdrop>{' '}
    </DefaultModal>
  )
}

export default EngineerModal
