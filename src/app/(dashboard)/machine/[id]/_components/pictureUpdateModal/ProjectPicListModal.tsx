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
  Paper
} from '@mui/material'

// @ts-ignore
import type { AxiosRequestConfig } from 'axios'

import { toast } from 'react-toastify'

import type { MachineProjectPicReadResponseDtoType, ProjectPicType } from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import { uploadProjectPictures } from '@/@core/utils/uploadProjectPictures'
import { auth } from '@/lib/auth'
import ProjectPicZoomModal from '../pictureZoomModal/ProjectPicZoomModal'
import { useGetInspectionsSimple } from '@/@core/hooks/customTanstackQueries'
import { projectPicOption } from '@/app/_constants/options'
import ProjectPicCard from '../pictureCard/ProjectPicCard'
import PicPreviewCard from '../pictureCard/PicPreviewCard'
import ReloadButton from '../ReloadButton'

type ProjectPicListModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  ToggleProjectPic: () => void
}

const ProjectPicListModal = ({ open, setOpen, ToggleProjectPic }: ProjectPicListModalProps) => {
  const machineProjectId = useParams().id?.toString() as string

  // 사진 리스트
  const [pictures, setPictures] = useState<MachineProjectPicReadResponseDtoType[]>([])
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // 프로젝트 사진 관련
  const [selectedPicType, setSelectedPicType] = useState<ProjectPicType | '전체'>('전체')

  const [picturesToDelete, setPicturesToDelete] = useState<{ id: number; version: number }[]>([])
  const [showCheck, setShowCheck] = useState(false)

  // 무한스크롤 관련 Ref들
  const isLoadingRef = useRef(false)

  // 사진 클릭 기능 구현을 위한 상태
  const [selectedPic, setSelectedPic] = useState<MachineProjectPicReadResponseDtoType>()
  const [showPicZoom, setShowPicZoom] = useState(false)

  const filteredPics = pictures.filter(pic =>
    selectedPicType !== '전체' ? selectedPicType === pic.machineProjectPicType : true
  )

  const { data: inspections } = useGetInspectionsSimple(machineProjectId)

  // 반응형을 위한 미디어쿼리
  const isMobile = useContext(isMobileContext)

  const handleClose = () => {
    setOpen(false)
  }

  // 사진을 가져오는 함수. (무한 스크롤 X)
  const getPictures = useCallback(async () => {
    isLoadingRef.current = true

    try {
      const response = await auth
        .get<{
          data: {
            machineProjectPics: MachineProjectPicReadResponseDtoType[]
          }
        }>(`/api/machine-projects/${machineProjectId}/machine-project-pics`)
        .then(v => v.data.data.machineProjectPics)

      setPictures(response)

      return response
    } catch (err) {
      handleApiError(err)
    } finally {
      isLoadingRef.current = false
    }
  }, [machineProjectId])

  const handleUploadFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files) {
      const newFiles = Array.from(files)

      setFilesToUpload(prev => [...prev, ...newFiles])
    }
  }

  const handleFileUpload = async () => {
    if (selectedPicType === '전체') {
      toast.error('사진 종류를 지정하세요.')

      return
    }

    setIsUploading(true)

    const result = await uploadProjectPictures(machineProjectId, filesToUpload, selectedPicType)

    if (result) {
      setFilesToUpload([])

      // 다시 사진 가져오기
      getPictures()
    }

    setIsUploading(false)
  }

  const removePreviewFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeletePics = useCallback(async () => {
    try {
      await auth.delete(`/api/machine-projects/${machineProjectId}/machine-project-pics`, {
        data: { machineProjectPicDeleteRequestDtos: picturesToDelete }
      } as AxiosRequestConfig)

      // 다시 사진 가져오기
      getPictures()

      // 삭제 예정 리스트 리셋
      setPicturesToDelete([])

      handleSuccess('선택된 사진들이 일괄삭제되었습니다.')
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId, picturesToDelete, getPictures])

  async function MovePicture(dir: 'next' | 'previous') {
    const currentPictureIdx = pictures.findIndex(v => v.id === selectedPic?.id)

    if (currentPictureIdx === -1) {
      throw new Error('현재 사진을 찾을 수 없음. 관리자에게 문의하세요.')
    }

    switch (dir) {
      case 'next':
        if (currentPictureIdx + 1 < pictures.length) {
          setSelectedPic(pictures[currentPictureIdx + 1])
        } else {
          toast.warning('다음 사진이 없습니다')
        }

        break
      case 'previous':
        if (currentPictureIdx !== 0) {
          setSelectedPic(pictures[currentPictureIdx - 1])
        } else {
          toast.warning('첫번째 사진입니다')
        }

        break

      default:
        break
    }
  }

  const handleClickPicCard = useCallback(
    (pic: MachineProjectPicReadResponseDtoType) => {
      if (showCheck) {
        if (!picturesToDelete.find(v => v.id === pic.id)) {
          setPicturesToDelete(prev => [...prev, { id: pic.id, version: pic.version }])
        } else {
          setPicturesToDelete(prev => prev.filter(v => v.id !== pic.id))
        }
      } else {
        setSelectedPic(pic)
        setShowPicZoom(true)
      }
    },
    [showCheck, picturesToDelete]
  )

  // 이전에 PicZoom modal이 열린 적 있을 때만 닫혔을 때 사진 새로 가져오기 (showPicZoom의 default값이 false라 최초에 두 번 가져오는 것 방지)
  const wasOpened = useRef(false)

  useEffect(() => {
    if (!wasOpened.current) {
      wasOpened.current = true
    } else if (!showPicZoom) {
      getPictures()
    }
  }, [showPicZoom, getPictures])

  return (
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
          <i className='tabler-x' />
        </IconButton>
        <div className='flex flex-col gap-2 pe-7 items-end'>
          <Button
            variant='outlined'
            color='primary'
            onClick={() => {
              if (!inspections) return

              ToggleProjectPic()
            }}
            disabled={(inspections?.length ?? 0) === 0}
          >
            설비사진 추가
          </Button>
          {(inspections?.length ?? 0) === 0 && (
            <Typography color='error.main'>선택할 수 있는 설비가 없습니다</Typography>
          )}
        </div>
      </div>
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: 20, sm: 30 }, paddingInlineEnd: 5, py: '8.6px' }}>
          현장 사진
        </Typography>
        <Grid item xs={12}>
          <Typography sx={{ fontWeight: 600, mb: 1, px: 1, fontSize: { xs: 14, sm: 18 } }} variant='h6'>
            사진 종류
          </Typography>
          <TextField
            slotProps={{ htmlInput: { sx: { display: 'flex', alignItems: 'center', gap: 1 } } }}
            size='small'
            fullWidth
            select
            value={selectedPicType}
            onChange={e => {
              const value = e.target.value as ProjectPicType | '전체'

              setSelectedPicType(value)
            }}
          >
            <MenuItem value={'전체'}>
              <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>전체</Typography>
              {/* <Typography color='primary.main' sx={{ overflowWrap: 'break-word' }}>
                {totalPicCount ? `(${totalPicCount})` : ''}
              </Typography> */}
            </MenuItem>
            {projectPicOption.map(item => (
              <MenuItem key={item.value} value={item.value}>
                <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </Typography>
                {/* <Typography color='primary.main' sx={{ overflowWrap: 'break-word' }}>
                      {item.totalMachinePicCount ? `(${item.totalMachinePicCount})` : ''}
                    </Typography> */}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
        {/* 기존 사진 목록 */}
        <Box className='flex justify-between items-center' sx={{ borderBottom: '1px solid lightgray' }}>
          <div className='flex items-center mb-2'>
            <Typography sx={{ fontWeight: 700 }} color='primary.dark' variant='h4'>
              사진 목록
            </Typography>
            <ReloadButton handleClick={getPictures} tooltipText='현장사진 새로고침' />
          </div>
          <div className='flex gap-1 top-2 right-1 items-center'>
            {showCheck && [
              <Button
                key={1}
                size='small'
                color='warning'
                onClick={async () => {
                  setPicturesToDelete(filteredPics)
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
        </Box>
        <Grid item xs={12} sx={{ flex: 1, overflowY: 'auto', paddingTop: 2 }}>
          <div className='flex-1 h-full overflowX-visible overflowY-auto'>
            {filteredPics.length > 0 ? (
              selectedPicType !== '전체' ? (
                <ImageList cols={isMobile ? 1 : 4} gap={10} rowHeight={isMobile ? 150 : 250}>
                  {filteredPics.map(pic => (
                    <ProjectPicCard
                      key={pic.id}
                      pic={pic}
                      showCheck={showCheck}
                      checked={picturesToDelete.some(v => v.id === pic.id)}
                      handleClick={handleClickPicCard}
                    />
                  ))}
                </ImageList>
              ) : (
                projectPicOption.map(v => {
                  const label = v.label
                  const type = v.value
                  const picsByItem = pictures.filter(pic => pic.machineProjectPicType === type)

                  return (
                    picsByItem.length > 0 && (
                      <Box key={type} sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        <Typography
                          variant='h5'
                          paddingInlineStart={2}
                          onClick={() => setSelectedPicType(type)}
                          sx={{
                            cursor: 'pointer',
                            ':hover': { textDecoration: 'underline', textUnderlineOffset: '3px' },
                            width: 'fit-content'
                          }}
                        >
                          # {label}
                        </Typography>
                        <ImageList cols={isMobile ? 1 : 4} gap={10} rowHeight={isMobile ? 150 : 250}>
                          {picsByItem.map((pic, idx) => (
                            <ProjectPicCard
                              key={idx}
                              pic={pic}
                              showCheck={showCheck}
                              checked={picturesToDelete.some(v => v.id === pic.id)}
                              handleClick={handleClickPicCard}
                            />
                          ))}
                        </ImageList>
                      </Box>
                    )
                  )
                })
              )
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
                  <Typography color='black' variant='subtitle1'>
                    미리보기
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {filesToUpload.length}개 파일 선택됨
                  </Typography>
                </div>
                <ImageList
                  sx={{ overflowY: 'auto', height: '100%' }}
                  cols={isMobile ? 1 : 4}
                  gap={10}
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
                onChange={handleUploadFileSelect}
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
        <ProjectPicZoomModal
          MovePicture={MovePicture}
          open={showPicZoom}
          setOpen={setShowPicZoom}
          selectedPic={selectedPic}
          setPictures={setPictures}
        />
      )}
    </Dialog>
  )
}

export default ProjectPicListModal
