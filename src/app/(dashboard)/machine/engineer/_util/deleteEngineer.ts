import { auth } from '@/lib/auth'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

const deleteEngineer = async (engineerId: number, version: number) => {
  try {
    await auth.delete(`/api/engineers`, {
      data: { engineerDeleteRequestDtos: [{ engineerId: engineerId, version: version }] }
    } as any)

    handleSuccess('설비인력에서 삭제되었습니다.')
  } catch (error) {
    handleApiError(error)
  }
}

export default deleteEngineer
