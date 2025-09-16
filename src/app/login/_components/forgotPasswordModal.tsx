'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'

import { useForm } from 'react-hook-form'

import DefaultModal from '@/app/_components/DefaultModal'

type ForgotForm = { email: string }
type VerifyForm = { email: string; code: string }
type ResetForm = { email: string; password: string }

export default function ForgotPasswordPage({
  open,
  setOpen
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) {
  const [step, setStep] = useState<'forgot' | 'verify' | 'reset'>('forgot')
  const [email, setEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<any>()

  // 1단계: 이메일 입력
  const handleForgot = async (data: ForgotForm) => {
    try {
      await axios.post('/api/auth/forgot-password', { email: data.email })
      setEmail(data.email)
      setStep('verify')
      alert('인증 코드가 이메일로 발송되었습니다.')
    } catch (e: any) {
      alert(e.response?.data?.message || '비밀번호 찾기 실패')
    }
  }

  // 2단계: 코드 검증
  const handleVerify = async (data: VerifyForm) => {
    try {
      await axios.post('/api/auth/verify-code', { email, code: data.code })
      setStep('reset')
      alert('인증 코드가 확인되었습니다. 새 비밀번호를 입력하세요.')
    } catch (e: any) {
      alert(e.response?.data?.message || '코드 검증 실패')
    }
  }

  // 3단계: 비밀번호 재설정
  const handleReset = async (data: ResetForm) => {
    try {
      await axios.post('/api/auth/reset-password', { email, password: data.password })
      alert('비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.')
      window.location.href = '/login'
    } catch (e: any) {
      alert(e.response?.data?.message || '비밀번호 재설정 실패')
    }
  }

  return (
    <DefaultModal size='xs' open={open} setOpen={setOpen} title='비밀번호 찾기'>
      <div className='flex justify-center items-center'>
        {step === 'forgot' && (
          <form onSubmit={handleSubmit(handleForgot)}>
            <input
              type='email'
              placeholder='이메일'
              {...register('email', { required: '이메일을 입력하세요' })}
              className='border p-2 w-full mb-2'
            />
            {errors.email && <p className='text-red-500'>{errors.email.message}</p>}
            <button type='submit' disabled={isSubmitting} className='bg-blue-500 text-white w-full py-2 rounded'>
              인증 코드 받기
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleSubmit(handleVerify)}>
            <h1 className='text-lg font-bold mb-4'>인증 코드 확인</h1>
            <input
              type='text'
              placeholder='인증 코드'
              {...register('code', { required: '코드를 입력하세요' })}
              className='border p-2 w-full mb-2'
            />
            {errors.code && <p className='text-red-500'>{errors.code.message}</p>}
            <button type='submit' disabled={isSubmitting} className='bg-green-500 text-white w-full py-2 rounded'>
              확인
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleSubmit(handleReset)}>
            <h1 className='text-lg font-bold mb-4'>새 비밀번호 설정</h1>
            <input
              type='password'
              placeholder='새 비밀번호'
              {...register('password', { required: '비밀번호를 입력하세요' })}
              className='border p-2 w-full mb-2'
            />
            {errors.password && <p className='text-red-500'>{errors.password.message}</p>}
            <button type='submit' disabled={isSubmitting} className='bg-purple-500 text-white w-full py-2 rounded'>
              비밀번호 변경
            </button>
          </form>
        )}
      </div>
    </DefaultModal>
  )
}
