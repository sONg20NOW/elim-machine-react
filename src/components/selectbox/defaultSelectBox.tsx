import type { ChangeEventHandler } from 'react'

import { MenuItem } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'

interface DefaultSelectBoxProps {
  id: string
  label: string
  value: string
  loading: boolean
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  options: Array<object>
}

const DefaultSelectBox = ({ id, label, value, loading, onChange, options }: DefaultSelectBoxProps) => {
  return (
    <CustomTextField
      select
      fullWidth
      id={id}
      label={label}
      value={value || ''}
      onChange={onChange}
      disabled={loading}
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

export default DefaultSelectBox
