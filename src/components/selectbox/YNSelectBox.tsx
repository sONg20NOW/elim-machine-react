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
    <CustomTextField select fullWidth id={id} label={label} value={value || ''} onChange={onChange} disabled={disabled}>
      <MenuItem value='Y'>예</MenuItem>
      <MenuItem value='N'>아니오</MenuItem>
    </CustomTextField>
  )
}

export default YNSelectBox
