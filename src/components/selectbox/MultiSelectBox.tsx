import type { ChangeEventHandler } from 'react'

import { MenuItem } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'
import type { InputFieldType } from '@/app/_type/types'

interface MultiSelectBoxProps {
  tabField: InputFieldType
  name?: string
  id?: string
  label?: string | false
  value: string
  disabled?: boolean
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
}

/**
 *
 * @param tabField
 * 해당 필드의 정보 (ex. {
 *
    size?: BoxSizeType

     type: InputType

    label: string

     options?: Array<{ value: string; label: string }>

     disabled?: boolean

 })
 * @param id
 * 속성의 영어 이름 (ex. companyName, officePosition, ...)
 * @returns
 */
const MultiSelectBox = ({ label, name, tabField, id, disabled = false, value, onChange }: MultiSelectBoxProps) => {
  return (
    <CustomTextField
      id={id}
      disabled={disabled}
      select
      fullWidth
      label={label}
      value={value ?? ''}
      onChange={onChange}
      slotProps={{
        select: { displayEmpty: true },
        htmlInput: { name: name }
      }}
    >
      <MenuItem value=''>전체</MenuItem>
      {tabField?.options?.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </CustomTextField>
  )
}

export default MultiSelectBox
