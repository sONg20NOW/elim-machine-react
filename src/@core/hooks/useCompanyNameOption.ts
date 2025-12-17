import { useGetLicenseNames } from './customTanstackQueries'

export default function useCompanyNameOption() {
  const { data } = useGetLicenseNames()

  return data?.map(v => ({ label: v.companyName, value: v.companyName }))
}
