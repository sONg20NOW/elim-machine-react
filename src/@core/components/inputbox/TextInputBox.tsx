import { Button, Fab, Grid2, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { IconSearch } from '@tabler/icons-react'
import type { Path, PathValue, UseFormReturn } from 'react-hook-form'
import PostCodeButton from './PostCodeButton'

interface TextInputBoxProps<T extends Record<string, any>> {
  column: 1 | 2
  name: Path<T>
  form: UseFormReturn<T, any, undefined>
  labelMap: Partial<Record<Path<T>, { label: string }>>
  multiline?: boolean
  disabled?: boolean
  postcode?: boolean
  type?: 'number' | 'date'
}

/**
 * useForm을 사용할 때 쓰는 input box (텍스트 입력용)
 * @param column * 1: 반칸, 2: fullWidth
 * @param name * form의 name
 * @param form * form
 * @param labelMap * INPUT_INFO
 * @param multiline multiline 여부
 * @param disabled disabled 여부
 * @param postcode 주소 검색 창 사용 여부
 * @param number
 */
export default function TextInputBox<T extends Record<string, any>>({
  column,
  name,
  form,
  labelMap,
  multiline = false,
  disabled = false,
  postcode = false,
  type
}: TextInputBoxProps<T>) {
  const label = labelMap[name]?.label ?? ''

  const dirty = (form.formState.dirtyFields as any)[name]

  return (
    <Grid2 size={column}>
      <div className='flex flex-col w-full'>
        <Typography {...(dirty && { color: 'primary.main' })} {...(disabled && { color: 'lightgray' })}>
          {label}
        </Typography>
        <TextField
          disabled={disabled}
          {...(type && { type: type })}
          {...(multiline && { multiline: true, minRows: 3 })}
          {...form.register(name)}
          {...(postcode && {
            slotProps: {
              htmlInput: { name: name },
              input: {
                endAdornment: (
                  <PostCodeButton
                    onChange={value => form.setValue(name, value as PathValue<T, Path<T>>, { shouldDirty: true })}
                  />
                )
              }
            }
          })}
          size='small'
        />
      </div>
    </Grid2>
  )
}
