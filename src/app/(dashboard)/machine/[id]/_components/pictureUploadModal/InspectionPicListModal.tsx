'use client'

// React Imports
import { useCallback, useContext, useEffect, useRef, useState } from 'react'

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
  ImageList,
  Paper,
  Backdrop,
  CircularProgress
} from '@mui/material'

// @ts-ignore
import type { AxiosRequestConfig } from 'axios'

import { toast } from 'react-toastify'

import { IconLoader2, IconPhotoOff, IconUpload, IconX } from '@tabler/icons-react'

import JSZip from 'jszip'

import { saveAs } from 'file-saver'

import type {
  MachineChecklistItemsWithPicCountResponseDtosType,
  MachinePicPresignedUrlResponseDtoType,
  MachinePicCursorType
} from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import InspectionPicZoomModal from '../pictureZoomModal/InspectionPicZoomModal'
import { uploadInspectionPictures } from '@/@core/utils/uploadInspectionPictures'
import { useGetInspectionsSimple, useGetSingleInspection } from '@/@core/hooks/customTanstackQueries'
import { auth } from '@/lib/auth'
import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import InspectionPicCard from '../pictureCard/InspectionPicCard'
import PicPreviewCard from '../pictureCard/PicPreviewCard'
import ReloadButton from '../ReloadButton'
import { setOffsetContext } from '../tabs/InspectionListTabContent'

const DEFAULT_PAGESIZE = 1000

type InspectionPicListModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  clickedPicCate?: MachineChecklistItemsWithPicCountResponseDtosType
  ToggleProjectPic: () => void
  defaultPicInspectionId?: number
}

