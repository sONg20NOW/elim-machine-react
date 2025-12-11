'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'

import { DialogContent, Grid2 } from '@mui/material'

import { useForm } from 'react-hook-form'

import DefaultModal from '@/@core/components/elim-modal/DefaultModal'
import type { MemberCreateRequestDtoType } from '@core/types'
import { MEMBER_INPUT_INFO } from '@/@core/data/input/memberInputInfo'
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import { auth } from '@core/utils/auth'
import TextInputBox from '@/@core/components/elim-inputbox/TextInputBox'
import MultiInputBox from '@/@core/components/elim-inputbox/MultiInputBox'
import { useGetLicenseNames } from '@core/hooks/customTanstackQueries'

type AddUserModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  handlePageChange: () => void
}

const AddUserModal = ({ open, setOpen, handlePageChange }: AddUserModalProps) => {
  const [loading, setLoading] = useState(false)

  const { data: licenses } = useGetLicenseNames()
  const companyNameOption = licenses?.map(v => ({ label: v.companyName, value: v.companyName }))

  const form = useForm<MemberCreateRequestDtoType>({
    defaultValues: {
      companyName: '',
      name: '',
      memberStatus: '',
      email: '',
      note: ''
    }
  })

  const onSubmitHandler = form.handleSubmit(async data => {
    try {
      setLoading(true)
      const response = await auth.post<{ data: MemberCreateRequestDtoType }>(`/api/members`, data)

      console.log('new member added', response.data.data.name)
      handleSuccess('새 직원이 추가되었습니다.')

      handlePageChange()
      setOpen(false)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  })

  return (
    <DefaultModal
      open={open}
      setOpen={setOpen}
      title='신규 직원 추가'
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
        <Grid2 container spacing={3} columns={2}>
          <TextInputBox form={form} name='name' labelMap={MEMBER_INPUT_INFO.basic} required />
          <TextInputBox form={form} name='email' labelMap={MEMBER_INPUT_INFO.basic} required />
          <MultiInputBox
            form={form}
            name='companyName'
            labelMap={{
              ...MEMBER_INPUT_INFO,
              companyName: { ...MEMBER_INPUT_INFO.basic.companyName, options: companyNameOption }
            }}
          />
          <MultiInputBox form={form} name='memberStatus' labelMap={MEMBER_INPUT_INFO.basic} />
          <TextInputBox multiline column={2} form={form} name='note' labelMap={MEMBER_INPUT_INFO.basic} />
        </Grid2>
      </DialogContent>
    </DefaultModal>
  )
}

export default AddUserModal
