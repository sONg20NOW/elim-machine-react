import { auth } from '@core/utils/auth'
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import type { machineProjectPicTypeType } from '../types'
import getMachineProjectPicS3Key from './getMachineProjectPicS3Key'

export const uploadProjectPictures = async (
  machineProjectId: string,
  filesToUpload: File[],
  machineProjectPicType: machineProjectPicTypeType
) => {
  try {
    const S3uploadResults = await getMachineProjectPicS3Key(machineProjectId, filesToUpload, machineProjectPicType)

    if (!S3uploadResults) {
      return
    }

    // DB에 사진 정보 기록 (백엔드 서버로 POST)
    const machinePicCreateRequestDtos = S3uploadResults.map(result => ({
      machineProjectPicType: machineProjectPicType,
      originalFileName: result.fileName,
      s3Key: result.s3Key
    }))

    const dbResponse = await auth.post<{ data: { machineProjectPicIds: number[] } }>(
      `/api/machine-projects/${machineProjectId}/machine-project-pics`,
      {
        machineProjectPics: machinePicCreateRequestDtos
      }
    )

    const uploadedPicIds = dbResponse.data.data.machineProjectPicIds

    console.log('DB 기록 완료:', uploadedPicIds)
    handleSuccess(`${uploadedPicIds.length}개 사진이 성공적으로 업로드되었습니다.`)

    return true
  } catch (e) {
    handleApiError(e)

    return false
  }
}
