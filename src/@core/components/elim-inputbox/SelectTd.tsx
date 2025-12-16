import type { SelectProps } from '@mui/material'
import { MenuItem, Select, Typography } from '@mui/material'
import type { Path, UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'

type SelectTdProps<T extends Record<string, any>> = {
  form: UseFormReturn<T, any, undefined>
  name: Path<T>
  option: { label: string; value: string }[]
  placeholder?: string
} & Omit<SelectProps, 'displayEmpty' | 'renderValue'>

/**
 * border가 없는 MUI Select가 내재된 td
 * @param form *
 * @param name *
 * @param option *
 * @param placeholder
 * @returns
 * @prop MUI Select props 사용 가능
 */
export default function SelectTd<T extends Record<string, any>>({
  form,
  name,
  option,
  placeholder,
  ...rest
}: SelectTdProps<T>) {
  return (
    <td className='p-0'>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <Select
            value={field.value}
            onChange={field.onChange}
            size='small'
            sx={{ '.MuiOutlinedInput-notchedOutline': { border: 0, borderRadius: 0 } }}
            fullWidth
            displayEmpty
            renderValue={value =>
              value ? (
                <Typography variant='inherit'>{option.find(v => v.value === value)?.label}</Typography>
              ) : (
                <Typography variant='inherit' color='lightgray'>
                  {placeholder ?? '미정'}
                </Typography>
              )
            }
            {...rest}
          >
            {option?.map(v => (
              <MenuItem key={v.value} value={v.value}>
                {v.label}
              </MenuItem>
            ))}
          </Select>
        )}
      />
    </td>
  )
}
