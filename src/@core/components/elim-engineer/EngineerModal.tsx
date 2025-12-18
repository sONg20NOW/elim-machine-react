'use client'

// React Imports
import { createContext, useCallback, useRef, useState } from 'react'

// MUI Imports

import Button from '@mui/material/Button'

import { Backdrop, CircularProgress, TextField, Typography } from '@mui/material'

import { useForm } from 'react-hook-form'

import classNames from 'classnames'

import DefaultModal from '@/@core/components/elim-modal/DefaultModal'
import type { EngineerResponseDtoType, engineerTypeType } from '@core/types'
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import DeleteModal from '@/@core/components/elim-modal/DeleteModal'

import { useMutateEngineer } from '@core/hooks/customTanstackQueries'
import { printWarningSnackbar } from '@core/utils/snackbarHandler'
import AlertModal from '@/@core/components/elim-modal/AlertModal'
import deleteEngineer from '@/@core/utils/deleteEngineer'
import styles from '@core/styles/customTable.module.css'
import SelectTd from '../elim-inputbox/SelectTd'
import TextFieldTd from '../elim-inputbox/TextFieldTd'
import { gradeOption } from '@/@core/data/options'
import ResetButton from '../elim-button/ResetButton'
import { useEngineerTypeContext } from './EngineerPage'

type EngineerModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  initialData: EngineerResponseDtoType
  reloadPages: () => void
}

export const MemberIdContext = createContext<number>(0)

const EngineerModal = ({ open, setOpen, initialData, reloadPages }: EngineerModalProps) => {
  const engineerType = useEngineerTypeContext()

  const engineerTerm = ({ MACHINE: '기계설비 기술자', SAFETY: '안전진단 기술자' } as Record<engineerTypeType, string>)[
    engineerType
  ]

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
      title={
        <>
          <Typography variant='subtitle1'>{engineerTerm}</Typography>
          <Typography variant='h3'>{initialData.name}</Typography>
        </>
      }
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
        <div className='flex items-center gap-1'>
          <Button variant='contained' color='error' type='reset' onClick={() => setOpenDelete(true)} disabled={loading}>
            삭제
          </Button>
          <ResetButton isDirty={isDirty} onClick={() => isDirty && setOpenAlertNoSave(true)} />
        </div>
      }
    >
      <div className={classNames('grid gap-5 pt-2 overflow-visible sm:pli-16', styles.container)}>
        {loading ? (
          <div className='h-full w-full grid place-items-center'>
            <CircularProgress />
          </div>
        ) : (
          <>
            <table style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col width={'25%'} />
                <col width={'75%'} />
              </colgroup>
              <tbody>
                <tr className={styles.required}>
                  <th>이름</th>
                  <TextFieldTd form={form} name='name' />
                </tr>
                <tr className={styles.required}>
                  <th>이메일</th>
                  <TextFieldTd form={form} name='email' />
                </tr>
                <tr className={styles.required}>
                  <th>번호</th>
                  <TextFieldTd form={form} name='phoneNumber' />
                </tr>
                <tr>
                  <th>등급</th>
                  <SelectTd form={form} name='grade' option={gradeOption} />
                </tr>
                <tr>
                  <th>수첩발급번호</th>
                  <TextFieldTd form={form} name='engineerLicenseNum' />
                </tr>
              </tbody>
            </table>
            <div>
              <Typography>비고</Typography>
              <TextField fullWidth multiline rows={3} {...form.register('remark')} />
            </div>
          </>
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
