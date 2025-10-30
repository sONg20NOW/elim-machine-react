import { useEffect, useState, useCallback, useRef } from 'react'

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
  MachinePicCursorType,
  MachinePicPresignedUrlResponseDtoType
} from '@/@core/types'

import SearchBar from '@/@core/components/custom/SearchBar'
import PictureZoomModal from '../PictureZoomModal'
import { useGetInspections } from '@/@core/hooks/customTanstackQueries'

const PictureListTabContent = () => {
  const machineProjectId = useParams().id?.toString() as string

  // 이름으로 검색 필터 (파일 이름, 카테고리 이름, 체크 아이템, 섭아이템 이름에 포함된 것만 필터링 하기.)
  const [keyword, setKeyword] = useState('')

  const [pictures, setPictures] = useState<MachinePicPresignedUrlResponseDtoType[]>([])
  const defaultPageSize = 4

  const [picturesToDelete, setPicturesToDelete] = useState<{ machinePicId: number; version: number }[]>([])
  const [showCheck, setShowCheck] = useState(false)

  // inspection으로 필터링하기 위한 옵션
  const { data: inspectionList } = useGetInspections(machineProjectId)
  const [inspectionId, setInspectionId] = useState(0)

  // ! 추후 세부 필터링 추가
  // const [machineChecklistItemId, setMachineChecklistItemId] = useState(0)
  // const [machineChecklistSubItemId, setMachineChecklistSubItemId] = useState(0)

  // 무한스크롤 관련 Ref들
  const isLoadingRef = useRef(false)
  const hasNextRef = useRef(true)
  const nextCursorRef = useRef<MachinePicCursorType | null>(undefined)

  // 반응형을 위한 미디어쿼리
  const isMobile = useMediaQuery('(max-width:600px)')

  // 사진 클릭 기능 구현을 위한 상태
  const [selectedPic, setSelectedPic] = useState<MachinePicPresignedUrlResponseDtoType>()
  const [showPicModal, setShowPicModal] = useState(false)

  const [selectedInspection, setSelectedInspection] = useState<MachineInspectionDetailResponseDtoType>()

  // 클릭된 사진이 속한 inspection 정보 가져오기. (사진 모달에 검사항목.하위항목을 위해 필요)
  const getInspectionByPic = useCallback(
    async (pic: MachinePicPresignedUrlResponseDtoType) => {
      try {
        const response = await axios.get<{ data: MachineInspectionDetailResponseDtoType }>(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${pic.machineInspectionId}`
        )

        setSelectedInspection(response.data.data)
      } catch (error) {
        handleApiError(error)
      }
    },
    [machineProjectId]
  )

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
      const picturesFilterdWithKeyword = pictures
        .filter(
          pic =>
            pic.machineCategoryName.includes(keyword) ||
            pic.originalFileName.includes(keyword) ||
            pic.machineChecklistItemName.includes(keyword) ||
            pic.machineChecklistSubItemName.includes(keyword)
        )
        .filter(v => (inspectionId === 0 ? true : v.machineInspectionId === inspectionId))

      return picturesFilterdWithKeyword
    },
    [keyword, inspectionId]
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
    inspectionList && (
      <div className='flex flex-col gap-5'>
        {/* 상단 필터링, 검색, 선택 삭제 등 */}
        <div className='flex justify-between'>
          <div className={classNames('flex gap-3', { 'flex-col': isMobile })}>
            <SearchBar placeholder='검색' setSearchKeyword={name => setKeyword(name)} />
            <TextField
              label='설비명으로 검색'
              sx={{ width: { sx: 'full', sm: 250 } }}
              select
              size='small'
              value={inspectionId}
              onChange={e => setInspectionId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem key={0} value={0}>
                전체
              </MenuItem>
              {inspectionList.map(v => (
                <MenuItem key={v.id} value={v.id}>
                  {v.name}
                </MenuItem>
              ))}
            </TextField>
            {/* ! 추후구현
           {
            inspectionId !== 0 && filterPics(pictures).length !== 0
            && (
              <TextField
                label='점검항목으로 검색'
                sx={{ width: { sx: 'full', sm: 250 } }}
                select
                size='small'
                value={machineChecklistItemId}
                onChange={e => setMachineChecklistItemId(Number(e.target.value))}
                fullWidth
              >
                <MenuItem key={0} value={0}>
                  전체
                </MenuItem>
                {[].map(v => (
                  <MenuItem key={v.mach} value={v.machineInspectionId}>
                    {v.machineInspectionName}
                  </MenuItem>
                ))}
              </TextField>
            )
          } */}
          </div>

          <div className={classNames('flex gap-1', { 'flex-col': isMobile })}>
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
        <div className='flex flex-col gap-8'>
          {inspectionList.map(insp => {
            const inspectionsPic = pictures.filter(pic => pic.machineInspectionId === insp.id)

            return (
              filterPics(inspectionsPic)?.length > 0 && (
                <Box key={insp.id} sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div className='flex gap-3 items-end'>
                    <Typography variant='h3'>{insp.name}</Typography>
                    {/* <Typography variant='h6' sx={{ marginBottom: 1 }}>{`[${insp.machineParentCateName}]`}</Typography> */}
                  </div>
                  <ImageList
                    sx={{ overflow: 'visible' }}
                    cols={isMobile ? 1 : 4}
                    rowHeight={isMobile ? 180 : 300}
                    gap={15}
                  >
                    {filterPics(inspectionsPic).map((pic, index: number) => {
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
                            // 일괄선택 활성화 시 클릭 동작
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
                            }

                            // 일괄선택 비활성화 시 클릭 동작
                            else {
                              getInspectionByPic(pic)
                              setSelectedPic(pic)
                              setShowPicModal(true)
                            }
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
                        </Paper>
                      )
                    })}
                  </ImageList>
                  {/* 더 이상 데이터가 없을 때 메시지 */}
                </Box>
              )
            )
          })}
          {filterPics(pictures).length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
              <Typography variant='body1'>사진 데이터가 존재하지 않습니다</Typography>
            </Box>
          )}
        </div>
        {}
        {/* 로딩 인디케이터 */}
        {isLoadingRef.current && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {selectedPic && selectedInspection && (
          <PictureZoomModal
            open={showPicModal}
            setOpen={setShowPicModal}
            selectedPic={selectedPic}
            reloadPics={() => {
              resetCursor()
              getPictures(defaultPageSize)
            }}
            machineProjectId={machineProjectId}
            selectedInspection={selectedInspection}
          />
        )}
      </div>
    )
  )
}

export default PictureListTabContent
