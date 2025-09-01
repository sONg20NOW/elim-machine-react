import { useEffect, useState, useCallback } from 'react'

import { Box, Button, Card, Grid, Typography, CircularProgress } from '@mui/material'
import axios from 'axios'

import { handleApiError } from '@/utils/errorHandler'

const MachinePictures = ({ id }: any) => {
  const [pictures, setPictures] = useState<any>({ content: [], hasNext: false, nextCursor: null })
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<any>(null)
  const pageSize = 20

  const fetchData = useCallback(
    async (cursor: any = null, isAppend: boolean = false) => {
      if (loading) return

      setLoading(true)

      try {
        // 커서 기반 요청 URL 생성
        let url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${id}/machine-pics?size=${pageSize}`

        // 커서가 있을 때만 커서 파라미터 추가
        if (cursor) {
          const cursorParams = new URLSearchParams({
            lastMachineCateSortOrder: cursor.lastMachineCateSortOrder.toString(),
            lastMachinePicCateSortOrder: cursor.lastMachinePicCateSortOrder.toString(),
            lastMachinePicSubCateSortOrder: cursor.lastMachinePicSubCateSortOrder.toString(),
            lastMachineInspectionId: cursor.lastMachineInspectionId.toString(),
            lastMachinePicId: cursor.lastMachinePicId.toString()
          })

          url += `&${cursorParams.toString()}`
        }

        const response = await axios.post(url, {
          machineInspectionId: null,
          machinePicCateId: null
        })

        const newData = response.data.data

        if (isAppend) {
          // 기존 데이터에 새 데이터 추가
          setPictures((prev: any) => ({
            ...newData,
            content: [...prev.content, ...newData.content]
          }))
        } else {
          // 첫 로드시 데이터 설정
          setPictures(newData)
        }

        // 다음 커서와 hasMore 상태 업데이트
        setNextCursor(newData.nextCursor)
        setHasMore(newData.hasNext)

        console.log('response', newData)
      } catch (error) {
        handleApiError(error, '이미지를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    },
    [id, loading, pageSize]
  )

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight

    // 스크롤이 하단에서 100px 이내에 도달했을 때 다음 페이지 로드
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loading && nextCursor) {
      fetchData(nextCursor, true)
    }
  }, [hasMore, loading, nextCursor, fetchData])

  useEffect(() => {
    fetchData(null, false)
  }, [id])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  console.log('pictures', pictures.content)

  const removeFile = (index: number) => {
    console.log(index)
  }

  return (
    <div style={{ marginTop: 16 }}>
      {pictures?.content?.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1}>
            {pictures.content.map((file: any, index: number) => {
              console.log('file', file)

              return (
                <Grid item xs={6} sm={4} md={3} key={`${file.machinePicId}-${index}`}>
                  <Card sx={{ position: 'relative' }}>
                    <img
                      src={file.presignedUrl}
                      alt={file.originalFileName}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover'
                      }}
                    />
                    <Box sx={{ p: 1 }}>
                      <Typography variant='caption' noWrap>
                        {file.originalFileName}
                      </Typography>
                      <Typography
                        variant='caption'
                        display='block'
                        sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                      >
                        {file.machineCateName} - {file.machinePicCateName}
                      </Typography>
                    </Box>
                    <Button
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
                    </Button>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}

      {/* 로딩 인디케이터 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* 더 이상 데이터가 없을 때 메시지 */}
      {!hasMore && pictures.content.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
          <Typography variant='body2'>모든 이미지를 불러왔습니다.</Typography>
        </Box>
      )}
    </div>
  )
}

export default MachinePictures
