'use client'

// React Imports
import { useCallback, useEffect, useRef, useState } from 'react'

import { useParams } from 'next/navigation'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
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
  useMediaQuery,
  Paper
} from '@mui/material'

// @ts-ignore
import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'

import { toast } from 'react-toastify'

import type {
  machineChecklistItemsWithPicCountResponseDtosType,
  MachinePicPresignedUrlResponseDtoType,
  MachinePicCursorType
} from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import PictureZoomModal from '../PictureZoomModal'
import { uploadInspectionPictures } from '@/@core/utils/uploadInspectionPictures'
import useCurrentInspectionIdStore from '@/@core/utils/useCurrentInspectionIdStore'
import { useGetInspectionsSimple, useGetSingleInspection } from '@/@core/hooks/customTanstackQueries'

type PictureListModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  clickedPicCate?: machineChecklistItemsWithPicCountResponseDtosType
}

const PictureListModal = ({ open, setOpen, clickedPicCate }: PictureListModalProps) => {
  const machineProjectId = useParams().id?.toString() as string
  const { currentInspectionId, setCurrentInspectionId } = useCurrentInspectionIdStore(set => set)

  const { data: selectedInspection, refetch: refetchSelectedInspection } = useGetSingleInspection(
    machineProjectId,
    currentInspectionId.toString()
  )

  const { data: inspections } = useGetInspectionsSimple(machineProjectId)

  // 사진 리스트
  const [pictures, setPictures] = useState<MachinePicPresignedUrlResponseDtoType[]>([])
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const [selectedSubItemId, setSelectedSubItemId] = useState<number>(0)
  const [selectedItemId, setSelectedItemId] = useState<number>(clickedPicCate?.machineChecklistItemId ?? 0)

  const checklistItems = selectedInspection?.machineChecklistItemsWithPicCountResponseDtos ?? []

  const totalPicCount =
    selectedInspection?.machineChecklistItemsWithPicCountResponseDtos.reduce(
      (sum, value) => sum + value.totalMachinePicCount,
      0
    ) ?? 0

  const selectedItem = checklistItems.find(v => v.machineChecklistItemId === selectedItemId)

  const selectedSubItem = selectedItem?.checklistSubItems.find(
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

  const filteredPics = pictures.filter(
    pic =>
      (selectedItemId === 0 || pic.machineChecklistItemId === selectedItemId) &&
      (selectedSubItemId === 0 || pic.machineChecklistSubItemId === selectedSubItem?.machineChecklistSubItemId)
  )

  // 반응형을 위한 미디어쿼리
  const isMobile = useMediaQuery('(max-width:600px)')

  const resetCursor = () => {
    hasNextRef.current = true
    nextCursorRef.current = undefined
    setPictures([])
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files) {
      const newFiles = Array.from(files)

      setFilesToUpload(prev => [...prev, ...newFiles])
    }
  }

  const handleFileUpload = async () => {
    if (!selectedInspection) return

    if (filesToUpload.length === 0) {
      toast.error('업로드할 파일을 선택하세요.')

      return
    } else if (!selectedSubItem) {
      toast.error('하위항목을 선택하세요.')

      return
    }

    setIsUploading(true)

    if (!selectedItem || !selectedSubItem) {
      toast.error('카테고리를 먼저 설정해주세요.')

      return
    }

    const result = await uploadInspectionPictures(
      machineProjectId,
      selectedInspection.machineInspectionResponseDto.id.toString(),
      filesToUpload,
      selectedItem.machineChecklistItemId,
      selectedSubItem.machineChecklistSubItemId
    )

    if (result) {
      setFilesToUpload([])

      // 디테일 모달 테이블의 해당 목록 정보 최신화 - selcetedMachine 최신화
      refetchSelectedInspection()

      // 커서 리셋
      resetCursor()
    }

    setIsUploading(false)
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

  async function MovePicture(dir: 'next' | 'previous') {
    const currentPictureIdx = pictures.findIndex(v => v.machinePicId === selectedPic?.machinePicId)

    if (currentPictureIdx === -1) {
      throw new Error('현재 사진을 찾을 수 없음. 관리자에게 문의하세요.')
    }

    switch (dir) {
      case 'next':
        if (currentPictureIdx + 1 < pictures.length) {
          setSelectedPic(pictures[currentPictureIdx + 1])

          return
        }

        if (hasNextRef.current) {
          const nextResponse = await getPictures()

          // if (currentPictureIdx + 1 >= pictures.length) {
          //   throw new Error('hasNext가 true지만 다음 페이지 없음')
          // }

          setSelectedPic(nextResponse?.content[0])
        } else {
          toast.warning('다음 사진이 없습니다')
        }

        break
      case 'previous':
        if (currentPictureIdx === 0) {
          toast.warning('첫번째 사진입니다')
        } else {
          setSelectedPic(pictures[currentPictureIdx - 1])
        }

        break

      default:
        break
    }
  }

  // 현재 커서 정보에 기반해서 사진을 가져오는 함수.
  const getPictures = useCallback(
    async (pageSize = 10) => {
      if (!hasNextRef.current || isLoadingRef.current) return

      isLoadingRef.current = true

      const requestBody = {
        machineInspectionId: selectedInspection?.machineInspectionResponseDto.id,
        machineChecklistItemId: selectedItemId !== 0 ? selectedItemId : null,
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
    [selectedItemId, machineProjectId, selectedInspection]
  )

  // 최초에 전체 사진 가져오기
  useEffect(() => {
    getPictures()
  }, [getPictures])

  useEffect(() => {
    // 정보에 있는 사진 개수(selectedSubItem)보다 실제로 있는 사진 개수(pictures)가 적다면 getPictures.
    if (
      !isUploading &&
      (selectedSubItem
        ? selectedSubItem.machinePicCount !==
          pictures.filter(pic => pic.machineChecklistSubItemId === selectedSubItem.machineChecklistSubItemId).length
        : selectedItem?.totalMachinePicCount !== pictures.length)
    ) {
      getPictures()
    }
  }, [
    isUploading,
    selectedSubItem,
    selectedItem,
    pictures,
    selectedInspection?.machineInspectionResponseDto.id,
    machineProjectId,
    getPictures
  ])

  useEffect(() => setShowCheck(false), [selectedSubItem])

  // 설비 변경 시
  useEffect(() => {
    setSelectedItemId(0)
    resetCursor()
  }, [currentInspectionId])

  // useEffect(() => setSelectedPic(prev => pictures.find(pic => prev?.machinePicId === pic.machinePicId)), [pictures])

  // 사진 카드 컴포넌트
  function PictureCard({ pic }: { pic: MachinePicPresignedUrlResponseDtoType }) {
    return (
      <Paper
        key={pic.machinePicId}
        elevation={3}
        sx={{
          p: 1,
          position: 'relative',
          cursor: 'pointer',
          border: '1px solid lightgray',
          m: 1,
          ':hover': { boxShadow: 4 }
        }}
      >
        <ImageListItem
          onClick={() => {
            if (showCheck) {
              if (!picturesToDelete.find(v => v.machinePicId === pic.machinePicId)) {
                setPicturesToDelete(prev => [...prev, { machinePicId: pic.machinePicId, version: pic.version }])
              } else {
                setPicturesToDelete(prev => prev.filter(v => v.machinePicId !== pic.machinePicId))
              }
            } else {
              setSelectedPic(pic)
              setShowPicModal(true)
            }
          }}
        >
          <img
            src={pic.presignedUrl}
            alt={pic.originalFileName}
            style={{ width: '100%', height: '50%', objectFit: 'cover' }}
          />
          <ImageListItemBar title={pic.originalFileName} sx={{ textAlign: 'center' }} />
        </ImageListItem>
        {showCheck && (
          <Checkbox
            color='error'
            sx={{ position: 'absolute', left: 0, top: 0 }}
            checked={picturesToDelete.some(v => v.machinePicId === pic.machinePicId)}
          />
        )}
      </Paper>
    )
  }

  // 미리보기 사진 카드 컴포넌트
  function PicturePreviewCard({ file, index }: { file: File; index: number }) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 1,
          position: 'relative',
          border: '1px solid lightgray',
          m: 1,
          ':hover': { boxShadow: 4 }
        }}
      >
        <ImageListItem>
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            style={{ width: '100%', height: '50%', objectFit: 'cover' }}
          />
          <ImageListItemBar title={file.name} sx={{ textAlign: 'center' }} />
        </ImageListItem>
        <IconButton sx={{ position: 'absolute', right: 0, top: 0 }} onClick={() => removeFile(index)}>
          <i className='tabler-x text-xl text-error' />
        </IconButton>
      </Paper>
    )
  }

  // useEffect(() => {
  //   if (!showPicModal) {
  //     resetCursor()
  //     getPictures()
  //   }
  // }, [showPicModal, getPictures])

  return (
    selectedInspection && (
      <Dialog open={open} onClose={handleClose} maxWidth='xl' fullWidth disableEnforceFocus disableAutoFocus>
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
          <IconButton sx={{ position: 'absolute', top: 0, right: 0 }} onClick={() => setOpen(false)}>
            <i className='tabler-x' />
          </IconButton>

          <TextField
            size='small'
            select
            value={currentInspectionId}
            onChange={e => setCurrentInspectionId(Number(e.target.value))}
            sx={{ width: 'fit-content' }}
            slotProps={{
              select: {
                sx: { fontWeight: 700, fontSize: { xs: 20, sm: 30 }, paddingInlineEnd: 5 }
              }
            }}
          >
            {inspections?.map(inspection => (
              <MenuItem key={inspection.id} value={inspection.id}>
                {inspection.name}
              </MenuItem>
            ))}
          </TextField>
          <Grid item xs={12}>
            <Typography sx={{ fontWeight: 600, mb: 1, px: 1, fontSize: { xs: 14, sm: 18 } }} variant='h6'>
              점검항목 선택
            </Typography>
            <TextField
              slotProps={{ htmlInput: { sx: { display: 'flex', alignItems: 'center', gap: 1 } } }}
              size='small'
              fullWidth
              select
              value={selectedItem?.machineChecklistItemId ?? 0}
              onChange={e => {
                resetCursor()
                setSelectedSubItemId(0)
                setSelectedItemId(Number(e.target.value))
              }}
            >
              <MenuItem value={0}>
                <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  전체
                </Typography>
                <Typography color='primary.main' sx={{ overflowWrap: 'break-word' }}>
                  {totalPicCount ? `(${totalPicCount})` : ''}
                </Typography>
              </MenuItem>
              {checklistItems.map(item => (
                <MenuItem key={item.machineChecklistItemId} value={item.machineChecklistItemId}>
                  <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.machineChecklistItemName}
                  </Typography>
                  <Typography color='primary.main' sx={{ overflowWrap: 'break-word' }}>
                    {item.totalMachinePicCount ? `(${item.totalMachinePicCount})` : ''}
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ fontWeight: 600, mb: 1, px: 1, fontSize: { xs: 14, sm: 18 } }} variant='h6'>
              하위항목 선택
            </Typography>
            <TextField
              slotProps={{ htmlInput: { sx: { display: 'flex', alignItems: 'center', gap: 1 } } }}
              size='small'
              fullWidth
              select
              value={selectedSubItemId ?? 0}
              onChange={e => setSelectedSubItemId(Number(e.target.value))}
            >
              <MenuItem value={0}>
                <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  전체
                </Typography>
                <Typography color='primary.main' sx={{ overflowWrap: 'break-word' }}>
                  {selectedItem?.totalMachinePicCount ? `(${selectedItem?.totalMachinePicCount})` : ''}
                </Typography>
              </MenuItem>
              {selectedItem?.checklistSubItems?.map(sub => (
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
          </Grid>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={3}>
            {/* 기존 사진 목록 */}
            <Grid item xs={12}>
              <Paper sx={{ p: 4, borderColor: 'lightgray' }} elevation={3}>
                <div className='flex justify-between'>
                  <Typography sx={{ fontWeight: 700, mb: 5 }} color='primary.dark' variant='h4' gutterBottom>
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
                              .filter(
                                pic => pic.machineChecklistSubItemId === selectedSubItem?.machineChecklistSubItemId
                              )
                          )
                        }}
                      >
                        전체선택
                      </Button>,
                      <Button key={2} size='small' color='error' onClick={() => handleDeletePics()}>
                        일괄삭제({picturesToDelete.length})
                      </Button>
                    ]}
                    {filteredPics.length > 0 && (
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
                    )}
                  </div>
                </div>
                {selectedItemId === 0 ? ( // 점검항목: 전체
                  pictures.length > 0 ? (
                    checklistItems.map(item => {
                      const picsByItem = pictures.filter(
                        pic => pic.machineChecklistItemId === item.machineChecklistItemId
                      )

                      return (
                        picsByItem.length > 0 && (
                          <Box
                            key={item.machineChecklistItemId}
                            sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
                          >
                            <Typography
                              variant='h5'
                              paddingInlineStart={2}
                              onClick={() => setSelectedItemId(item.machineChecklistItemId)}
                              sx={{
                                cursor: 'pointer',
                                ':hover': { textDecoration: 'underline', textUnderlineOffset: '3px' },
                                width: 'fit-content'
                              }}
                            >
                              # {item.machineChecklistItemName}
                            </Typography>
                            <ImageList cols={isMobile ? 1 : 4} gap={0} rowHeight={isMobile ? 150 : 250}>
                              {picsByItem.map((pic, idx) => (
                                <PictureCard key={idx} pic={pic} />
                              ))}
                            </ImageList>
                          </Box>
                        )
                      )
                    })
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
                  )
                ) : selectedSubItemId === 0 ? ( //하위항목: 전체의 경우
                  selectedItem?.totalMachinePicCount !== 0 ? (
                    selectedItem?.checklistSubItems.map(sub => {
                      const picBySubItems = filteredPics.filter(
                        pic => pic.machineChecklistSubItemId === sub.machineChecklistSubItemId
                      )

                      return (
                        picBySubItems &&
                        picBySubItems.length > 0 && (
                          <Box
                            key={sub.machineChecklistSubItemId}
                            sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
                          >
                            <Typography
                              variant='h5'
                              paddingInlineStart={2}
                              onClick={() => setSelectedSubItemId(sub.machineChecklistSubItemId)}
                              sx={{
                                cursor: 'pointer',
                                ':hover': { textDecoration: 'underline', textUnderlineOffset: '3px' },
                                width: 'fit-content'
                              }}
                            >
                              # {sub.checklistSubItemName}
                            </Typography>
                            <ImageList cols={isMobile ? 1 : 4} gap={0} rowHeight={isMobile ? 150 : 250}>
                              {picBySubItems.map((pic, idx) => (
                                <PictureCard key={idx} pic={pic} />
                              ))}
                            </ImageList>
                          </Box>
                        )
                      )
                    })
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
                  )
                ) : filteredPics && filteredPics.length > 0 ? ( //하위항목이 정해진 경우
                  //해당 하위항목의 사진이 존재하는 경우
                  <ImageList cols={isMobile ? 1 : 4} gap={0} rowHeight={isMobile ? 150 : 250}>
                    {filteredPics.map((pic, idx) => (
                      <PictureCard key={idx} pic={pic} />
                    ))}
                  </ImageList>
                ) : (
                  <Box //해당 하위 항목의 사진 개수가 0인 경우
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
              </Paper>
            </Grid>
            {/* 사진 업로드 영역 */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 4,
                  position: 'relative',
                  borderColor: 'lightgray',
                  borderWidth: '1px'
                }}
                elevation={3}
              >
                {/* 선택된 파일 미리보기 */}
                {filesToUpload.length > 0 && (
                  <div>
                    <Typography color='black' variant='subtitle1' gutterBottom>
                      미리보기
                    </Typography>
                    <ImageList cols={isMobile ? 1 : 4} gap={0} rowHeight={isMobile ? 150 : 250}>
                      {filesToUpload.map((file, index) => (
                        <PicturePreviewCard key={index} file={file} index={index} />
                      ))}
                    </ImageList>
                  </div>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 5 }}>
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
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant='outlined' sx={{ marginTop: 6 }}>
            닫기
          </Button>
        </DialogActions>
        {selectedPic && (
          <PictureZoomModal
            MovePicture={MovePicture}
            open={showPicModal}
            setOpen={setShowPicModal}
            selectedPic={selectedPic}
            reloadPics={resetCursor}
            selectedInspection={selectedInspection}
            refetchSelectedInspection={refetchSelectedInspection}
          />
        )}
      </Dialog>
    )
  )
}

export default PictureListModal
