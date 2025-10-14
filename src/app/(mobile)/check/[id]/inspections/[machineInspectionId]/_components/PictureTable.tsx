import { useEffect, useState, useCallback, useRef, useContext } from 'react'

import { useParams } from 'next/navigation'

import {
  Box,
  Typography,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  useMediaQuery,
  Button,
  Checkbox,
  TextField,
  MenuItem,
  Paper
} from '@mui/material'

// @ts-ignore
import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'

import classNames from 'classnames'

import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import type {
  MachineInspectionDetailResponseDtoType,
  MachineInspectionPageResponseDtoType,
  MachinePicCursorType,
  MachinePicPresignedUrlResponseDtoType,
  successResponseDtoType
} from '@/app/_type/types'

import SearchBar from '@/app/_components/SearchBar'
import PictureZoomModal from '../../../_components/PictureZoomModal'
import { isMobileContext } from '@/app/_components/ProtectedPage'

const PictureTable = ({
  machineChecklistItemId,
  checkNoPic
}: {
  machineChecklistItemId?: number
  checkNoPic: boolean
}) => {
  const { id: machineProjectId, machineInspectionId: inspectionId } = useParams()

  const [pictures, setPictures] = useState<MachinePicPresignedUrlResponseDtoType[]>([])

  const filteredPictures = pictures.filter(
    pic => pic.machineChecklistItemId === (machineChecklistItemId ?? pic.machineChecklistItemId)
  )

  const defaultPageSize = 4

  // 무한스크롤 관련 Ref들
  const [isLoading, setIsLoading] = useState(false)
  const hasNextRef = useRef(true)
  const nextCursorRef = useRef<MachinePicCursorType | null>(undefined)

  // 모바일 반응형을 위한 미디어쿼리
  const isMobile = useContext(isMobileContext)

  // 사진 클릭 기능 구현을 위한 상태
  const [selectedPic, setSelectedPic] = useState<MachinePicPresignedUrlResponseDtoType>()
  const [showPicModal, setShowPicModal] = useState(false)

  // 현재 커서 정보에 기반해서 사진을 가져오는 함수.
  const getPictures = useCallback(
    async (pageSize: number) => {
      if (!hasNextRef.current || isLoading) return

      setIsLoading(true)

      const requestBody = {
        ...(nextCursorRef.current ? { cursor: nextCursorRef.current } : {}),
        machineInspectionId: Number(inspectionId)
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

        return response.data.data
      } catch (err) {
        handleApiError(err)
      } finally {
        setTimeout(() => {
          setIsLoading(false)
        }, 5000)
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [machineProjectId, inspectionId]
  )

  const resetCursor = () => {
    hasNextRef.current = true
    nextCursorRef.current = undefined
    setPictures([])
  }

  useEffect(() => {
    getPictures(defaultPageSize)
  }, [getPictures])

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight

    // 스크롤이 하단에서 100px 이내에 도달했을 때 다음 페이지 로드
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasNextRef.current && !isLoading) {
      getPictures(defaultPageSize)
    }
  }, [getPictures, isLoading])

  useEffect(() => {
    const checkAndLoad = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      // 스크롤이 아예 없거나 화면보다 내용이 적을 때
      if (scrollHeight <= clientHeight && hasNextRef.current) {
        getPictures(defaultPageSize)
      }
    }

    // 초기 렌더링 직후, 데이터 불러오고 난 직후에도 체크
    checkAndLoad()

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll, getPictures, pictures])

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-col gap-8'>
        {isLoading ? (
          !checkNoPic && filteredPictures?.length > 0 ? (
            <ImageList sx={{ overflow: 'visible' }} cols={isMobile ? 1 : 2} rowHeight={isMobile ? 180 : 300} gap={15}>
              {filteredPictures.map((pic, index: number) => {
                return (
                  <Paper
                    sx={{
                      position: 'relative',
                      cursor: 'pointer',
                      borderColor: 'lightgray',
                      borderWidth: '1px',
                      ':hover': { boxShadow: 10 }
                    }}
                    variant='outlined'
                    key={`${pic.machinePicId}-${index}`}
                    onClick={() => {
                      setSelectedPic(pic)
                      setShowPicModal(true)
                    }}
                  >
                    <ImageListItem>
                      <img
                        src={pic.presignedUrl}
                        alt={pic.originalFileName}
                        style={{
                          width: '100%',
                          height: '50%',
                          objectFit: 'cover',
                          borderTopLeftRadius: 5,
                          borderTopRightRadius: 5
                        }}
                      />
                      <ImageListItemBar sx={{ textAlign: 'center' }} title={pic.originalFileName} />
                    </ImageListItem>

                    <div className='p-1'>
                      <Typography
                        fontSize={'medium'}
                        fontWeight={600}
                        color='primary.dark'
                        textAlign={'center'}
                      >{`${pic.machineChecklistItemName}`}</Typography>
                      <Typography
                        fontSize={'medium'}
                        color='black'
                        textAlign={'center'}
                      >{`${pic.machineChecklistSubItemName}`}</Typography>
                    </div>
                  </Paper>
                )
              })}
            </ImageList>
          ) : (
            <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
              <Typography variant='body1'>사진 데이터가 존재하지 않습니다</Typography>
            </Box>
          )
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </div>
    </div>
  )
}

export default PictureTable
