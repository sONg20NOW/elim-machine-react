'use client'

import { useState } from 'react'

import { useForm } from 'react-hook-form'

import { Button, Divider, TextField } from '@mui/material'

import ForgotPasswordPage from './_components/forgotPasswordModal'
import { login } from '@/lib/auth'

type LoginFormInputs = {
  email: string
  password: string
}

export default function LoginPage() {
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormInputs>()

  const onSubmit = async (data: LoginFormInputs) => {
    const { email, password } = data

    login(email, password)
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='bg-white py-6 px-10 rounded-lg shadow-md min-w-[400px] flex flex-col gap-5'
      >
        <span className='text-center text-3xl font-bold'>엘림 워크스페이스</span>
        <span className='text-xl font-semibold text-center'>로그인</span>
        <Divider />
        <div className='flex flex-col gap-2'>
          <TextField
            type='email'
            placeholder='이메일을 입력하세요'
            {...register('email', { required: '이메일을 입력하세요' })}
            className='border  w-full'
          />
          {errors.email && <p className='text-red-500 text-sm'>{errors.email.message}</p>}
          <TextField
            type='password'
            placeholder='비밀번호를 입력하세요'
            {...register('password', { required: '비밀번호를 입력하세요' })}
            className='border  w-full'
          />
          {errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}
          <Button
            type='submit'
            disabled={isSubmitting}
            className='bg-blue-500 text-white w-full py-2 rounded disabled:opacity-50'
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>
        </div>

        <Button onClick={() => setShowForgotPasswordModal(true)}>비밀번호 찾기</Button>
      </form>
      {showForgotPasswordModal && (
        <ForgotPasswordPage open={showForgotPasswordModal} setOpen={setShowForgotPasswordModal} />
      )}
    </div>
  )
}
