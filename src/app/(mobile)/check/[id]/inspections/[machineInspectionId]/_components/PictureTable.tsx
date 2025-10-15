import type { Ref, RefObject } from 'react'
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
  emptyMode,
  scrollableAreaRef
}: {
  machineChecklistItemId: number | null
  emptyMode: boolean
  scrollableAreaRef: RefObject<HTMLElement>
}) => {
  const { id: machineProjectId, machineInspectionId: inspectionId } = useParams()

  const [pictures, setPictures] = useState<MachinePicPresignedUrlResponseDtoType[]>([])

  const machineChecklistItemIdRef = useRef(machineChecklistItemId)

  useEffect(() => {
    machineChecklistItemIdRef.current = machineChecklistItemId
  }, [machineChecklistItemId])

  const defaultPageSize = 4

  const [isLoading, setIsLoading] = useState(false)
  const isLoadingRef = useRef(false)

  // 무한스크롤 관련 Ref들
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
      if (!hasNextRef.current || isLoadingRef.current) return

      isLoadingRef.current = true
      setIsLoading(true)

      try {
        console.log('id:', machineChecklistItemIdRef.current)

        const requestBody = {
          ...(nextCursorRef.current ? { cursor: nextCursorRef.current } : {}),
          machineInspectionId: Number(inspectionId),
          ...(machineChecklistItemIdRef.current ? { machineChecklistItemId: machineChecklistItemIdRef.current } : {})
        }

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

        isLoadingRef.current = false
        setIsLoading(false)

        return response.data.data
      } catch (err) {
        handleApiError(err)

        isLoadingRef.current = false
        setIsLoading(false)
      }
    },
    [machineProjectId, inspectionId]
  )

  const resetCursor = async () => {
    hasNextRef.current = true
    nextCursorRef.current = undefined
    setPictures([])
  }

  useEffect(() => {
    resetCursor()
  }, [machineChecklistItemId, emptyMode])

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (!scrollableAreaRef.current) return

    const scrollTop = scrollableAreaRef.current.scrollTop
    const scrollHeight = scrollableAreaRef.current.scrollHeight
    const clientHeight = scrollableAreaRef.current.clientHeight

    // 스크롤이 하단에서 100px 이내에 도달했을 때 다음 페이지 로드
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasNextRef.current && !isLoadingRef.current) {
      console.log('get pic by handleScroll')
      getPictures(defaultPageSize)
    }
  }, [getPictures, scrollableAreaRef])

  useEffect(() => {
    if (!scrollableAreaRef.current) return

    const checkAndLoad = () => {
      if (!scrollableAreaRef.current) return

      const scrollHeight = scrollableAreaRef.current.scrollHeight
      const clientHeight = scrollableAreaRef.current.clientHeight

      // 스크롤이 아예 없거나 화면보다 내용이 적을 때
      if (clientHeight == scrollHeight && hasNextRef.current) {
        console.log('get pic by checkAndLoad')
        getPictures(defaultPageSize)
      }
    }

    // 초기 렌더링 직후, 데이터 불러오고 난 직후에도 체크
    checkAndLoad()

    scrollableAreaRef.current.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll, getPictures, pictures, scrollableAreaRef])

  const ImageCard = ({ pic, index }: { pic: MachinePicPresignedUrlResponseDtoType; index: number }) => {
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
              height: '100%',
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
  }

  const EmptyImageCard = ({
    machineChecklistItemName,
    machineChecklistSubItemName
  }: {
    machineChecklistItemName: string
    machineChecklistSubItemName: string
  }) => {
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
        key={machineChecklistItemName}
        onClick={() => {}}
      >
        <ImageListItem
          sx={{
            background: '#373737ff',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            placeItems: 'center',
            display: 'grid'
          }}
        >
          <i className='tabler-camera w-20 h-20 text-white' />
        </ImageListItem>

        <div className='p-1'>
          <Typography
            fontSize={'medium'}
            fontWeight={600}
            color='primary.dark'
            textAlign={'center'}
          >{`${machineChecklistItemName}`}</Typography>
          <Typography
            fontSize={'medium'}
            color='black'
            textAlign={'center'}
          >{`${machineChecklistSubItemName}`}</Typography>
        </div>
      </Paper>
    )
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-col gap-8'>
        {emptyMode ? (
          <ImageList sx={{ overflow: 'visible' }} cols={isMobile ? 1 : 2} rowHeight={isMobile ? 180 : 240} gap={15}>
            {[
              { machineChecklistItemName: '1', machineChecklistSubItemName: '1' },
              { machineChecklistItemName: '2', machineChecklistSubItemName: '2' }
            ].map((v, idx) => (
              <EmptyImageCard
                key={idx}
                machineChecklistItemName={v.machineChecklistItemName}
                machineChecklistSubItemName={v.machineChecklistSubItemName}
              />
            ))}
          </ImageList>
        ) : pictures?.length > 0 ? (
          <>
            <ImageList sx={{ overflow: 'visible' }} cols={isMobile ? 1 : 2} rowHeight={isMobile ? 180 : 240} gap={15}>
              {pictures.map((pic, index) => (
                <ImageCard key={index} pic={pic} index={index} />
              ))}
            </ImageList>
            {!nextCursorRef.current && (
              <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
                <Typography variant='body1'>모든 사진을 불러왔습니다</Typography>
              </Box>
            )}
          </>
        ) : (
          !isLoadingRef.current && (
            <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
              <Typography variant='body1'>사진 데이터가 존재하지 않습니다</Typography>
            </Box>
          )
        )}
        {isLoadingRef.current && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={50} sx={{ mb: 5 }} />
          </Box>
        )}
      </div>
    </div>
  )
}

export default PictureTable
