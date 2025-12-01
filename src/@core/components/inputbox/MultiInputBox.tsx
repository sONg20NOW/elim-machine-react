import { Grid2, MenuItem, TextField, Typography } from '@mui/material'
import type { Path, UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { YNOption } from '@/app/_constants/options'

interface MultiInputBoxProps<T extends Record<string, any>> {
  form: UseFormReturn<T, any, undefined>
  labelMap: Partial<Record<Path<T>, Partial<{ label: string; options: { label: string; value: string }[] }>>>
  name: Path<T>
  disabled?: boolean
  column?: 1 | 2
}

/**
 * useForm을 사용할 때 쓰는 input box (select용)
 * @param name * form의 name
 * @param form * form
 * @param labelMap * INPUT_INFO
 * @param column 1: 반칸, 2: fullWidth (기본값: 1)
 * @param diabled 선택 옵션
 */
export default function MultiInputBox<T extends Record<string, any>>({
  form,
  labelMap,
  name,
  disabled = false,
  column = 1
}: MultiInputBoxProps<T>) {
  const label = labelMap[name]?.label ?? ''
  const option = name.includes('Yn') ? YNOption : labelMap[name]?.options

  const dirty = (form.formState.dirtyFields as any)[name]

  return (
    <Grid2 size={column}>
      <div className='flex flex-col w-full'>
        <Typography {...(dirty && { color: 'primary.main' })} {...(disabled && { color: 'lightgray' })}>
          {label}
        </Typography>
        <Controller
          name={name}
          control={form.control}
          render={({ field }) => (
            <TextField
              disabled={disabled}
              size='small'
              value={field.value}
              onChange={field.onChange}
              select
              slotProps={{
                select: {
                  displayEmpty: true,
                  renderValue: v => {
                    const foundOption = option?.find(p => p.value === v)

                    return foundOption ? (
                      <Typography variant='inherit'>{foundOption.label}</Typography>
                    ) : (
                      <Typography variant='inherit' fontStyle={'italic'} color='gray'>
                        미정
                      </Typography>
                    )
                  }
                }
              }}
            >
              {option?.map(v => (
                <MenuItem value={v.value} key={v.value}>
                  {v.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </div>
    </Grid2>
  )
}
