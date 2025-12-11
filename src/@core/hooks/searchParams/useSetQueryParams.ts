import useUpdateParams from './useUpdateParams'

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
