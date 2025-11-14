import axios from 'axios'

import type { LoginResponseDtoType, TokenResponseDto } from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

export const auth = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}`,
  withCredentials: true // 👈 쿠키(RefreshToken) 주고받기 위해 필요
})

// 로그인 함수 (클라이언트 컴포넌트) (로컬 스토리지에 accesstoken 저장)
export async function login(email: string, password: string) {
  try {
    const res = await axios.post<{ data: LoginResponseDtoType; code: number }>(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/authentication/web/login`,
      { email, password },
      { withCredentials: true }
    )

    if (res.data.code === 200) {
      const accessToken = res.data.data.tokenResponseDto.accessToken // JSON body에서 가져옴

      // console.log(atob(accessToken))

      localStorage.setItem('accessToken', accessToken)
      handleSuccess('로그인에 성공했습니다.')

      return res.data.code
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
  } else {
    throw new Error('there is no access token!')
  }

  return config
})

auth.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // 무한 루프 방지 플래그 설정

      try {
        // RefreshToken은 쿠키에 있기 때문에 단순 호출만 해주면 됨
        const res = await axios.post<{ data: TokenResponseDto }>(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/authentication/web/refresh`
        )

        const newAccessToken = res.data.data.accessToken

        localStorage.setItem('accessToken', newAccessToken)

        // 실패했던 요청 다시 실행
        error.config.headers.Authorization = `Bearer ${newAccessToken}`

        return auth(originalRequest)
      } catch (err) {
        // Refresh도 실패 → 로그인 페이지로 이동
        localStorage.removeItem('accessToken')
        window.location.href = '/login'

        return Promise.reject(err) // Refresh 실패 시 에러를 다시 던짐
      }
    }

    return Promise.reject(error)
  }
)
