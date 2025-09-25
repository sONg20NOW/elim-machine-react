import { useEffect, useState, useCallback, useRef } from 'react'

import {
  Box,
  Typography,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  useMediaQuery,
  Button,
  Checkbox
} from '@mui/material'

// @ts-ignore
import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'

import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import type { MachinePicCursorType, MachinePicPresignedUrlResponseDtoType } from '@/app/_type/types'
import SearchBar from '@/app/_components/SearchBar'
import PictureZoomModal from './PictureZoomModal'

const MachinePictures = ({ machineProjectId }: { machineProjectId: string }) => {
  // 이름으로 검색 필터 (파일 이름, 카테고리 이름, 체크 아이템, 섭아이템 이름에 포함된 것만 필터링 하기.)
  const [keyword, setKeyword] = useState('')

  const [pictures, setPictures] = useState<MachinePicPresignedUrlResponseDtoType[]>([])
  const defaultPageSize = 4

  const [picturesToDelete, setPicturesToDelete] = useState<{ machinePicId: number; version: number }[]>([])
  const [showCheck, setShowCheck] = useState(false)

  // 무한스크롤 관련 Ref들
  const isLoadingRef = useRef(false)
  const hasNextRef = useRef(true)
  const nextCursorRef = useRef<MachinePicCursorType | null>(undefined)

  // 반응형을 위한 미디어쿼리
  const isMobile = useMediaQuery('(max-width:600px)')

  // 사진 클릭 기능 구현을 위한 상태
  const [selectedPic, setSelectedPic] = useState<MachinePicPresignedUrlResponseDtoType>()
  const [showPicModal, setShowPicModal] = useState(false)

  // 현재 커서 정보에 기반해서 사진을 가져오는 함수.
  const getPictures = useCallback(
    async (pageSize: number) => {
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

        return response.data.data
      } catch (err) {
        handleApiError(err)
      } finally {
        isLoadingRef.current = false
      }
    },
    [machineProjectId]
  )

  const filterPics = useCallback(
    (pictures: MachinePicPresignedUrlResponseDtoType[]) => {
      const picturesFilterdWithKeyword = pictures.filter(
        pic =>
          pic.machineCategoryName.includes(keyword) ||
          pic.originalFileName.includes(keyword) ||
          pic.machineChecklistItemName.includes(keyword) ||
          pic.machineChecklistSubItemName.includes(keyword)
      )

      return picturesFilterdWithKeyword
    },
    [keyword]
  )

  const resetCursor = () => {
    hasNextRef.current = true
    nextCursorRef.current = undefined
    setPictures([])
  }

  const handleDeletePics = useCallback(async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-pics`,
        { data: { machinePicDeleteRequestDtos: picturesToDelete } } as AxiosRequestConfig
      )

      // 성공했다면 pictures 최신화.
      resetCursor()

      // 삭제 예정 리스트 리셋
      setPicturesToDelete([])

      handleSuccess('선택된 사진들이 일괄삭제되었습니다.')
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId, picturesToDelete])

  useEffect(() => {
    getPictures(defaultPageSize)
  }, [getPictures])

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight

    // 스크롤이 하단에서 100px 이내에 도달했을 때 다음 페이지 로드
    if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoadingRef.current && hasNextRef.current) {
      getPictures(defaultPageSize)
    }
  }, [getPictures])

  useEffect(() => {
    const checkAndLoad = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      // 스크롤이 아예 없거나 화면보다 내용이 적을 때
      if (scrollHeight <= clientHeight && hasNextRef.current && !isLoadingRef.current) {
        getPictures(defaultPageSize)
      }
    }

    // 초기 렌더링 직후, 데이터 불러오고 난 직후에도 체크
    checkAndLoad()

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll, getPictures, pictures])

  // 검색 시 자동으로 fetch 시도.
  useEffect(() => {
    if (hasNextRef.current && !isLoadingRef.current) {
      getPictures(defaultPageSize)
    }
  }, [filterPics, getPictures])

  return (
    <div className='flex flex-col gap-5'>
      {/* 상단 필터링, 검색, 선택 삭제 등 */}
      <div className='flex justify-between'>
        <SearchBar placeholder='검색' setSearchKeyword={name => setKeyword(name)} />
        <div className='flex gap-1'>
          {showCheck && [
            <Button
              key={1}
              color='warning'
              onClick={async () => {
                setPicturesToDelete(filterPics(pictures.concat(await getPictures(1000).then(v => v?.content ?? []))))
              }}
            >
              전체선택
            </Button>,
            <Button key={2} color='error' onClick={() => handleDeletePics()}>
              일괄삭제({picturesToDelete.length})
            </Button>
          ]}
          <Button
            color={showCheck ? 'secondary' : 'primary'}
            variant='contained'
            onClick={() => {
              if (showCheck) {
                setPicturesToDelete([])
              }

              setShowCheck(prev => !prev)
            }}
          >
            {showCheck ? '취소' : '선택삭제'}
          </Button>
        </div>
      </div>
      {filterPics(pictures)?.length > 0 ? (
        <Box sx={{ mb: 2 }}>
          {/* ! 더 예쁘게 */}
          <ImageList cols={isMobile ? 1 : 4} rowHeight={isMobile ? 180 : 300} gap={15}>
            {filterPics(pictures).map((pic, index: number) => {
              return (
                <ImageListItem
                  onClick={() => {
                    if (showCheck) {
                      if (!picturesToDelete.find(v => v.machinePicId === pic.machinePicId)) {
                        setPicturesToDelete(prev => {
                          const newList = prev.map(v => ({ ...v }))

                          return newList.concat({ machinePicId: pic.machinePicId, version: pic.version })
                        })
                      } else {
                        setPicturesToDelete(prev => {
                          const newList = prev.map(v => ({ ...v }))

                          return newList.filter(v => v.machinePicId !== pic.machinePicId)
                        })
                      }
                    } else {
                      setSelectedPic(pic)
                      setShowPicModal(true)
                    }
                  }}
                  key={`${pic.machinePicId}-${index}`}
                  sx={{ cursor: 'pointer', position: 'relative' }}
                >
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
                    subtitle={`[${pic.machineCategoryName}] ${pic.machineChecklistItemName} - ${pic.machineChecklistSubItemName}`}
                  />
                  {showCheck && (
                    <Checkbox
                      color='error'
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0
                      }}
                      checked={picturesToDelete.find(v => v.machinePicId === pic.machinePicId) ? true : false}
                    />
                  )}
                </ImageListItem>
              )
            })}
          </ImageList>{' '}
          {/* 더 이상 데이터가 없을 때 메시지 */}
          {!hasNextRef.current && (
            <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
              <Typography variant='body1'>모든 이미지를 불러왔습니다.</Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
          <Typography variant='body1'>사진 데이터가 존재하지 않습니다..</Typography>
        </Box>
      )}

      {/* 로딩 인디케이터 */}
      {isLoadingRef.current && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {selectedPic && <PictureZoomModal open={showPicModal} setOpen={setShowPicModal} selectedPic={selectedPic} />}
    </div>
  )
}

export default MachinePictures
