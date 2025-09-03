import type { ChangeEventHandler } from 'react'

import { MenuItem } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'

interface MultiSelectBoxProps {
  id: string
  label: string
  value: string
  disabled?: boolean
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  options: Array<object>
}

const MultiSelectBox = ({ id, label, value, disabled = false, onChange, options }: MultiSelectBoxProps) => {
  return (
    <CustomTextField
      select
      fullWidth
      id={id}
      label={label}
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      slotProps={{
        select: { displayEmpty: true }
      }}
    >
      <MenuItem value=''>전체</MenuItem>
      {options.map((option: any) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </CustomTextField>
  )
}

export default MultiSelectBox
