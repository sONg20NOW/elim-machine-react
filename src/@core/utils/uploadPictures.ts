import axios from 'axios'

import { auth } from '@/lib/auth'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

export const uploadPictures = async (
  machineProjectId: string,
  inspectionId: string,
  filesToUpload: File[],
  checklistItemId: number,
  checklistSubItemId: number
) => {
  try {
    // 1. 프리사인드 URL 요청 (백엔드 서버로 POST해서 받아옴.)
    const presignedResponse = await auth.post<{
      data: { presignedUrlResponseDtos: { s3Key: string; presignedUrl: string }[] }
    }>(`/api/presigned-urls/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}/upload`, {
      uploadType: 'INSPECTION_IMAGE',
      originalFileNames: filesToUpload.map(file => file.name),
      checklistItemId: checklistItemId,
      checklistSubItemId: checklistSubItemId

      // ! 현재 유저의 ID => 로그인 기능 구현 후 추가
      // memberId: 1
    })

    const presignedUrls = presignedResponse.data.data.presignedUrlResponseDtos

    // 2. 앞서 가져온 presignedURL로 각 파일을 S3에 직접 업로드 (AWS S3로 POST)
    const uploadPromises = filesToUpload.map(async (file, index) => {
      const presignedData = presignedUrls[index]

      if (!presignedData) {
        throw new Error(`파일 ${file.name}에 대한 프리사인드 URL을 받지 못했습니다.`)
      }

      console.log(`파일 ${file.name} 업로드 시작...`)

      // S3에 직접 업로드 (axios 사용)
      const uploadResponse = await axios.put(presignedData.presignedUrl, file, {
        headers: {
          'Content-Type': file.type
        }
      })

      console.log(`파일 ${file.name} 업로드 완료! ${uploadResponse}`)

      return {
        fileName: file.name,
        s3Key: presignedData.s3Key,
        uploadSuccess: true
      }
    })

    // 모든 파일 업로드 완료까지 대기
    const uploadResults = await Promise.all(uploadPromises)

    console.log('업로드 완료:', uploadResults)

    // 3. DB에 사진 정보 기록 (백엔드 서버로 POST)
    const machinePicCreateRequestDtos = uploadResults.map(result => ({
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

    return 0
  } catch (e) {
    handleApiError(e)

    return -1
  }
}
