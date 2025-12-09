'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'

import { DialogContent } from '@mui/material'

import { useForm } from 'react-hook-form'

import DefaultModal from '@/@core/components/custom/DefaultModal'

import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import type { LicenseCreateRequestDto } from '@/@core/types'
import { auth } from '@/@core/utils/auth'
import LicenseInputs from './LicenseInputs'

type AddModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  reloadPage: () => void
}

const AddModal = ({ open, setOpen, reloadPage }: AddModalProps) => {
  const [loading, setLoading] = useState(false)

  const form = useForm<LicenseCreateRequestDto>({
    defaultValues: {
      companyName: '',
      companyNameAbbr: '',
      bizno: '',
      ceoName: '',
      managerName: '',
      managerPhoneNumber: '',
      managerEmail: '',
      taxEmail: '',
      homepageAddr: '',
      tel: '',
      fax: '',
      roadAddress: '',
      jibunAddress: '',
      detailAddress: '',
      businessType: '',
      businessCategory: '',
      contractDate: '',
      expireDate: '',
      remark: ''
    }
  })

  // 추가 핸들러
  const onSubmitHandler = form.handleSubmit(async data => {
    try {
      setLoading(true)
      const response = await auth.post<{ data: { licenseId: number } }>(`/api/licenses`, data)

      console.log(`LicenseId:${response.data.data.licenseId} new license added`)
      handleSuccess('새 라이선스가 추가되었습니다.')

      reloadPage()
      setOpen(false)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  })

  return (
    <DefaultModal
      size='md'
      open={open}
      setOpen={setOpen}
      title={'신규 라이선스 추가'}
      primaryButton={
        <Button variant='contained' onClick={onSubmitHandler} type='submit' disabled={loading}>
          추가
        </Button>
      }
      secondaryButton={
        <Button variant='contained' color='secondary' type='reset' onClick={() => setOpen(false)}>
          취소
        </Button>
      }
    >
      <DialogContent className='flex flex-col overflow-visible pbs-0 sm:pli-16 gap-4'>
        <LicenseInputs form={form} />
      </DialogContent>
    </DefaultModal>
  )
}

export default AddModal
