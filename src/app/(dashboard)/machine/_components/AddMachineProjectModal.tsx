'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'

import { DialogContent, TextField, Typography } from '@mui/material'

import { toast } from 'react-toastify'

import { useForm } from 'react-hook-form'

import classNames from 'classnames'

import type { MachineProjectCreateRequestDtoType } from '@core/types'
import DefaultModal from '@/@core/components/elim-modal/DefaultModal'
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import { auth } from '@core/utils/auth'
import { useGetLicenseNames } from '@core/hooks/customTanstackQueries'

import styles from '@core/styles/customTable.module.css'
import SelectTd from '@/@core/components/elim-inputbox/SelectTd'
import TextFieldTd from '@/@core/components/elim-inputbox/TextFieldTd'

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

      console.log('new machine project added', response.data.data.machineProjectName)
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
      title='기계설비현장 추가'
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
        <div className={classNames('grid gap-5 pt-2', styles.container)}>
          <table style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col width={'25%'} />
              <col width={'75%'} />
            </colgroup>
            <tbody>
              <tr className={styles.required}>
                <th>점검업체</th>
                <SelectTd
                  form={form}
                  name='companyName'
                  option={companyNameOption!}
                  placeholder='점검업체를 선택해주세요'
                />
              </tr>
              <tr className={styles.required}>
                <th>현장명</th>
                <TextFieldTd form={form} name='machineProjectName' />
              </tr>
            </tbody>
          </table>
          <div>
            <Typography>점검일정</Typography>
            <table>
              <colgroup>
                <col width={'25%'} />
                <col width={'75%'} />
              </colgroup>
              <tbody>
                <tr>
                  <th>투입시작</th>
                  <TextFieldTd form={form} name='beginDate' type='date' />
                </tr>
                <tr>
                  <th>투입종료</th>
                  <TextFieldTd form={form} name='endDate' type='date' />
                </tr>
                <tr>
                  <th>현장점검시작</th>
                  <TextFieldTd form={form} name='fieldBeginDate' type='date' />
                </tr>
                <tr>
                  <th>현장점검시작</th>
                  <TextFieldTd form={form} name='fieldEndDate' type='date' />
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <Typography>비고</Typography>
            <TextField fullWidth multiline rows={3} {...form.register('note')} />
          </div>
        </div>
      </DialogContent>
    </DefaultModal>
  )
}
