import type { ChangeEventHandler } from 'react'

import { MenuItem } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'

interface YNSelectBoxProps {
  name?: string
  id?: string
  label?: string | false
  value: string
  disabled?: boolean
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  required?: boolean
}

const YNSelectBox = ({ name, id, label, value, disabled = false, onChange, required }: YNSelectBoxProps) => {
  return (
    <CustomTextField
      required={required ?? false}
      slotProps={{ htmlInput: { name: name }, inputLabel: { sx: { color: required ? '#cc4c4cff !important' : '' } } }}
      select
      fullWidth
      id={id}
      label={label}
      value={value === '' ? '전체' : (value ?? '전체')}
      onChange={onChange}
      disabled={disabled}
    >
      {value === '' && (
        <MenuItem disabled={true} value='전체'>
          전체
        </MenuItem>
      )}
      <MenuItem value='Y'>예</MenuItem>
      <MenuItem value='N'>아니오</MenuItem>
    </CustomTextField>
  )
}

export default YNSelectBox
