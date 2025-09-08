import type { ChangeEventHandler } from 'react'

import Grid from '@mui/material/Grid2'

import CustomTextField from '@/@core/components/mui/TextField'
import MultiSelectBox from './MultiSelectBox'
import YNSelectBox from './YNSelectBox'
import type { BoxSizeType, InputFieldType } from '@/app/_type/types'

interface InputBoxProps {
  tabFieldKey: string
  value: string
  size?: BoxSizeType
  disabled?: boolean
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  tabInfos: Record<string, InputFieldType>
}

/**
 * @param size
 * box의 size, tabField에 정의되어 있는 사이즈보다 우선시됨.
 * @param tabInfos
 * id와 그에 따른 박스 구성에 필요한 정보들 (ex. name: {size: 'md', type: 'text', label: '이름'})
 * @param tabFieldKey
 * box 구성 정보를 알아내는 데 필요한 id (ex. companyName, ...)
 * @see
 * src\app\_schema\MemberTabInfo.tsx 참고
 */
export function InputBox({ size, tabInfos, tabFieldKey, disabled = false, value, onChange }: InputBoxProps) {
  const SizeMap = {
    sm: { xs: 12, sm: 2 },
    md: { xs: 12, sm: 6 },
    lg: { xs: 12 }
  }

  const tabField = tabInfos[tabFieldKey]

  return (
    <Grid size={SizeMap[size ?? tabField?.size ?? 'md']}>
      <InputBoxContainer
        tabField={tabField}
        tabFieldKey={tabFieldKey}
        value={value}
        disabled={tabField.disable ?? disabled}
        onChange={onChange}
      />
    </Grid>
  )
}

interface InputBoxContainerProps {
  tabFieldKey: string
  value: string
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  disabled?: boolean
  tabField: InputFieldType
}

function InputBoxContainer({ tabField, tabFieldKey, value, disabled, onChange }: InputBoxContainerProps) {
  switch (tabField?.type) {
    case 'date':
    case 'number':
      return (
        <CustomTextField
          slotProps={{ htmlInput: { name: tabFieldKey } }}
          type={tabField.type}
          id={tabFieldKey}
          disabled={disabled}
          fullWidth
          label={tabField.label}
          value={value}
          onChange={onChange}
        />
      )
    case 'multi':
      return (
        <MultiSelectBox
          name={tabFieldKey}
          tabField={tabField}
          id={tabFieldKey}
          disabled={disabled}
          value={value}
          onChange={onChange}
        />
      )
    case 'yn':
      return (
        <YNSelectBox
          name={tabFieldKey}
          id={tabFieldKey}
          disabled={disabled}
          label={tabField.label}
          value={value}
          onChange={onChange}
        />
      )
    case 'text':
      return (
        <CustomTextField
          slotProps={{ htmlInput: { name: tabFieldKey } }}
          id={tabFieldKey}
          disabled={disabled}
          fullWidth
          label={tabField.label}
          value={value}
          onChange={onChange}
        />
      )
    default:
      return null
  }
}
