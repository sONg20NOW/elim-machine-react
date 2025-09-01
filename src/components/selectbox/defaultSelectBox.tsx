import { MenuItem } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'

const DefaultSelectBox = ({ id, label, value, loading, onChange, options }: any) => {
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
