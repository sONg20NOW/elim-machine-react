import axios from 'axios'

import { auth } from '@core/utils/auth'
import { handleApiError } from '@core/utils/errorHandler'

/**
 * S3 Bucket에 안전진단현장 첨부파일들을 등록하고 s3Key 정보를 받는 함수
 * 
 * 해당 s3Key를 백엔드 서버에 저장하는 것을 별도로 처리해주어야 함.
 * @param safetyProjectId * string
 * @param files * 
 * @param attatchmentType * '건축물대장' | '시설물대장' | '과업지시서' | '교육수료증'
 * @returns s3Key 정보를 담은 객체 배열 {
    fileName: string;
    s3Key: string;
    uploadSuccess: boolean;
}[]
 */
export default async function getSafetyProjectAttatchmentS3Key(
  safetyProjectId: string,
  files: File[],
  attatchmentType: '건축물대장' | '시설물대장' | '과업지시서' | '교육수료증'
) {
  try {
    // 1. 프리사인드 URL 요청 (백엔드 서버로 POST해서 받아옴. -> S3 저장소 배정)
    const presignedResponse = await auth.post<{
      data: { presignedUrlResponseDtos: { s3Key: string; presignedUrl: string }[] }
    }>(`/api/presigned-urls/safety/projects/${safetyProjectId}`, {
      uploadType: 'SAFETY_PROJECT_ATTACHMENT',
      originalFileNames: files.map(file => file.name),
      attachmentType: attatchmentType
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

  return undefined
}
