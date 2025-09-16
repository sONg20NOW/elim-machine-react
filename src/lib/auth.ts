import { redirect } from 'next/navigation'

import axios from 'axios'

import type { LoginResponseDtoType } from '@/app/_type/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

export const auth = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}`,
  withCredentials: true // 👈 쿠키(RefreshToken) 주고받기 위해 필요
})

// 로그인 함수 (로컬 스토리지에 accesstoken 저장)
export async function login(email: string, password: string) {
  try {
    const res = await axios.post<{ data: LoginResponseDtoType; code: number }>('/auth/web/login', { email, password })

    console.log(res)

    if (res.data.code === 200) {
      const accessToken = res.data.data.tokenResponseDto.accessToken // JSON body에서 가져옴

      localStorage.setItem('accessToken', accessToken)
      handleSuccess('로그인에 성공했습니다.')
      redirect('/')
    } else {
      throw new Error()
    }
  } catch (error) {
    handleApiError(error)
  }
}

// 헤더에 access token 추가
auth.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    config.headers!.Authorization = `Bearer ${token}`
  }

  return config
})

// api.interceptors.response.use(
//   response => response,
//   async error => {
//     if (error.response?.status === 401) {
//       try {
//         // RefreshToken은 쿠키에 있기 때문에 단순 호출만 해주면 됨
//         const res = await api.post<{ data: TokenResponseDto }>('/auth/web/refresh')
//         const newAccessToken = res.data.data.accessToken

//         localStorage.setItem('accessToken', newAccessToken)

//         // 실패했던 요청 다시 실행
//         error.config.headers.Authorization = `Bearer ${newAccessToken}`

//         return api.request(error.config)
//       } catch (err) {
//         // Refresh도 실패 → 로그인 페이지로 이동
//         localStorage.removeItem('accessToken')
//         window.location.href = '/login'
//       }
//     }

//     return Promise.reject(error)
//   }
// )
