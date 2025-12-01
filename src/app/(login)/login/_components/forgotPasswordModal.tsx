'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'

import { useForm } from 'react-hook-form'

import { Button, TextField, Typography } from '@mui/material'

import axios from 'axios'

import DefaultModal from '@/@core/components/custom/DefaultModal'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

type ForgotForm = { email: string }
type VerifyForm = { email: string; code: string }
type ResetForm = { email: string; password: string }

export default function ForgotPasswordPage({
  open,
  setOpen,
  userEmail
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  userEmail?: string
}) {
  const [step, setStep] = useState<'forgot' | 'verify' | 'reset'>('forgot')
  const [email, setEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<{ email: string; code: string; password: string }>()

  // 1단계: 이메일 입력
  const handleForgot = async (data: ForgotForm) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/authentication/forgot-password`, {
        email: data.email
      })
      setEmail(data.email)
      setStep('verify')
      handleSuccess('인증 코드가 이메일로 발송되었습니다.')
    } catch (e) {
      handleApiError(e)
    }
  }

  // 2단계: 코드 검증
  const handleVerify = async (data: VerifyForm) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/authentication/verify-code`, {
        email,
        code: data.code
      })
      setStep('reset')
      handleSuccess('인증 코드가 확인되었습니다. 새 비밀번호를 입력하세요.')
    } catch (e) {
      handleApiError(e)
    }
  }

  // 3단계: 비밀번호 재설정
  const handleReset = async (data: ResetForm) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/authentication/reset-password`, {
        email,
        password: data.password
      })
      handleSuccess('비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.')
      window.location.href = '/login'
    } catch (e) {
      handleApiError(e)
    }
  }

  return (
    <DefaultModal
      size='xs'
      open={open}
      setOpen={setOpen}
      title={
        <Typography variant='inherit' sx={{ fontWeight: 500 }}>
          {{ forgot: '비밀번호 변경', verify: '인증 코드 확인', reset: '새 비밀번호 설정' }[step]}
        </Typography>
      }
    >
      <div className='flex justify-center items-center'>
        {step === 'forgot' && (
          <form onSubmit={handleSubmit(handleForgot)} className='flex flex-col gap-3 items-start'>
            <div className='flex flex-col gap-1'>
              <TextField
                size='small'
                defaultValue={userEmail}
                type='email'
                placeholder='이메일'
                {...register('email', { required: '이메일을 입력하세요' })}
                slotProps={{ root: { sx: { minWidth: '300px' } }, htmlInput: { sx: { py: 1.5 } } }}
              />
              {errors.email && <Typography className='text-red-500'>{errors.email.message?.toString()}</Typography>}
            </div>

            <Button type='submit' disabled={isSubmitting} variant='contained' sx={{ width: 'fit-content' }}>
              {!isSubmitting ? '인증 코드 받기' : '코드 받는 중...'}
            </Button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleSubmit(handleVerify)} className='flex flex-col gap-3 items-start'>
            <div className='flex flex-col gap-1'>
              <TextField
                size='small'
                type='text'
                placeholder='인증 코드'
                {...register('code', { required: '코드를 입력하세요' })}
                slotProps={{ root: { sx: { minWidth: '300px' } }, htmlInput: { sx: { py: 1.5 } } }}
              />
              {errors.code && <Typography className='text-red-500'>{errors.code.message?.toString()}</Typography>}
            </div>
            <Button
              type='submit'
              disabled={isSubmitting}
              variant='contained'
              sx={{ width: 'fit-content', backgroundColor: 'green' }}
            >
              확인
            </Button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleSubmit(handleReset)} className='flex flex-col gap-3 items-start'>
            <div className='flex flex-col gap-1'>
              <TextField
                size='small'
                type='password'
                placeholder='새 비밀번호'
                {...register('password', { required: '비밀번호를 입력하세요' })}
                slotProps={{ root: { sx: { minWidth: '300px' } }, htmlInput: { sx: { py: 1.5 } } }}
              />
              {errors.password && <p className='text-red-500'>{errors.password.message?.toString()}</p>}
            </div>
            <Button
              type='submit'
              disabled={isSubmitting}
              variant='contained'
              sx={{ width: 'fit-content', backgroundColor: 'purple' }}
            >
              비밀번호 변경
            </Button>
          </form>
        )}
      </div>
    </DefaultModal>
  )
}
