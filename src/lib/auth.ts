import { redirect } from 'next/navigation'

import axios from 'axios'

import type { LoginResponseDtoType, TokenResponseDto } from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import useAuthStore from '@/@core/utils/useAuthStore'

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

      useAuthStore.getState().setAccessToken(accessToken)

      const UserInfo = res.data.data.loginMemberResponseDto

      localStorage.setItem('user', JSON.stringify(UserInfo))

      handleSuccess('로그인에 성공했습니다.')

      return res.data.code
    } else {
      throw new Error()
    }
  } catch (error) {
    handleApiError(error)
  }
}

export async function logout() {
  try {
    // ! CSRF token 같이 넣어서 POST
    await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/authentication/web/logout`, null, {
      withCredentials: true
    })
    localStorage.removeItem('user')
    handleSuccess('로그아웃되었습니다.')
  } catch (e) {
    handleApiError(e)
  } finally {
    useAuthStore.getState().setAccessToken(null)
    redirect('/login')
  }
}

// 헤더에 access token 추가
auth.interceptors.request.use(config => {
  const accessToken = useAuthStore.getState().accessToken

  if (accessToken) {
    config.headers!.Authorization = `Bearer ${accessToken}`
  } else {
    console.log('no access token')
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
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/authentication/web/refresh`,
          null,
          { withCredentials: true }
        )

        const newAccessToken = res.data.data.accessToken

        useAuthStore.getState().setAccessToken(newAccessToken)

        // 실패했던 요청 다시 실행
        error.config.headers.Authorization = `Bearer ${newAccessToken}`

        return auth(originalRequest)
      } catch (err) {
        // ! 나중에 주석 풀어야함
        // Refresh도 실패 → 로그인 페이지로 이동
        useAuthStore.getState().setAccessToken(null)

        // redirect('/login')
        console.log('refresh failed!')
      }
    }

    return Promise.reject(error)
  }
)
