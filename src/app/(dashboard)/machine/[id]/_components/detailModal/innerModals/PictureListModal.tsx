'use client'

// React Imports
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  Box,
  Typography,
  TextField,
  MenuItem,
  Divider,
  IconButton,
  Checkbox,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  useMediaQuery
} from '@mui/material'

// @ts-ignore
import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'

import { toast } from 'react-toastify'

import type {
  MachinePicCateWithPicCountDtoType,
  MachinePicPresignedUrlResponseDtoType,
  MachinePicCursorType
} from '@/app/_type/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import PictureZoomModal from '../../PictureZoomModal'
import { useSelectedInspectionContext } from '../../InspectionListContent'

type PictureListModalProps = {
  machineProjectId: string
  open: boolean
  setOpen: (open: boolean) => void
  clickedPicCate: MachinePicCateWithPicCountDtoType
}

const PictureListModal = ({ machineProjectId, open, setOpen, clickedPicCate }: PictureListModalProps) => {
  const { selectedInspection, refetchSelectedInspection } = useSelectedInspectionContext()

  // 사진 리스트
  const [pictures, setPictures] = useState<MachinePicPresignedUrlResponseDtoType[]>([])
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const [selectedSubItemId, setSelectedSubItemId] = useState<number>()

  const selectedSubItem = clickedPicCate.checklistSubItems.find(
    sub => sub.machineChecklistSubItemId === selectedSubItemId
  )

  const [picturesToDelete, setPicturesToDelete] = useState<{ machinePicId: number; version: number }[]>([])
  const [showCheck, setShowCheck] = useState(false)

  // 무한스크롤 관련 Ref들
  const isLoadingRef = useRef(false)
  const hasNextRef = useRef(true)
  const nextCursorRef = useRef<MachinePicCursorType | null>(undefined)

  // 사진 클릭 기능 구현을 위한 상태
  const [selectedPic, setSelectedPic] = useState<MachinePicPresignedUrlResponseDtoType>()
  const [showPicModal, setShowPicModal] = useState(false)

  // 반응형을 위한 미디어쿼리
  const isMobile = useMediaQuery('(max-width:600px)')

  const resetCursor = () => {
    hasNextRef.current = true
    nextCursorRef.current = undefined
    setPictures([])
  }

  // 현재 커서 정보에 기반해서 사진을 가져오는 함수.
  const getPictures = useCallback(
    async (pageSize = 10) => {
      if (!hasNextRef.current || isLoadingRef.current) return

      isLoadingRef.current = true

      const requestBody = {
        machineInspectionId: selectedInspection.machineInspectionResponseDto.id,
        machineChecklistItemId: clickedPicCate.machineChecklistItemId,
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
    [clickedPicCate, machineProjectId, selectedInspection]
  )

  useEffect(() => {
    // 정보에 있는 사진 개수(selectedSubItem)보다 실제로 있는 사진 개수(pictures)가 적다면 getPictures.
    if (
      !isUploading &&
      selectedSubItem &&
      selectedSubItem.machinePicCount !==
        pictures.filter(pic => pic.machineChecklistSubItemId === selectedSubItem.machineChecklistSubItemId).length
    ) {
      getPictures()
    }
  }, [
    isUploading,
    selectedSubItem,
    pictures,
    selectedInspection.machineInspectionResponseDto.id,
    clickedPicCate.machineChecklistItemId,
    machineProjectId,
    getPictures
  ])

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => setShowCheck(false), [selectedSubItem])

  // useEffect(() => setSelectedPic(prev => pictures.find(pic => prev?.machinePicId === pic.machinePicId)), [pictures])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files) {
      const newFiles = Array.from(files)

      setFilesToUpload(prev => [...prev, ...newFiles])
    }
  }

  const handleFileUpload = async () => {
    if (filesToUpload.length === 0) {
      toast.error('업로드할 파일을 선택하세요.')

      return
    } else if (!selectedSubItem) {
      toast.error('하위항목을 선택하세요.')

      return
    }

    setIsUploading(true)

    try {
      // 1. 프리사인드 URL 요청 (백엔드 서버로 POST해서 받아옴.)
      const presignedResponse = await axios.post<{
        data: { presignedUrlResponseDtos: { objectKey: string; presignedUrl: string }[] }
      }>(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/presigned-urls/upload`, {
        uploadType: 'INSPECTION_IMAGE',
        originalFileNames: filesToUpload.map(file => file.name),
        projectId: parseInt(machineProjectId),
        machineInspectionId: selectedInspection.machineInspectionResponseDto.id,
        cateName: selectedInspection.machineInspectionResponseDto.machineCategoryName ?? '배관설비',
        picCateName: clickedPicCate.machineChecklistItemName ?? '설비사진',
        picSubCateName: selectedSubItem?.checklistSubItemName ?? '현황사진',

        // ! 현재 유저의 ID => 로그인 기능 구현 후 추가
        memberId: 1
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
          s3Key: presignedData.objectKey,
          uploadSuccess: true
        }
      })

      // 모든 파일 업로드 완료까지 대기
      const uploadResults = await Promise.all(uploadPromises)

      console.log('업로드 완료:', uploadResults)

      // 3. DB에 사진 정보 기록 (백엔드 서버로 POST)
      const machinePicCreateRequestDtos = uploadResults.map(result => ({
        machineChecklistSubItemId: selectedSubItem?.machineChecklistSubItemId || 1, // 기본값 또는 selectedMachine에서 가져오기
        originalFileName: result.fileName,
        s3Key: result.s3Key

        // cdnPath는 추후 확장사항
      }))

      const dbResponse = await axios.post<{ data: { machinePicIds: number[] } }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedInspection.machineInspectionResponseDto.id}/machine-pics`,
        {
          machinePicCreateRequestDtos
        }
      )

      const uploadedPicIds = dbResponse.data.data.machinePicIds

      console.log('DB 기록 완료:', uploadedPicIds)
      handleSuccess(`${uploadedPicIds.length}개 사진이 성공적으로 업로드되었습니다.`)

      setFilesToUpload([])

      // 디테일 모달 테이블의 해당 목록 정보 최신화 - selcetedMachine 최신화
      refetchSelectedInspection()

      // 커서 리셋
      resetCursor()
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeletePics = useCallback(async () => {
    if (!selectedSubItem) return

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-pics`,
        { data: { machinePicDeleteRequestDtos: picturesToDelete } } as AxiosRequestConfig
      )

      // 성공했다면 업로드 때와 마찬가지로 selectedMachine 최신화.
      refetchSelectedInspection()

      // 커서 리셋
      resetCursor()

      // 삭제 예정 리스트 리셋
      setPicturesToDelete([])

      handleSuccess('선택된 사진들이 일괄삭제되었습니다.')
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId, picturesToDelete, selectedSubItem, refetchSelectedInspection])

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='lg' fullWidth disableEnforceFocus disableAutoFocus>
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className='ps-1 flex flex-col gap-0'>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 20, sm: 30 } }}>사진 목록</Typography>
          <Typography sx={{ fontWeight: 600, fontSize: { xs: 14, sm: 18 } }} variant='h6'>
            {clickedPicCate.machineChecklistItemName}
          </Typography>
        </div>
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1, fontSize: { xs: 14, sm: 18 } }} variant='h6'>
              하위항목 선택
            </Typography>
            <TextField
              inputProps={{ sx: { display: 'flex', alignItems: 'center', gap: 1 } }}
              size='small'
              fullWidth
              select
              value={selectedSubItemId ?? 0}
              onChange={e => setSelectedSubItemId(Number(e.target.value))}
            >
              <MenuItem value={0} disabled>
                -- 하위항목을 선택하세요 --
              </MenuItem>
              {clickedPicCate?.checklistSubItems?.map(sub => (
                <MenuItem key={sub.machineChecklistSubItemId} value={sub.machineChecklistSubItemId}>
                  <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sub.checklistSubItemName}
                  </Typography>
                  <Typography color='primary.main' sx={{ overflowWrap: 'break-word' }}>
                    {sub.machinePicCount ? `(${sub.machinePicCount})` : ''}
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
          </Card>
        </Grid>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={3}>
          {/* 기존 사진 목록 */}
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <div className='flex justify-between'>
                <Typography sx={{ fontWeight: 600, mb: 5, fontSize: { xs: 14, sm: 18 } }} variant='h6' gutterBottom>
                  검사 사진 목록
                </Typography>
                <div className='flex gap-1 top-2 right-1'>
                  {showCheck && [
                    <Button
                      key={1}
                      size='small'
                      color='warning'
                      onClick={async () => {
                        setPicturesToDelete(
                          pictures
                            .concat(await getPictures(1000).then(v => v?.content ?? []))
                            .filter(pic => pic.machineChecklistSubItemId === selectedSubItem?.machineChecklistSubItemId)
                        )
                      }}
                    >
                      전체선택
                    </Button>,
                    <Button key={2} size='small' color='error' onClick={() => handleDeletePics()}>
                      일괄삭제({picturesToDelete.length})
                    </Button>
                  ]}
                  <Button
                    color={showCheck ? 'secondary' : 'primary'}
                    size='small'
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

              {pictures.filter(pic => pic.machineChecklistSubItemId === selectedSubItem?.machineChecklistSubItemId) &&
              pictures.filter(pic => pic.machineChecklistSubItemId === selectedSubItem?.machineChecklistSubItemId)
                .length > 0 ? (
                <ImageList cols={isMobile ? 1 : 4} gap={15} rowHeight={isMobile ? 150 : 250}>
                  {pictures
                    .filter(pic => pic.machineChecklistSubItemId === selectedSubItem?.machineChecklistSubItemId)
                    .map((pic, idx) => (
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
                        key={`${pic.machinePicId}-${idx}`}
                        sx={{ position: 'relative', cursor: 'pointer' }}
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
                          subtitle={
                            <div className='flex flex-col'>
                              <Typography
                                color='lightgray'
                                fontSize={'small'}
                              >{`${pic.machineChecklistItemName} - ${pic.machineChecklistSubItemName}`}</Typography>
                            </div>
                          }
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
                    ))}
                </ImageList>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    border: '2px dashed #e0e0e0',
                    borderRadius: 1,
                    color: 'text.secondary'
                  }}
                >
                  <i className='ri-image-line' style={{ fontSize: '48px', marginBottom: '8px' }} />
                  <Typography>등록된 검사 사진이 없습니다.</Typography>
                </Box>
              )}
            </Card>
          </Grid>
          {/* 사진 업로드 영역 */}
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <input
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id='photo-upload-input'
                />
                <label htmlFor='photo-upload-input'>
                  <Button variant='outlined' component='span' startIcon={<i className='ri-upload-2-line' />}>
                    파일 선택
                  </Button>
                </label>

                <Button
                  variant='contained'
                  onClick={handleFileUpload}
                  disabled={filesToUpload.length === 0 || isUploading}
                  startIcon={<i className='ri-image-add-line' />}
                >
                  {isUploading ? '업로드 중...' : '사진 업로드'}
                </Button>

                <Typography variant='body2' color='text.secondary'>
                  {filesToUpload.length}개 파일 선택됨
                </Typography>
              </Box>

              {/* 선택된 파일 미리보기 */}
              {filesToUpload.length > 0 && (
                <Box
                  sx={{
                    border: 'solid 1px',
                    borderColor: '#dbdbdbff',
                    borderRadius: 1,
                    mb: 2,
                    padding: 2,
                    grid: 'initial'
                  }}
                >
                  <Typography variant='subtitle1' gutterBottom>
                    미리보기
                  </Typography>
                  <Grid container spacing={1}>
                    {filesToUpload.map((file, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Card sx={{ position: 'relative' }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover'
                            }}
                          />
                          <Box sx={{ p: 1 }}>
                            <Typography variant='caption' noWrap>
                              {file.name}
                            </Typography>
                          </Box>
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0
                            }}
                            onClick={() => removeFile(index)}
                          >
                            <i className='tabler-x text-xl text-error' />
                          </IconButton>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant='outlined'>
          닫기
        </Button>
      </DialogActions>
      {selectedPic && (
        <PictureZoomModal
          open={showPicModal}
          setOpen={setShowPicModal}
          selectedPic={selectedPic}
          reloadPics={() => {
            resetCursor()
            getPictures()
          }}
          machineProjectId={machineProjectId}
          selectedInspection={selectedInspection}
          refetchSelectedInspection={refetchSelectedInspection}
        />
      )}
    </Dialog>
  )
}

export default PictureListModal
