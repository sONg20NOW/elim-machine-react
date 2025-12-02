import { Grid2, TextField, Typography } from '@mui/material'
import { useFormState, type Path, type PathValue, type RegisterOptions, type UseFormReturn } from 'react-hook-form'

import PostCodeButton from './PostCodeButton'

interface TextInputBoxProps<T extends Record<string, any>> {
  name: Path<T>
  form: UseFormReturn<T, any, undefined>
  labelMap: Partial<Record<Path<T>, { label: string }>>
  column?: number
  multiline?: boolean
  disabled?: boolean
  postcode?: boolean
  required?: boolean
  rule?: RegisterOptions<T, Path<T>> | undefined
  type?: 'number' | 'date'
}

/**
 * useForm을 사용할 때 쓰는 input box (텍스트 입력용)
 * @param name * form의 name
 * @param form * form
 * @param labelMap * INPUT_INFO
 * @param column 1: 반칸, 2: fullWidth (기본값: 1)
 * @param multiline multiline 여부
 * @param disabled disabled 여부
 * @param postcode 주소 검색 창 사용 여부
 * @param required required 여부
 * @param rule register 입력값 검증 객체
 * @param type number 혹은 date로 타입 지정
 */
export default function TextInputBox<T extends Record<string, any>>({
  name,
  form,
  labelMap,
  column = 1,
  multiline = false,
  disabled = false,
  postcode = false,
  required = false,
  rule,
  type
}: TextInputBoxProps<T>) {
  const label = labelMap[name]?.label ?? ''

  const dirty = (form.formState.dirtyFields as any)[name]

  const error = useFormState({ ...form, name: name }).errors[name]

  return (
    <Grid2 size={column}>
      <div className='flex flex-col w-full relative'>
        <Typography
          {...(dirty && { color: 'primary.main' })}
          {...(error && { color: 'error.main' })}
          {...(disabled && { color: 'lightgray' })}
          sx={{ position: 'relative', width: 'fit-content' }}
        >
          {label}
          {required && <sup className='absolute right-0 translate-x-full text-red-500'>*</sup>}
        </Typography>
        <TextField
          disabled={disabled}
          {...(type && { type: type })}
          {...(multiline && { multiline: true, minRows: 3 })}
          {...form.register(name, { ...rule, required: { value: required, message: '필수 입력입니다' } })}
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
        {error && (
          <Typography
            variant='caption'
            sx={{ position: 'absolute', right: 0, top: 0 }}
            color='error.main'
            align='right'
          >
            {error.message?.toString()}
          </Typography>
        )}
      </div>
    </Grid2>
  )
}
