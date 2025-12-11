import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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