const InspectionPicListModal = ({
  open,
  setOpen,
  clickedPicCate,
  ToggleProjectPic,
  defaultPicInspectionId
}: InspectionPicListModalProps) => {
  const machineProjectId = useParams().id?.toString() as string

  const { data: inspections } = useGetInspectionsSimple(machineProjectId)

  const setOffset = useContext(setOffsetContext)
  const isMobile = useContext(isMobileContext)

  const [picInspectionId, setPicInspectionId] = useState(
    defaultPicInspectionId ?? (inspections ? inspections[0].id : 0)
  )

  const { data: selectedInspection, refetch: refetchSelectedInspection } = useGetSingleInspection(
    machineProjectId,
    picInspectionId.toString()
  )

  // 사진 리스트
  const [pictures, setPictures] = useState<MachinePicPresignedUrlResponseDtoType[]>([])
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  const [checkedPics, setCheckedPics] = useState<MachinePicPresignedUrlResponseDtoType[]>([])
  const [showCheck, setShowCheck] = useState(false)

  // 무한스크롤 관련 Ref들
  const isLoadingRef = useRef(false)
  const hasNextRef = useRef(true)
  const nextCursorRef = useRef<MachinePicCursorType | null>(undefined)

  // 사진 클릭 기능 구현을 위한 상태
  const [selectedPicId, setSelectedPicId] = useState<number>()
  const selectedPic = pictures.find(v => v.machinePicId === selectedPicId)

  const [openPicZoom, setOpenPicZoom] = useState(false)

  const [selectAll, setSelectAll] = useState(true)

  const filteredPics = pictures.filter(
    pic =>
      (selectedItemId === 0 || pic.machineChecklistItemId === selectedItemId) &&
      (selectedSubItemId === 0 || pic.machineChecklistSubItemId === selectedSubItem?.machineChecklistSubItemId)
  )

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

  const resetCursor = () => {
    hasNextRef.current = true
    nextCursorRef.current = undefined
    setPictures([])
  }

  // 현재 커서 정보에 기반해서 사진을 가져오는 함수.
  // (API 자체는 무한 스크롤로 구현되어 있지만 사용자 편의성을 위해 한번에 다 가져오는 것으로 결정) - 최초에 1000개
  const getPictures = useCallback(
    async (pageSize = DEFAULT_PAGESIZE) => {
      if (!hasNextRef.current || isLoadingRef.current || !picInspectionId) return

      isLoadingRef.current = true

      const requestBody = {
        machineInspectionId: picInspectionId,
        ...(nextCursorRef.current ? { cursor: nextCursorRef.current } : {})
      }

      try {
        const response = await auth.post<{
          data: {
            content: MachinePicPresignedUrlResponseDtoType[]
            hasNext: boolean
            nextCursor: MachinePicCursorType | null
          }
        }>(`/api/machine-projects/${machineProjectId}/machine-pics?page=0&size=${pageSize}`, requestBody)

        console.log('get pictures:')
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
    [machineProjectId, picInspectionId]
  )

  const refetchPictures = useCallback(async () => {
    resetCursor()
    await getPictures()
  }, [getPictures])

  const handleFileUpload = async () => {
    if (!selectedInspection) return

    if (filesToUpload.length === 0) {
      toast.error('업로드할 파일을 선택하세요.')

      return
    } else if (!selectedSubItem) {
      toast.error('하위항목을 선택하세요.')

      return
    }

    setIsLoading(true)

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
      // 디테일 모달 테이블의 해당 목록 정보 최신화 - selcetedMachine 최신화
      await refetchSelectedInspection()

      // 사진 목록 최신화
      await refetchPictures()
      toast.success(`${filesToUpload.length}개 사진이 성공적으로 업로드되었습니다.`)
      setFilesToUpload([])
      setOffset && setOffset(0)
    } else {
      toast.error('사진 업로드에 문제가 발생했습니다.')
    }

    setIsLoading(false)
  }

  const removePreviewFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index))
  }

  const handleClickInspectionPicCard = useCallback(
    (pic: MachinePicPresignedUrlResponseDtoType) => {
      if (showCheck) {
        if (!checkedPics.find(v => v.machinePicId === pic.machinePicId)) {
          setCheckedPics(prev => [...prev, pic])
        } else {
          setCheckedPics(prev => prev.filter(v => v.machinePicId !== pic.machinePicId))
        }
      } else {
        setSelectedPicId(pic.machinePicId)
        setOpenPicZoom(true)
      }
    },
    [showCheck, checkedPics]
  )

  const handleDeletePics = useCallback(async () => {
    try {
      setIsLoading(true)

      await auth.delete(`/api/machine-projects/${machineProjectId}/machine-pics`, {
        data: { machinePicDeleteRequestDtos: checkedPics }
      } as AxiosRequestConfig)

      // 성공했다면 업로드 때와 마찬가지로 selectedMachine 최신화.
      refetchSelectedInspection()

      setPictures(prev => prev.filter(v => !checkedPics.find(k => k.machinePicId === v.machinePicId)))

      handleSuccess(`선택된 사진 ${checkedPics.length}장이 일괄삭제되었습니다.`)

      // 삭제 예정 리스트 리셋
      setCheckedPics([])

      // setShowCheck(false)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }, [machineProjectId, checkedPics, refetchSelectedInspection])

  const handleDownloadPics = useCallback(async () => {
    try {
      setIsLoading(true)

      const zip = new JSZip()

      const PicPromises = checkedPics.map(async pic => {
        const res = await fetch(pic.downloadPresignedUrl)

        if (!res) {
          return
        }

        const blob = await res.blob()

        const extension = pic.originalFileName.split('.').at(-1)

        const safeName = ['jpg', 'jpeg', 'png'].some(v => v === extension)
          ? pic.originalFileName
          : pic.originalFileName.concat('.png')

        zip.file(safeName, blob)
      })

      await Promise.all(PicPromises)

      const content = await zip.generateAsync({ type: 'blob' })

      const selectedItemName = selectedItem?.machineChecklistItemName
      const selectedSubItemName = selectedSubItem?.checklistSubItemName

      saveAs(
        content,
        `${selectedInspection?.machineInspectionResponseDto.machineInspectionName}${selectedItemName ? '_' + selectedItemName : ''}${selectedSubItemName ? '_' + selectedSubItemName : ''}.zip`
      )
    } catch (e) {
      handleApiError(e)
    } finally {
      setIsLoading(false)
    }
  }, [
    checkedPics,
    selectedInspection?.machineInspectionResponseDto.machineInspectionName,
    selectedItem?.machineChecklistItemName,
    selectedSubItem?.checklistSubItemName
  ])

  async function MovePicture(dir: 'next' | 'previous') {
    const currentPictureIdx = pictures.findIndex(v => v.machinePicId === selectedPicId)

    if (currentPictureIdx === -1) {
      throw new Error('현재 사진을 찾을 수 없음. 관리자에게 문의하세요.')
    }

    switch (dir) {
      case 'next':
        if (currentPictureIdx + 1 < pictures.length) {
          setSelectedPicId(pictures[currentPictureIdx + 1].machinePicId)

          return
        }

        if (hasNextRef.current) {
          const nextResponse = await getPictures()

          // if (currentPictureIdx + 1 >= pictures.length) {
          //   throw new Error('hasNext가 true지만 다음 페이지 없음')
          // }

          setSelectedPicId(nextResponse?.content[0].machinePicId)
        } else {
          toast.warning('다음 사진이 없습니다')
        }

        break
      case 'previous':
        if (currentPictureIdx === 0) {
          toast.warning('첫번째 사진입니다')
        } else {
          setSelectedPicId(pictures[currentPictureIdx - 1].machinePicId)
        }

        break

      default:
        break
    }
  }

  // 설비변경 될 때(최초 포함) 사진 가져오기
  useEffect(() => {
    refetchPictures()
  }, [refetchPictures])

  return (
    selectedInspection &&
    inspections && (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='xl'
        fullWidth
        slotProps={{
          paper: {
            sx: { height: '90vh', display: 'flex', flexDirection: 'column' }
          }
        }}
        disableEnforceFocus
        disableAutoFocus
      >
        <div className='flex flex-col gap-5 absolute top-0 right-0 items-end'>
          <IconButton onClick={() => setOpen(false)}>
            <IconX />
          </IconButton>
          <div className='grid place-items-center pe-7' onClick={ToggleProjectPic}>
            <Button variant='outlined' color='success'>
              현장사진 추가
            </Button>
          </div>
        </div>
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <TextField
            size='small'
            select
            value={picInspectionId}
            onChange={e => {
              setShowCheck(false)
              setSelectedItemId(0)
              setPicInspectionId(Number(e.target.value))
            }}
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
                setSelectedSubItemId(0)
                setSelectedItemId(Number(e.target.value))
                setSelectAll(true)
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
              disabled={!selectedItem}
              slotProps={{ htmlInput: { sx: { display: 'flex', alignItems: 'center', gap: 1 } } }}
              size='small'
              fullWidth
              select
              value={selectedSubItemId ?? 0}
              onChange={e => {
                setSelectedSubItemId(Number(e.target.value))
                setSelectAll(true)
              }}
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
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
          <Box className='flex justify-between items-center' sx={{ borderBottom: '1px solid lightgray' }}>
            <div className='flex items-center mb-2'>
              <Typography sx={{ fontWeight: 700 }} color='primary.dark' variant='h4'>
                사진 목록
              </Typography>
              <ReloadButton handleClick={refetchPictures} tooltipText='설비사진 새로고침' />
            </div>

            {filteredPics.length > 0 && (
              <div className='flex flex-col items-end'>
                <Typography variant='subtitle1'>
                  ※선택 버튼을 통해 선택 삭제 혹은 선택 다운로드 할 수 있습니다.
                </Typography>
                <div className='flex gap-1 top-2 right-1 items-center'>
                  {showCheck && [
                    <Button
                      key={0}
                      color='warning'
                      onClick={async () => {
                        if (selectAll) {
                          setCheckedPics(prev =>
                            prev
                              .filter(v => !filteredPics.some(p => p.machinePicId === v.machinePicId))
                              .concat(filteredPics)
                          )
                        } else {
                          setCheckedPics(prev =>
                            prev.filter(v => !filteredPics.some(p => p.machinePicId === v.machinePicId))
                          )
                        }

                        setSelectAll(prev => !prev)
                      }}
                    >
                      {selectAll ? '전체선택' : '전체해제'}
                    </Button>,
                    <Button key={1} className='text-blue-500' onClick={handleDownloadPics}>
                      다운로드({checkedPics.length})
                    </Button>,
                    <Button key={2} color='error' onClick={handleDeletePics}>
                      일괄삭제({checkedPics.length})
                    </Button>
                  ]}
                  <Button
                    color={showCheck ? 'secondary' : 'primary'}
                    onClick={() => {
                      if (showCheck) {
                        setCheckedPics([])
                        setSelectAll(true)
                      }

                      setShowCheck(prev => !prev)
                    }}
                  >
                    {showCheck ? '취소' : '선택'}
                  </Button>
                </div>
              </div>
            )}
          </Box>
          {/* 기존 사진 목록 */}
          <Grid item xs={12} sx={{ flex: 1, overflowY: 'auto', paddingTop: 2 }}>
            <div className='flex-1 h-full overflowX-visible overflowY-auto'>
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
                          sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 0 }}
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
                          <ImageList
                            sx={{ overflow: 'visible' }}
                            cols={isMobile ? 1 : 4}
                            gap={10}
                            rowHeight={isMobile ? 150 : 250}
                          >
                            {picsByItem.map((pic, idx) => (
                              <InspectionPicCard
                                key={idx}
                                pic={pic}
                                showCheck={showCheck}
                                checked={checkedPics.some(v => v.machinePicId === pic.machinePicId)}
                                handleClick={handleClickInspectionPicCard}
                              />
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
                    <IconPhotoOff size={50} />
                    <Typography>등록된 검사 사진이 없습니다</Typography>
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
                              <InspectionPicCard
                                key={idx}
                                pic={pic}
                                showCheck={showCheck}
                                checked={checkedPics.some(v => v.machinePicId === pic.machinePicId)}
                                handleClick={handleClickInspectionPicCard}
                              />
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
                    <IconPhotoOff size={50} />
                    <Typography>등록된 검사 사진이 없습니다</Typography>
                  </Box>
                )
              ) : filteredPics && filteredPics.length > 0 ? ( //하위항목이 정해진 경우
                //해당 하위항목의 사진이 존재하는 경우
                <ImageList cols={isMobile ? 1 : 4} gap={0} rowHeight={isMobile ? 150 : 250}>
                  {filteredPics.map((pic, idx) => (
                    <InspectionPicCard
                      key={idx}
                      pic={pic}
                      showCheck={showCheck}
                      checked={checkedPics.some(v => v.machinePicId === pic.machinePicId)}
                      handleClick={handleClickInspectionPicCard}
                    />
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
                  <IconPhotoOff size={50} />
                  <Typography>등록된 검사 사진이 없습니다.</Typography>
                </Box>
              )}
            </div>
          </Grid>
          <Divider />
          {/* 사진 업로드 영역 */}
          <Grid item xs={12} sx={{ maxHeight: '60%' }}>
            <Paper
              sx={{
                p: 4,
                position: 'relative',
                borderWidth: '1px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
              elevation={4}
            >
              {/* 선택된 파일 미리보기 */}
              {filesToUpload.length > 0 && (
                <>
                  <div className='flex gap-2 items-end pb-2'>
                    <Typography color='success.dark' variant='h5'>
                      미리보기
                    </Typography>
                    <Typography variant='body1' color='text.secondary'>
                      {filesToUpload.length}개 파일 선택됨
                    </Typography>
                  </div>
                  <ImageList
                    sx={{ overflowY: 'auto', height: '100%' }}
                    cols={isMobile ? 1 : 4}
                    gap={0}
                    rowHeight={isMobile ? 150 : 250}
                  >
                    {filesToUpload.map((file, index) => (
                      <PicPreviewCard key={index} file={file} handleClickX={() => removePreviewFile(index)} />
                    ))}
                  </ImageList>
                </>
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
                  <Button variant='outlined' component='span'>
                    파일 선택
                  </Button>
                </label>

                <Button
                  variant='contained'
                  color='success'
                  onClick={handleFileUpload}
                  disabled={filesToUpload.length === 0 || isLoading}
                  startIcon={isLoading ? <IconLoader2 className='animate-spin' /> : <IconUpload />}
                >
                  {isLoading ? '업로드 중...' : '사진 업로드'}
                </Button>

                <Button
                  variant='contained'
                  color='secondary'
                  type='button'
                  onClick={() => setFilesToUpload([])}
                  disabled={filesToUpload.length === 0}
                >
                  취소
                </Button>
              </Box>
            </Paper>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined' sx={{ marginTop: 6 }}>
            닫기
          </Button>
        </DialogActions>
        {selectedPic && (
          <InspectionPicZoomModal
            MovePicture={MovePicture}
            open={openPicZoom}
            setOpen={setOpenPicZoom}
            selectedPic={selectedPic}
            setPictures={setPictures}
          />
        )}
        <Backdrop open={isLoading}>
          <div className='flex flex-col gap-5 items-center'>
            <CircularProgress size={70} sx={{ color: 'white' }} />
          </div>
        </Backdrop>
      </Dialog>
    )
  )
}

export default InspectionPicListModal
