'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'

import { Autocomplete, Grid2, TextField, Typography } from '@mui/material'

import { useForm } from 'react-hook-form'

import DefaultModal from '@/@core/components/elim-modal/DefaultModal'
import type { engineerTypeType, MachineEngineerCreateRequestDtoType } from '@core/types'

import { ENGINEER_INPUT_INFO } from '@/@core/data/input/engineerInputInfo'
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import { auth } from '@core/utils/auth'
import TextInputBox from '@/@core/components/elim-inputbox/TextInputBox'
import MultiInputBox from '@/@core/components/elim-inputbox/MultiInputBox'
import { useGetEngineersOptions, useGetMembersLookup } from '@core/hooks/customTanstackQueries'

type AddEngineerModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  reloadPage: () => void
  engineerType?: engineerTypeType
}

const AddEngineerModal = ({ open, setOpen, reloadPage, engineerType = 'MACHINE' }: AddEngineerModalProps) => {
  const { data: memberList } = useGetMembersLookup()
  const memberOption = memberList?.map(v => ({ value: v.memberId, label: `${v.name} (${v.email})` })) ?? []

  const engineerTerm = ({ MACHINE: '설비인력', SAFETY: '진단인력' } as Record<engineerTypeType, string>)[engineerType]

  const { data: engineerList } = useGetEngineersOptions()

  const [loading, setLoading] = useState(false)

  const form = useForm<MachineEngineerCreateRequestDtoType>({
    defaultValues: {
      memberId: 0,
      grade: '',
      engineerLicenseNum: '',
      remark: ''
    }
  })

  // 추가 핸들러
  const onSubmitHandler = form.handleSubmit(async data => {
    try {
      setLoading(true)

      const response = await auth
        .post<{ data: MachineEngineerCreateRequestDtoType }>(`/api/engineers`, { ...data, engineerType: engineerType })
        .then(v => v.data.data)

      reloadPage()
      setOpen(false)

      console.log(`new engineer added: ${response.memberId}`)
      handleSuccess(`새 ${engineerTerm}이 추가되었습니다.`)
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
      title={`${engineerTerm} 추가`}
      primaryButton={
        <Button variant='contained' onClick={() => onSubmitHandler()} type='submit' disabled={loading}>
          추가
        </Button>
      }
      secondaryButton={
        <Button variant='contained' color='secondary' type='reset' onClick={() => setOpen(false)}>
          취소
        </Button>
      }
    >
      <div className='flex flex-col overflow-visible pbs-0 sm:pli-16 gap-4'>
        <Grid2 container rowSpacing={2} columnSpacing={5} columns={2}>
          <div className='flex flex-col w-full relative'>
            <Typography
              {...(form.formState.dirtyFields.memberId && { color: 'primary.main' })}
              {...(form.formState.errors.memberId && { color: 'error.main' })}
              sx={{ position: 'relative', width: 'fit-content' }}
            >
              이름
              <sup className='absolute right-0 translate-x-full text-red-500'>*</sup>
            </Typography>
            <Autocomplete
              fullWidth
              size='small'
              options={memberOption}
              noOptionsText='해당 이름의 직원을 찾을 수 없습니다'
              getOptionDisabled={option => engineerList?.some(v => v.memberId === option.value) ?? false}
              onChange={(_, value) => form.setValue('memberId', value?.value ?? 0, { shouldDirty: true })}
              renderInput={params => <TextField {...params} />}
            />
          </div>
          <MultiInputBox column={2} form={form} name={'grade'} labelMap={ENGINEER_INPUT_INFO} />
          <TextInputBox column={2} form={form} name={'engineerLicenseNum'} labelMap={ENGINEER_INPUT_INFO} />
        </Grid2>
        <Grid2 container rowSpacing={1} columnSpacing={5} columns={2}>
          <TextInputBox column={2} multiline form={form} name={'remark'} labelMap={ENGINEER_INPUT_INFO} />
        </Grid2>
      </div>
    </DefaultModal>
  )
}

export default AddEngineerModal
