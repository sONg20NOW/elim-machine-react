'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import ReduxProvider from '@/redux-store/ReduxProvider' // Redux도 클라이언트 상태이므로 여기에 포함
import type { ChildrenType } from '@/@core/types'

// QueryClient 인스턴스는 한 번만 생성되도록 파일 범위에 정의
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      networkMode: 'offlineFirst',
      refetchOnWindowFocus: true,
      retry: false
    }
  }
})

export default function QueryClientWrapper({ children }: ChildrenType) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider>{children}</ReduxProvider>
    </QueryClientProvider>
  )
}
