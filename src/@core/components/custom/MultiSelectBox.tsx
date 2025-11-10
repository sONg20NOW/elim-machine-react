import { useCallback, useEffect, useState, type ChangeEventHandler } from 'react'

import { MenuItem } from '@mui/material'

import CustomTextField from '@/@core/components/mui/TextField'
import type { InputFieldType } from '@/@core/types'
import { handleApiError } from '@/utils/errorHandler'
import { auth } from '@/lib/auth'

interface MultiSelectBoxProps {
  tabField: InputFieldType
  name?: string
  id?: string
  label?: string | false
  value: string
  disabled?: boolean
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  required?: boolean
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
const MultiSelectBox = ({
  label,
  name,
  tabField,
  id,
  disabled = false,
  value,
  onChange,
  required
}: MultiSelectBoxProps) => {
  const [companyNameOption, setCompanyNameOption] = useState<{ value: string; label: string }[]>([])

  const getCompanyNameOption = useCallback(async () => {
    try {
      const response = await auth.get<{
        data: { licenseIdAndNameResponseDtos: { id: number; companyName: string }[] }
      }>(`/api/licenses/names`)

      setCompanyNameOption(
        response.data.data.licenseIdAndNameResponseDtos.map(v => ({ value: v.companyName, label: v.companyName }))
      )
    } catch (error) {
      handleApiError(error)
    }
  }, [])

  useEffect(() => {
    if (id === 'companyName') {
      getCompanyNameOption()
    }
  }, [id, getCompanyNameOption])

  return (
    <CustomTextField
      id={id}
      disabled={disabled}
      select
      fullWidth
      label={label}
      value={value ?? ''}
      onChange={onChange}
      required={required ?? false}
      slotProps={{
        select: { displayEmpty: true },
        htmlInput: { name: name }
      }}
    >
      <MenuItem value=''>전체</MenuItem>
      {(id === 'companyName' ? companyNameOption : tabField?.options)?.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </CustomTextField>
  )
}

export default MultiSelectBox
