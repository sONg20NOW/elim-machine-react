import { useState } from 'react'

import { Grid2, IconButton, TextField, Typography } from '@mui/material'
import { useFormState, type Path, type PathValue, type RegisterOptions, type UseFormReturn } from 'react-hook-form'

import { IconEye, IconEyeOff } from '@tabler/icons-react'

import PostCodeButton from '../elim-button/PostCodeButton'
import { auth } from '@/@core/utils/auth'
import useCurrentUserStore from '@/@core/hooks/zustand/useCurrentUserStore'
import { printWarningSnackbar } from '@/@core/utils/snackbarHandler'

interface TextInputBoxProps<T extends Record<string, any>> {
  name: Path<T>
  form: UseFormReturn<T, any, undefined>
  labelMap: Partial<Record<Path<T>, { label: string }>>
  column?: number
  multiline?: boolean | number
  disabled?: boolean
  placeholder?: string
  postcode?: boolean
  juminNum?: boolean
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
 * @param placeholder placeholder 문자열
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
  placeholder,
  postcode = false,
  juminNum = false,
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
          placeholder={placeholder}
          {...(type && { type: type })}
          {...(multiline && { multiline: true, minRows: typeof multiline !== 'number' ? 3 : multiline })}
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
          {...(juminNum && {
            slotProps: {
              htmlInput: { name: name },
              input: {
                endAdornment: <JuminNumEndAdorment form={form} name={name} />
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

function JuminNumEndAdorment<T extends Record<string, any>>({
  form,
  name
}: {
  form: UseFormReturn<T, any, undefined>
  name: Path<T>
}) {
  const [show, setShow] = useState(false)

  const user = useCurrentUserStore(set => set.currentUser)
  const memberId = user?.memberId

  const watchedValue: string = form.watch(name)

  async function handleClick() {
    if (show) {
      form.setValue(name, watchedValue.substring(0, 8).concat('******').concat(watchedValue.substring(14)) as any)
    } else {
      if (!memberId) {
        printWarningSnackbar('현재 로그인 중인 계정 정보가 없습니다', 2000)

        return
      }

      const fullJuminNum = await auth
        .post<{ data: { juminNum: string } }>(`/api/members/jumin-num/view`, { memberId: memberId })
        .then(v => v.data.data.juminNum)

      form.setValue(name, fullJuminNum.concat(watchedValue.substring(14)) as any)
    }

    setShow(prev => !prev)
  }

  return <IconButton onClick={handleClick}>{show ? <IconEyeOff /> : <IconEye />}</IconButton>
}
