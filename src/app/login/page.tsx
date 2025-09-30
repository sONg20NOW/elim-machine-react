'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { useForm } from 'react-hook-form'

import { Button, Divider, TextField, Typography } from '@mui/material'

import { ToastContainer } from 'react-toastify'

import ForgotPasswordPage from './_components/forgotPasswordModal'
import { login } from '@/lib/auth'

import 'react-toastify/ReactToastify.css'

type LoginFormInputs = {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormInputs>()

  const onSubmit = async (data: LoginFormInputs) => {
    const { email, password } = data

    const response = await login(email, password)

    if (response === 200) {
      router.push('/')
    }
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
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
              type='password'
              slotProps={{ htmlInput: { sx: { py: 1 } } }}
              placeholder='비밀번호를 입력하세요'
              {...register('password', { required: '비밀번호를 입력하세요' })}
              className='border  w-full'
            />
          </div>

          {errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}
          <div className='flex gap-3'>
            <Button variant='contained' sx={{ width: 'fit-content' }} type='submit' disabled={isSubmitting}>
              {isSubmitting ? '로그인 중...' : '로그인'}
            </Button>
            <Button onClick={() => setShowForgotPasswordModal(true)}>비밀번호 찾기</Button>
          </div>
        </div>
      </form>
      {showForgotPasswordModal && (
        <ForgotPasswordPage open={showForgotPasswordModal} setOpen={setShowForgotPasswordModal} />
      )}
      <ToastContainer autoClose={3000} />
    </div>
  )
}
