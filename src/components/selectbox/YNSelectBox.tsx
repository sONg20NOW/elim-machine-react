import type { ChangeEventHandler } from 'react'

import { MenuItem } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'

interface YNSelectBoxProps {
  id?: string
  label: string
  value: string
  disabled?: boolean
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
}

const YNSelectBox = ({ id, label, value, disabled = false, onChange }: YNSelectBoxProps) => {
  return (
    <CustomTextField
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
