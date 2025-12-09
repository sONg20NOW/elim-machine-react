import axios from 'axios'

import { auth } from '@/@core/utils/auth'
import { handleApiError } from '@/@core/utils/errorHandler'

/**
 * S3 Bucket에 사진들을 등록하고 s3Key 정보를 받는 함수
 * @param machineProjectId 필수
 * @param files 필수
 * @param inspectionId (설비사진 필수)
 * @param checklistItemId (설비사진 필수)
 * @param checklistSubItemId (설비사진 필수)
 * @param machineProjectPicType (현장사진 필수)
 * @returns s3Key 정보를 담은 객체 배열 {
    fileName: string;
    s3Key: string;
    uploadSuccess: boolean;
}[]
 */
export default async function getS3Key(
  machineProjectId: string,
  files: File[],
  inspectionId?: string,
  checklistItemId?: number,
  checklistSubItemId?: number,
  machineProjectPicType?: 'OVERVIEW' | 'ETC' | 'LOCATION_MAP'
) {
  const isInspectionPic = inspectionId && checklistItemId && checklistSubItemId
  const isProjectPic = machineProjectPicType

  // handle inspection image
  if (isInspectionPic) {
    try {
      // 1. 프리사인드 URL 요청 (백엔드 서버로 POST해서 받아옴.)
      const presignedResponse = await auth.post<{
        data: { presignedUrlResponseDtos: { s3Key: string; presignedUrl: string }[] }
      }>(`/api/presigned-urls/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}/upload`, {
        uploadType: 'INSPECTION_IMAGE',
        originalFileNames: files.map(file => file.name),
        checklistItemId: checklistItemId,
        checklistSubItemId: checklistSubItemId

        // ! 현재 유저의 ID => 로그인 기능 구현 후 추가
        // memberId: 1
      })

      const presignedUrls = presignedResponse.data.data.presignedUrlResponseDtos

      // 2. 앞서 가져온 presignedURL로 각 파일을 S3에 직접 업로드 (AWS S3로 POST)
      const uploadPromises = files.map(async (file, index) => {
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

      // 모든 파일 S3 bucket에 업로드 완료까지 대기
      const uploadResults = await Promise.all(uploadPromises)

      console.log('S3 bucket에 업로드 완료:', uploadResults)

      return uploadResults
    } catch (e) {
      handleApiError(e)
    }
  } else if (isProjectPic) {
    // handle project image
    try {
      // 1. 프리사인드 URL 요청 (백엔드 서버로 POST해서 받아옴.)
      const presignedResponse = await auth.post<{
        data: { presignedUrlResponseDtos: { s3Key: string; presignedUrl: string }[] }
      }>(`/api/presigned-urls/machine-projects/${machineProjectId}/machine-project-pics/upload`, {
        uploadType: 'PROJECT_IMAGE',
        originalFileNames: files.map(file => file.name),
        machineProjectPicType: machineProjectPicType
      })

      const presignedUrls = presignedResponse.data.data.presignedUrlResponseDtos

      // 2. 앞서 가져온 presignedURL로 각 파일을 S3에 직접 업로드 (AWS S3로 POST)
      const uploadPromises = files.map(async (file, index) => {
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

      // 모든 파일 S3 bucket에 업로드 완료까지 대기
      const uploadResults = await Promise.all(uploadPromises)

      console.log('S3 bucket에 업로드 완료:', uploadResults)

      return uploadResults
    } catch (e) {
      handleApiError(e)
    }
  }

  return undefined
}
