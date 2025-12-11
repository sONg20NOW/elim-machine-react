import { auth } from '@core/utils/auth'
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'

export default async function deleteLicense(licenseId: number, version: number) {
  try {
    await auth.delete(`/api/licenses/${licenseId}`, {
      data: { licenseId: licenseId, version: version }
    } as any)

    handleSuccess('라이선스가 정상적으로 삭제되었습니다.')
  } catch (error) {
    handleApiError(error)
  }
}
