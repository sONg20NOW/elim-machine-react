'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'

import { DialogContent, Grid2 } from '@mui/material'

import { toast } from 'react-toastify'

import { useForm } from 'react-hook-form'

import type { MachineProjectCreateRequestDtoType } from '@/@core/types'
import DefaultModal from '@/@core/components/custom/DefaultModal'
import { MACHINE_CREATE_INFO } from '@/app/_constants/input/machineInputInfo'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { auth } from '@/lib/auth'
import TextInputBox from '@/@core/components/inputbox/TextInputBox'
import MultiInputBox from '@/@core/components/inputbox/MultiInputBox'
import { useGetLicenseNames } from '@/@core/hooks/customTanstackQueries'

type AddMachineProjectModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  reloadPage: () => void
}

export default function AddMachineProjectModal({ open, setOpen, reloadPage }: AddMachineProjectModalProps) {
  const [loading, setLoading] = useState(false)

  const { data: licenseList } = useGetLicenseNames()
  const companyNameOption = licenseList?.map(v => ({ label: v.companyName, value: v.companyName }))

  const form = useForm<MachineProjectCreateRequestDtoType>({
    defaultValues: {
      companyName: '',
      machineProjectName: '',
      beginDate: '',
      endDate: '',
      fieldBeginDate: '',
      fieldEndDate: '',
      note: ''
    }
  })

  const onSubmitHandler = form.handleSubmit(async data => {
    try {
      if (data.machineProjectName === '') {
        toast.error('현장명은 필수입력입니다.')

        return
      }

      setLoading(true)
      const response = await auth.post<{ data: MachineProjectCreateRequestDtoType }>(`/api/machine-projects`, data)

      console.log('new machine project added', response.data.data)
      handleSuccess('새 기계설비현장이 추가되었습니다.')

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
      size='sm'
      open={open}
      setOpen={setOpen}
      title='신규 기계설비현장 추가'
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
      <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
        <div className='grid gap-5'>
          <Grid2 container rowSpacing={2} columnSpacing={5} columns={2}>
            <MultiInputBox
              column={2}
              required
              form={form}
              name='companyName'
              labelMap={{
                ...MACHINE_CREATE_INFO,
                companyName: { ...MACHINE_CREATE_INFO.companyName, options: companyNameOption }
              }}
            />
            <TextInputBox column={2} required form={form} name={'machineProjectName'} labelMap={MACHINE_CREATE_INFO} />{' '}
            <TextInputBox type='date' form={form} name={'beginDate'} labelMap={MACHINE_CREATE_INFO} />
            <TextInputBox type='date' form={form} name={'endDate'} labelMap={MACHINE_CREATE_INFO} />
            <TextInputBox type='date' form={form} name={'fieldBeginDate'} labelMap={MACHINE_CREATE_INFO} />
            <TextInputBox type='date' form={form} name={'fieldEndDate'} labelMap={MACHINE_CREATE_INFO} />
          </Grid2>
          <Grid2 container rowSpacing={1} columnSpacing={5} columns={1}>
            <TextInputBox multiline form={form} name={'note'} labelMap={MACHINE_CREATE_INFO} />
          </Grid2>
        </div>
      </DialogContent>
    </DefaultModal>
  )
}
