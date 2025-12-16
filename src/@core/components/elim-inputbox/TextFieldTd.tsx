import type { TextFieldProps } from '@mui/material'
import { TextField } from '@mui/material'
import type { Path, UseFormReturn } from 'react-hook-form'

type TextFieldTdProps<T extends Record<string, any>> = {
  form: UseFormReturn<T, any, undefined>
  name: Path<T>
} & Omit<TextFieldProps, 'displayEmpty' | 'renderValue' | 'size'>

/**
 * border가 없는 MUI TextField가 내재된 td
 * @param form
 * @param name
 * @returns
 * @prop MUI TextField props 사용 가능
 */
export default function TextFieldTd<T extends Record<string, any>>({ form, name, ...rest }: TextFieldTdProps<T>) {
  return (
    <td className='p-0'>
      <TextField
        size='small'
        fullWidth
        slotProps={{
          input: { sx: { '.MuiOutlinedInput-notchedOutline': { border: 0, borderRadius: 0 } } }
        }}
        {...form.register(name)}
        {...rest}
      />
    </td>
  )
}
