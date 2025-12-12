import useUpdateParams from './useUpdateParams'

/**
 * {key1: value1, key2: value2, ...}의 형태로 정보를 전달하면 반영된 searchParams로 라우팅해주는 함수
 * @returns
 * @see @core\hooks\searchParams\useUpdateParams.ts
 */
export default function useSetQueryParams<T extends string | number | symbol>() {
  const updateParams = useUpdateParams()

  return (pairs: Partial<Record<T, string | number>>) => {
    if (!pairs) return

    updateParams(params => {
      Object.entries(pairs).forEach(([key, value]) => {
        const t_key = key as T
        const t_value = value as string | number

        params.set(t_key.toString(), t_value.toString())
      })
    })
  }
}
