'use client'

// React Imports
import { useCallback, useRef, useState } from 'react'

// MUI Imports

import Button from '@mui/material/Button'

import { useForm } from 'react-hook-form'

import { CircularProgress } from '@mui/material'

import DefaultModal from '@/@core/components/custom/DefaultModal'
import type { LicenseCreateRequestDto, LicenseResponseDtoType } from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import DeleteModal from '@/@core/components/custom/DeleteModal'
import { auth } from '@/lib/auth'
import LicenseInputs from './LicenseInputs'
import ProgressedAlertModal from '@/@core/components/custom/ProgressedAlertModal'
import { useMutateLicense } from '@/@core/hooks/customTanstackQueries'
import { printWarningSnackbar } from '@/@core/utils/snackbarHandler'

type LicenseModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  initialData: LicenseResponseDtoType
  reloadPages: () => void
}

const LicenseModal = ({ open, setOpen, initialData, reloadPages }: LicenseModalProps) => {
  const licenseId = initialData.id

  const [loading, setLoading] = useState(false)
  const { mutate: mutateLicense } = useMutateLicense(licenseId.toString())

  const [openDelete, setOpenDelete] = useState(false)
  const [openAlert, setOpenAlert] = useState(false)
  const [openAlertNoSave, setOpenAlertNoSave] = useState(false)

  const changedEvenOnce = useRef(false)

  const form = useForm<LicenseCreateRequestDto>({
    defaultValues: {
      companyName: initialData?.companyName ?? '',
      companyNameAbbr: initialData?.companyNameAbbr ?? '',
      bizno: initialData?.bizno ?? '',
      ceoName: initialData?.ceoName ?? '',
      managerName: initialData?.managerName ?? '',
      managerPhoneNumber: initialData?.managerPhoneNumber ?? '',
      managerEmail: initialData?.managerEmail ?? '',
      taxEmail: initialData?.taxEmail ?? '',
      homepageAddr: initialData?.homepageAddr ?? '',
      tel: initialData?.tel ?? '',
      fax: initialData?.fax ?? '',
      roadAddress: initialData?.roadAddress ?? '',
      jibunAddress: initialData?.jibunAddress ?? '',
      detailAddress: initialData?.detailAddress ?? '',
      businessType: initialData?.businessType ?? '',
      businessCategory: initialData?.businessCategory ?? '',
      contractDate: initialData?.contractDate ?? '',
      expireDate: initialData?.expireDate ?? '',
      remark: initialData?.remark ?? ''
    }
  })

  const isDirty = form.formState.isDirty

  const handleDeleteLicense = async () => {
    await deleteLicense()
    reloadPages && reloadPages()
    setOpen(false)
  }

  const deleteLicense = async () => {
    try {
      await auth.delete(`/api/licenses/${licenseId}`, {
        data: { licenseId: licenseId, version: initialData.version }
      } as any)

      handleSuccess('라이선스가 정상적으로 삭제되었습니다.')
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleSave = form.handleSubmit(data => {
    if (isDirty) {
      setLoading(true)

      try {
        mutateLicense({ ...data, version: initialData.version } as LicenseResponseDtoType)

        form.reset(data)
        handleSuccess(`라이선스 정보가 수정되었습니다.`)
        changedEvenOnce.current = true
      } catch (error: any) {
        handleApiError(error)
      } finally {
        setLoading(false)
      }
    } else {
      printWarningSnackbar('변경사항이 없습니다.', 1500)
    }
  })

  const handleDontSave = useCallback(() => {
    form.reset()

    setOpenAlertNoSave(false)
  }, [form])

  // 실제로 창이 닫힐 때 동작하는 함수
  const onClose = useCallback(() => {
    if (changedEvenOnce.current) {
      reloadPages && reloadPages()
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
      size='md'
      open={open}
      setOpen={setOpen}
      title={initialData.companyName}
      onClose={handleClose}
      headerDescription={initialData.bizno}
      primaryButton={
        <Button variant='contained' onClick={() => handleSave()} type='submit' color='success'>
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
          <Button
            sx={{ boxShadow: 'none' }}
            variant='contained'
            color='error'
            type='reset'
            onClick={() => setOpenDelete(true)}
          >
            삭제
          </Button>
          <Button
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
          <LicenseInputs form={form} />
        )}

        {openDelete && (
          <DeleteModal showDeleteModal={openDelete} setShowDeleteModal={setOpenDelete} onDelete={handleDeleteLicense} />
        )}
        {openAlert && <ProgressedAlertModal open={openAlert} setOpen={setOpenAlert} handleConfirm={onClose} />}
        {openAlertNoSave && (
          <ProgressedAlertModal
            open={openAlertNoSave}
            setOpen={setOpenAlertNoSave}
            handleConfirm={handleDontSave}
            title={'변경사항을 모두 폐기하시겠습니까?'}
            subtitle='폐기한 후에는 복구할 수 없습니다'
            confirmMessage='폐기'
          />
        )}
      </div>
    </DefaultModal>
  )
}

export default LicenseModal
