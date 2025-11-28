import { forwardRef, useImperativeHandle } from 'react'

import { DialogContent, Grid2 } from '@mui/material'

import { useForm } from 'react-hook-form'

import type { MemberBasicDtoType } from '@/@core/types'
import { MEMBER_INPUT_INFO } from '@/app/_constants/input/MemberInputInfo'
import { useGetLicenseNames, useMutateSingleMember } from '@/@core/hooks/customTanstackQueries'
import { handleApiError } from '@/utils/errorHandler'
import type { refType } from '../UserModal'
import useCurrentUserStore from '@/@core/utils/useCurrentUserStore'
import TextInputBox from '@/@core/components/inputbox/TextInputBox'
import MultiInputBox from '@/@core/components/inputbox/MultiInputBox'

interface BasicTabContentProps {
  defaultData: MemberBasicDtoType
}

const BasicTabContent = forwardRef<refType, BasicTabContentProps>(({ defaultData }, ref) => {
  const memberId = defaultData.memberId

  const { currentUser, setCurrentUserName } = useCurrentUserStore()

  const { mutateAsync: mutateBasicAsync } = useMutateSingleMember<MemberBasicDtoType>(memberId.toString(), 'basic')
  const { data: licenseNames } = useGetLicenseNames()
  const companyNameOption = licenseNames?.map(v => ({ value: v.companyName, label: v.companyName }))

  const form = useForm<MemberBasicDtoType>({
    defaultValues: {
      ...defaultData,
      name: defaultData.name ?? '',
      email: defaultData.email ?? '',
      companyName: defaultData.companyName ?? '',
      memberStatus: defaultData.memberStatus ?? '',
      note: defaultData.note ?? '',
      version: defaultData.version
    }
  })

  function dontSave() {
    form.reset()
  }

  const save = form.handleSubmit(async data => {
    try {
      const newBasic = await mutateBasicAsync(data)

      form.reset({
        ...newBasic,
        name: newBasic.name ?? '',
        email: newBasic.email ?? '',
        companyName: newBasic.companyName ?? '',
        memberStatus: newBasic.memberStatus ?? '',
        note: newBasic.note ?? '',
        version: newBasic.version
      })

      // 헤더에서 사용하는 정보 업데이트 (현재 로그인 중인 사용자의 정보라면)
      if (currentUser && currentUser.memberId === newBasic.memberId) {
        setCurrentUserName(newBasic.name)
      }

      console.log('basic 정보 수정 완료')
    } catch (e) {
      console.log(e)
      handleApiError(e)
    }
  })

  useImperativeHandle(ref, () => ({
    handleSave: save,
    handleDontSave: dontSave,
    dirty: form.formState.isDirty
  }))

  return (
    <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
      <Grid2 container spacing={3} columns={2} columnSpacing={5}>
        <TextInputBox name='name' form={form} labelMap={MEMBER_INPUT_INFO.basic} column={1} />
        <TextInputBox name='email' form={form} labelMap={MEMBER_INPUT_INFO.basic} column={1} />
        <MultiInputBox
          name='companyName'
          form={form}
          labelMap={{
            ...MEMBER_INPUT_INFO.basic,
            companyName: { ...MEMBER_INPUT_INFO.basic.companyName, options: companyNameOption }
          }}
          column={1}
        />
        <MultiInputBox name='memberStatus' form={form} labelMap={MEMBER_INPUT_INFO.basic} column={1} />
        <TextInputBox multiline name='note' form={form} labelMap={MEMBER_INPUT_INFO.basic} column={2} />
      </Grid2>
    </DialogContent>
  )
})

export default BasicTabContent
