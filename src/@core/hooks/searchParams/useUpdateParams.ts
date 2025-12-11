import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/**
 * updateParams() 함수 반환
 * @returns params update 함수를 인자로 받아 해당 URL로 라우팅해주는 함수
 */
export default function useUpdateParams() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  return (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams)

    updater(params)
    router.replace(pathname + '?' + params.toString())
  }
}
