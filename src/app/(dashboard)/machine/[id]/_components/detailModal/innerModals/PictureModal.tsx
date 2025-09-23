'use client'

// React Imports
import { useEffect, useState } from 'react'

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
  IconButton
} from '@mui/material'
import axios from 'axios'

import { toast } from 'react-toastify'

import type {
  MachineInspectionDetailResponseDtoType,
  MachinePicCateWithPicCountDtoType,
  MachinePicSubCateResponseDtoType
} from '@/app/_type/types'
import { handleSuccess } from '@/utils/errorHandler'

type PictureModalProps = {
  machineProjectId: string
  open: boolean
  setOpen: (open: boolean) => void
  selectedMachineData: MachineInspectionDetailResponseDtoType
  clickedPicCate: MachinePicCateWithPicCountDtoType
}

const PictureModal = ({ machineProjectId, open, setOpen, selectedMachineData, clickedPicCate }: PictureModalProps) => {
  // 사진 리스트
  const [pictures, setPictures] = useState<any[]>([])
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedSubCate, setSelectedSubCate] = useState<MachinePicSubCateResponseDtoType>()

  const handleClose = () => {
    setOpen(false)
    setFilesToUpload([])
  }

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
    } else if (!selectedSubCate) {
      toast.error('소분류를 선택하세요.')

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
        machineInspectionId: selectedMachineData.machineInspectionResponseDto.id,
        cateName: selectedMachineData.machineInspectionResponseDto.machineCategoryName ?? '배관설비',
        picCateName: clickedPicCate.machineChecklistItemName ?? '설비사진',
        picSubCateName: selectedSubCate?.checklistSubItemName ?? '현황사진',

        // ! 현재 유저의 ID => 로그인 기능 구현 후 추가
        memberId: 1
      })

      const presignedUrls = presignedResponse.data.data.presignedUrlResponseDtos

      // 2. 각 파일을 S3에 직접 업로드 (AWS S3로 POST)
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
        machineChecklistSubItemId: selectedSubCate?.machineChecklistSubItemId || 1, // 기본값 또는 selectedMachine에서 가져오기
        originalFileName: result.fileName,
        s3Key: result.s3Key

        // cdnPath는 추후 확장사항
      }))

      const dbResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedMachineData.machineInspectionResponseDto.id}/machine-pics`,
        {
          machinePicCreateRequestDtos
        }
      )

      console.log('DB 기록 완료:', dbResponse.data)
      handleSuccess(`${uploadResults.length}개 사진이 성공적으로 업로드되었습니다.`)

      setFilesToUpload([])

      // 업로드 후 목록 새로고침
      const response = await axios.post<{ data: { content: any[] } }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-pics?page=0&size=10`,
        {
          machineProjectId: parseInt(machineProjectId),
          machineInspectionId: selectedMachineData.machineInspectionResponseDto.id,
          machineChecklistItemId: clickedPicCate.machineChecklistItemId
        }
      )

      setPictures(response.data.data.content)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    const getData = async () => {
      const response = await axios.post<{ data: { content: any[] } }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-pics?page=0&size=10`,
        {
          machineProjectId: parseInt(machineProjectId),
          machineInspectionId: selectedMachineData.machineInspectionResponseDto.id,
          machineChecklistItemId: clickedPicCate.machineChecklistItemId
        }
      )

      setPictures(response.data.data.content)
      console.log('response', response.data.data.content)
    }

    getData()
  }, [open, selectedMachineData, machineProjectId, clickedPicCate])

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth disableEnforceFocus disableAutoFocus>
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className='ps-1 flex flex-col gap-1'>
          <span style={{ fontWeight: 700, fontSize: 24 }}>사진 목록</span>
          <span>{clickedPicCate.machineChecklistItemName}</span>
        </div>
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>소분류 선택</Typography>
            <TextField
              size='small'
              fullWidth
              select
              value={selectedSubCate ? JSON.stringify(selectedSubCate) : JSON.stringify({})}
              onChange={e => setSelectedSubCate(JSON.parse(e.target.value))}
            >
              <MenuItem value={JSON.stringify({})} disabled>
                -- 소분류를 선택하세요 --
              </MenuItem>
              {clickedPicCate?.checklistSubItems?.map(sub => (
                <MenuItem key={sub.machineChecklistSubItemId} value={JSON.stringify(sub)}>
                  {sub.checklistSubItemName}
                  <Typography color='primary.main'>{sub.machinePicCount ? `(${sub.machinePicCount})` : ''}</Typography>
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
              <Typography variant='h6' gutterBottom>
                검사 사진 목록
              </Typography>

              {pictures && pictures.length > 0 ? (
                <Grid container spacing={2}>
                  {pictures.map((inspe: any, idx: number) => (
                    <Grid item xs={6} sm={4} md={3} key={idx}>
                      <Card>
                        <img
                          src={inspe.presignedUrl}
                          alt={`검사 사진 ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover'
                          }}
                        />
                        <Box sx={{ p: 1 }}>
                          <Typography variant='caption'>사진 {idx + 1}</Typography>
                          {inspe.uploadDate && (
                            <Typography variant='caption' color='text.secondary' display='block'>
                              {new Date(inspe.uploadDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
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
    </Dialog>
  )
}

export default PictureModal
