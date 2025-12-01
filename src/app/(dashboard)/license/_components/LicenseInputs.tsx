import { Grid2 } from '@mui/material'

import type { UseFormReturn } from 'react-hook-form'

import TextInputBox from '@/@core/components/inputbox/TextInputBox'
import type { LicenseCreateRequestDto } from '@/@core/types'
import { LICENSE_INPUT_INFO } from '@/app/_constants/input/LicenseInputInfo'

export default function LicenseInputs({ form }: { form: UseFormReturn<LicenseCreateRequestDto, any, undefined> }) {
  return (
    <div className='grid gap-8'>
      <Grid2 container rowSpacing={1} columnSpacing={5} columns={2}>
        <TextInputBox required form={form} name={'companyName'} labelMap={LICENSE_INPUT_INFO} />
        <TextInputBox form={form} name={'companyNameAbbr'} labelMap={LICENSE_INPUT_INFO} />
        <TextInputBox form={form} name={'bizno'} labelMap={LICENSE_INPUT_INFO} />
        <TextInputBox form={form} name={'ceoName'} labelMap={LICENSE_INPUT_INFO} />
      </Grid2>
      <Grid2 container rowSpacing={1} columnSpacing={5} columns={2}>
        <TextInputBox form={form} name={'managerName'} labelMap={LICENSE_INPUT_INFO} />
        <TextInputBox form={form} name={'managerEmail'} labelMap={LICENSE_INPUT_INFO} />
        <TextInputBox form={form} name={'managerPhoneNumber'} labelMap={LICENSE_INPUT_INFO} />
      </Grid2>
      <Grid2 container rowSpacing={1} columnSpacing={5} columns={2}>
        <TextInputBox form={form} name={'taxEmail'} labelMap={LICENSE_INPUT_INFO} />
        <TextInputBox form={form} name={'homepageAddr'} labelMap={LICENSE_INPUT_INFO} />
        <TextInputBox form={form} name={'fax'} labelMap={LICENSE_INPUT_INFO} />
        <TextInputBox form={form} name={'tel'} labelMap={LICENSE_INPUT_INFO} />
      </Grid2>
      <Grid2 container rowSpacing={1} columnSpacing={5} columns={2}>
        <TextInputBox type='date' form={form} name={'contractDate'} labelMap={LICENSE_INPUT_INFO} />
        <TextInputBox type='date' form={form} name={'expireDate'} labelMap={LICENSE_INPUT_INFO} />
      </Grid2>
      <Grid2 container rowSpacing={1} columnSpacing={5} columns={2}>
        <TextInputBox form={form} name={'businessCategory'} labelMap={LICENSE_INPUT_INFO} />
        <TextInputBox form={form} name={'businessType'} labelMap={LICENSE_INPUT_INFO} />
        <TextInputBox column={2} postcode form={form} name={'roadAddress'} labelMap={LICENSE_INPUT_INFO} />
        <TextInputBox column={2} form={form} name={'detailAddress'} labelMap={LICENSE_INPUT_INFO} />
      </Grid2>
      <Grid2 container rowSpacing={1} columnSpacing={5} columns={2}>
        <TextInputBox multiline column={2} form={form} name={'remark'} labelMap={LICENSE_INPUT_INFO} />
      </Grid2>
    </div>
  )
}
