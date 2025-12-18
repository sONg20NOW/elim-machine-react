import { auth } from '@core/utils/auth'
import getPictureS3Key from './getPictureS3Key'
import type { machinePicCreateRequestDtoType } from '../types'

export const uploadInspectionPictures = async (
  machineProjectId: string,
  inspectionId: string,
  filesToUpload: File[],
  checklistItemId: number,
  checklistSubItemId: number
) => {
  try {
    const S3uploadResults = await getPictureS3Key(
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
    const machinePicCreateRequestDtos = S3uploadResults.map(
      result =>
        ({
          machineProjectChecklistSubItemId: checklistSubItemId, // 기본값 또는 selectedMachine에서 가져오기
          originalFileName: result.fileName,
          s3Key: result.s3Key

          // cdnPath는 추후 확장사항
        }) as machinePicCreateRequestDtoType
    )

    const dbResponse = await auth.post<{ data: { machinePicIds: number[] } }>(
      `/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}/machine-pics`,
      {
        machinePicCreateRequestDtos
      }
    )

    const uploadedPicIds = dbResponse.data.data.machinePicIds

    console.log('DB 기록 완료:', uploadedPicIds)

    return uploadedPicIds.length
  } catch (e) {
    console.log('사진 업로드 실패', e)

    return false
  }
}

/**
 * 사진 파일과 추가 정보를 받아서 S3Key를 만들고 이미지 새롭게 업로드
 * @param machineProjectId
 * @param inspectionId
 * @param file
 * @param checklistItemId
 * @param checklistSubItemId
 * @returns
 */
export const uploadSingleInspectionPic = async (
  machineProjectId: string,
  inspectionId: string,
  file: File,
  checklistItemId: number,
  checklistSubItemId: number
) => {
  try {
    const S3uploadResults = await getPictureS3Key(
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
    const machinePicCreateRequestDtos = S3uploadResults.map(
      result =>
        ({
          machineProjectChecklistSubItemId: checklistSubItemId, // 기본값 또는 selectedMachine에서 가져오기
          originalFileName: result.fileName,
          s3Key: result.s3Key

          // cdnPath는 추후 확장사항
        }) as machinePicCreateRequestDtoType
    )

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
