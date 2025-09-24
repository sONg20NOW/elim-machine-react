import { useEffect, useState, useCallback, useRef } from 'react'

import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material'
import axios from 'axios'

import { handleApiError } from '@/utils/errorHandler'
import type { MachinePicCursorType, MachinePicPresignedUrlResponseDtoType } from '@/app/_type/types'

const MachinePictures = ({ machineProjectId }: { machineProjectId: string }) => {
  const [pictures, setPictures] = useState<MachinePicPresignedUrlResponseDtoType[]>([])
  const pageSize = 5

  // 무한스크롤 관련 Ref들
  const isLoadingRef = useRef(false)
  const hasNextRef = useRef(true)
  const nextCursorRef = useRef<MachinePicCursorType | null>(undefined)

  // 현재 커서 정보에 기반해서 사진을 가져오는 함수.
  const getPictures = useCallback(async () => {
    if (!hasNextRef.current || isLoadingRef.current) return

    isLoadingRef.current = true

    const requestBody = {
      ...(nextCursorRef.current ? { cursor: nextCursorRef.current } : {})
    }

    try {
      const response = await axios.post<{
        data: {
          content: MachinePicPresignedUrlResponseDtoType[]
          hasNext: boolean
          nextCursor: MachinePicCursorType | null
        }
      }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-pics?page=0&size=${pageSize}`,
        requestBody
      )

      console.log('get pictures: ', response.data.data.content)
      setPictures(prev => prev.concat(response.data.data.content))
      hasNextRef.current = response.data.data.hasNext
      nextCursorRef.current = response.data.data.nextCursor
    } catch (err) {
      handleApiError(err)
    } finally {
      isLoadingRef.current = false
    }
  }, [machineProjectId])

  useEffect(() => {
    getPictures()
  }, [getPictures])

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight

    // 스크롤이 하단에서 100px 이내에 도달했을 때 다음 페이지 로드
    if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoadingRef.current && hasNextRef.current) {
      getPictures()
    }
  }, [getPictures])

  useEffect(() => {
    const checkAndLoad = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      // 스크롤이 아예 없거나 화면보다 내용이 적을 때
      if (scrollHeight <= clientHeight && hasNextRef.current && !isLoadingRef.current) {
        getPictures()
      }
    }

    // 초기 렌더링 직후, 데이터 불러오고 난 직후에도 체크
    checkAndLoad()

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll, getPictures, pictures])

  console.log('pictures', pictures)

  const removeFile = (index: number) => {
    console.log(index)
  }

  return (
    <div style={{ marginTop: 16 }}>
      {pictures?.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {/* ! 더 예쁘게 */}
          <ImageList cols={3} rowHeight={400}>
            {pictures.map((pic, index: number) => {
              console.log('pic', pic)

              return (
                <ImageListItem key={`${pic.machinePicId}-${index}`}>
                  <img
                    src={pic.presignedUrl}
                    alt={pic.originalFileName}
                    style={{
                      width: '100%',
                      height: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <ImageListItemBar
                    title={pic.originalFileName}
                    subtitle={`${pic.machineCategoryName} - ${pic.machineChecklistItemName} - ${pic.machineChecklistSubItemName}`}
                    position='below'
                  />

                  {/* <Button
                      size='small'
                      onClick={() => removeFile(index)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        minWidth: 'auto',
                        width: 24,
                        height: 24,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                      }}
                    >
                      <i className='ri-close-line' style={{ fontSize: '14px' }} />
                    </Button> */}
                </ImageListItem>
              )
            })}
          </ImageList>
        </Box>
      )}

      {/* 로딩 인디케이터 */}
      {isLoadingRef.current && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* 더 이상 데이터가 없을 때 메시지 */}
      {!hasNextRef.current && pictures.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
          <Typography variant='body2'>모든 이미지를 불러왔습니다.</Typography>
        </Box>
      )}
    </div>
  )
}

export default MachinePictures
