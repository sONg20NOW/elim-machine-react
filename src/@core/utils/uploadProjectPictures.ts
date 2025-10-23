import axios from 'axios'

import { auth } from '@/lib/auth'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

export const uploadPictures = async (machineProjectId: string, inspectionId: string, filesToUpload: File[]) => {
  try {
    // 1. 프리사인드 URL 요청 (백엔드 서버로 POST해서 받아옴.)
    const presignedResponse = await auth.post<{
      data: { presignedUrlResponseDtos: { s3Key: string; presignedUrl: string }[] }
    }>(`/api/presigned-urls/machine-projects/${machineProjectId}/machine-project-pics/upload`, {
      uploadType: 'PROJECT_IMAGE',
      originalFileNames: filesToUpload.map(file => file.name)
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

    console.log('S3 bucket에 업로드 완료:', uploadResults)

    // 3. DB에 사진 정보 기록 (백엔드 서버로 POST)
    const machinePicCreateRequestDtos = uploadResults.map(result => ({
      originalFileName: result.fileName,
      s3Key: result.s3Key
    }))

    const dbResponse = await auth.post<{ data: { machineProjectPicIds: number[] } }>(
      `/api/machine-projects/${machineProjectId}/machine-project-pics`,
      {
        machinePicCreateRequestDtos
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
