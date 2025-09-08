import type { ChangeEventHandler } from 'react'

import { MenuItem } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'
import type { TabFieldType } from '@/app/_schema/MemberTabInfo'

interface MultiSelectBoxProps {
  tabField: TabFieldType
  name?: string
  id?: string
  value: string
  disabled?: boolean
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
}

/**
 *
 * @param tabField
 * 어떤 페이지에서 사용하는지 여부 (ex. member, machine, ...)
 * @param id
 * 속성의 영어 이름 (ex. companyName, officePosition, ...)
 * @returns
 */
const MultiSelectBox = ({ name, tabField, id, disabled = false, value, onChange }: MultiSelectBoxProps) => {
  return (
    <CustomTextField
      id={id}
      disabled={disabled}
      select
      fullWidth
      label={tabField?.label ?? ''}
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
