import { auth } from '@core/utils/auth'
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'

/**
 * 설비를 삭제하는 함수
 * @param machineProjectId
 * @param inspectionId
 * @param version
 * @param inspectionName
 * @returns 성공하면 true, 실패하면 false 아닙니까!
 * @caution 반드시 이 함수 뒤에 inspectionSimple tanstack query의 캐시를 삭제해야 함.
 */
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
