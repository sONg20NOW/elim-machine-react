'use client'

import { useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useForm } from 'react-hook-form'

import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'

import { IconEye, IconEyeOff } from '@tabler/icons-react'

import ForgotPasswordPage from './_components/forgotPasswordModal'
import { login } from '@/lib/auth'

import 'react-toastify/ReactToastify.css'
import useCurrentUserStore from '@/@core/utils/useCurrentUserStore'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { printErrorSnackbar, printSuccessSnackbar } from '@/@core/utils/snackbarHandler'

type LoginFormInputs = {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [showPW, setShowPW] = useState(false)
  const pwRef = useRef<HTMLInputElement>(null)

  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormInputs>()

  const onSubmit = async (data: LoginFormInputs) => {
    const { email, password } = data

    const response = await login(email, password)

    if (response === 200) {
      const userInfo = useCurrentUserStore.getState().currentUser
      const userName = userInfo?.name

      if (isTablet) {
        router.push('/check')

        printSuccessSnackbar(`환영합니다${userName ? `,\n${userName}님` : ''}`)
      } else {
        router.push('/')
        handleSuccess(`환영합니다${userName ? `,\n${userName}님` : ''}`)
      }
    } else {
      if (isTablet) {
        printErrorSnackbar(response, '로그인 오류 발생')
      } else {
        handleApiError(response, '로그인 오류 발생')
      }
    }
  }

  return (
    <div className='flex justify-center items-center min-h-[100dvh] bg-gray-100'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='bg-white py-6 px-10 rounded-lg shadow-md min-w-[400px] flex flex-col gap-2 items-center'
      >
        <Typography variant='h4' sx={{ mt: 2, fontWeight: 600 }}>
          엘림 워크스페이스
        </Typography>
        <Typography variant='h6'>로그인</Typography>
        <Divider />
        <div className='w-full flex flex-col gap-4 items-center'>
          <div className='flex flex-col gap-2 w-full'>
            <TextField
              type='email'
              slotProps={{ htmlInput: { sx: { py: 1 } } }}
              placeholder='이메일을 입력하세요'
              {...register('email', { required: '이메일을 입력하세요' })}
              className='border  w-full'
            />
            {errors.email && <p className='text-red-500 text-sm'>{errors.email.message}</p>}
            <TextField
              inputRef={pwRef}
              component={Box}
              type={!showPW ? 'password' : 'text'}
              slotProps={{
                htmlInput: { sx: { py: 1 } },
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => {
                          setShowPW(prev => !prev)
                          pwRef.current?.focus()
                        }}
                        onMouseDown={e => e.preventDefault()}
                        onMouseUp={e => e.preventDefault()}
                        sx={{ position: 'absolute', right: 0, top: 0 }}
                      >
                        {showPW ? <IconEyeOff /> : <IconEye />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
              placeholder='비밀번호를 입력하세요'
              {...register('password', { required: '비밀번호를 입력하세요' })}
              className='border w-full'
            />
          </div>

          {errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}
          <div className='flex gap-3'>
            <Button variant='contained' sx={{ width: 'fit-content' }} type='submit' disabled={isSubmitting}>
              {isSubmitting ? '로그인 중...' : '로그인'}
            </Button>
            <Button onClick={() => setShowForgotPasswordModal(true)}>비밀번호 변경</Button>
          </div>
        </div>
      </form>
      {showForgotPasswordModal && (
        <ForgotPasswordPage open={showForgotPasswordModal} setOpen={setShowForgotPasswordModal} />
      )}
      {/* <ToastContainer autoClose={3000} /> */}
    </div>
  )
}
