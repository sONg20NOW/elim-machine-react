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

type LicenseModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  initialData: LicenseResponseDtoType
  reloadPages: () => void
}

const LicenseModal = ({ open, setOpen, initialData, reloadPages }: LicenseModalProps) => {
  const licenseId = initialData.id

  const [loading, setLoading] = useState(false)
  const { mutateAsync: mutateLicenseAsync } = useMutateLicense(licenseId.toString())

  const [openDelete, setOpenDelete] = useState(false)
  const [openAlert, setOpenAlert] = useState(false)

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

  const watchedCompanyName = form.watch('companyName')
  const watchedBizno = form.watch('bizno')

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

  const handleSave = form.handleSubmit(async data => {
    if (isDirty) {
      setLoading(true)

      try {
        const newLicense = await mutateLicenseAsync({ ...data, version: initialData.version } as LicenseResponseDtoType)

        form.reset(newLicense)
        handleSuccess(`라이선스 정보가 수정되었습니다.`)
        changedEvenOnce.current = true
      } catch (error: any) {
        handleApiError(error)
      } finally {
        setLoading(false)
      }
    }
  })

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
      title={watchedCompanyName}
      onClose={handleClose}
      headerDescription={watchedBizno}
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
        <Button
          sx={{ boxShadow: 'none' }}
          variant='contained'
          color='error'
          type='reset'
          onClick={() => setOpenDelete(true)}
        >
          삭제
        </Button>
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
      </div>
    </DefaultModal>
  )
}

export default LicenseModal
