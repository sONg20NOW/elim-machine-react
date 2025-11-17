import type { ChangeEventHandler } from 'react'

import { MenuItem, Typography } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'
import type { ynResultType } from '@/@core/types'

interface YNSelectBoxProps {
  name?: string
  id?: string
  label?: string | false
  value: ynResultType | ''
  disabled?: boolean
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  required?: boolean
}

const YNSelectBox = ({ name, id, label, value, disabled = false, onChange, required }: YNSelectBoxProps) => {
  return (
    <CustomTextField
      required={required ?? false}
      slotProps={{
        htmlInput: { name: name },
        inputLabel: { sx: { color: required ? '#cc4c4cff !important' : '' } },
        select: {
          renderValue: v => {
            if (v == null || v === '')
              return (
                <Typography variant='inherit' sx={{ opacity: '40%' }}>
                  미정
                </Typography>
              )

            return <Typography variant='inherit'>{v === 'Y' ? '예' : '아니오'}</Typography>
          },
          displayEmpty: true
        }
      }}
      select
      fullWidth
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <MenuItem value='Y'>예</MenuItem>
      <MenuItem value='N'>아니오</MenuItem>
    </CustomTextField>
  )
}

export default YNSelectBox
