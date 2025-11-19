import { auth } from '@/lib/auth'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import getS3Key from './getS3Key'

export const uploadInspectionPictures = async (
  machineProjectId: string,
  inspectionId: string,
  filesToUpload: File[],
  checklistItemId: number,
  checklistSubItemId: number
) => {
  try {
    const S3uploadResults = await getS3Key(
      machineProjectId,
      filesToUpload,
      inspectionId,
      checklistItemId,
      checklistSubItemId,
      undefined
    )

    if (!S3uploadResults) {
      return
    }

    // 3. DB에 사진 정보 기록 (백엔드 서버로 POST)
    const machinePicCreateRequestDtos = S3uploadResults.map(result => ({
      machineChecklistSubItemId: checklistSubItemId, // 기본값 또는 selectedMachine에서 가져오기
      originalFileName: result.fileName,
      s3Key: result.s3Key

      // cdnPath는 추후 확장사항
    }))

    const dbResponse = await auth.post<{ data: { machinePicIds: number[] } }>(
      `/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}/machine-pics`,
      {
        machinePicCreateRequestDtos
      }
    )

    const uploadedPicIds = dbResponse.data.data.machinePicIds

    console.log('DB 기록 완료:', uploadedPicIds)
    handleSuccess(`${uploadedPicIds.length}개 사진이 성공적으로 업로드되었습니다.`)

    return true
  } catch (e) {
    handleApiError(e)

    return false
  }
}

export const uploadSingleInspectionPic = async (
  machineProjectId: string,
  inspectionId: string,
  file: File,
  checklistItemId: number,
  checklistSubItemId: number
) => {
  try {
    const S3uploadResults = await getS3Key(
      machineProjectId,
      [file],
      inspectionId,
      checklistItemId,
      checklistSubItemId,
      undefined
    )

    if (!S3uploadResults) {
      return
    }

    // 3. DB에 사진 정보 기록 (백엔드 서버로 POST)
    const machinePicCreateRequestDtos = S3uploadResults.map(result => ({
      machineChecklistSubItemId: checklistSubItemId, // 기본값 또는 selectedMachine에서 가져오기
      originalFileName: result.fileName,
      s3Key: result.s3Key

      // cdnPath는 추후 확장사항
    }))

    const dbResponse = await auth.post<{ data: { machinePicIds: number[] } }>(
      `/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}/machine-pics`,
      {
        machinePicCreateRequestDtos
      }
    )

    const uploadedPicIds = dbResponse.data.data.machinePicIds

    console.log('DB 기록 완료:', uploadedPicIds)

    return true
  } catch (e) {
    console.log('사진 업로드 실패', e)

    return false
  }
}
