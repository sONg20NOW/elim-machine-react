import { auth } from '@/lib/auth'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

export default async function deleteInspection(
  machineProjectId: number,
  inspectionId: number,
  version: number,
  inspectionName: string
) {
  try {
    await auth.delete(`/api/machine-projects/${machineProjectId}/machine-inspections`, {
      // @ts-ignore
      data: {
        machineInspectionDeleteRequestDtos: [
          {
            machineInspectionId: inspectionId,
            version: version
          }
        ]
      }
    })

    handleSuccess(`${inspectionName}이(가) 삭제되었습니다`)

    return true
  } catch (e) {
    handleApiError(e)

    return false
  }
}
