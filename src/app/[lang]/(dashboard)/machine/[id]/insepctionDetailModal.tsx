'use client'

// React Imports
import { useEffect, useState } from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Card, Box, Typography } from '@mui/material'
import axios from 'axios'

type EditUserInfoProps = {
  id: string
  open: boolean
  setOpen: (open: boolean) => void
  selectedMachine: any
  clickedPicCate: any
  onPhotoUploadSuccess?: () => void // 사진 업로드 성공 콜백 추가
}

const InspectionDetailModal = ({
  id,
  open,
  setOpen,
  selectedMachine,
  clickedPicCate,
  onPhotoUploadSuccess
}: EditUserInfoProps) => {
  // 사진 리스트
  const [selectedInspection, setSelectedInspection] = useState<any>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedSubCate, setSelectedSubCate] = useState<number | null>(null)

  const handleClose = () => {
    setOpen(false)
    setUploadedFiles([])
  }

  useEffect(() => {
    if (open && clickedPicCate?.subCates?.length > 0) {
      setSelectedSubCate(clickedPicCate.subCates[0].machinePicSubCateSeq)
    }
  }, [open, clickedPicCate])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files) {
      const newFiles = Array.from(files)

      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert('업로드할 파일을 선택하세요.')

      return
    }

    setIsUploading(true)

    console.log('selectedMachine', selectedMachine)

    try {
      // 1. 프리사인드 URL 요청
      const presignedResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/presigned-urls/upload`,
        {
          uploadType: 'INSPECTION_IMAGE',
          originalFileNames: uploadedFiles.map(file => file.name),
          projectId: parseInt(id),
          machineInspectionId: selectedMachine.machineInspectionId,
          cateName: selectedMachine.cateName || '배관설비',
          picCateName: selectedMachine.picCateName || '설비사진',
          picSubCateName: selectedMachine.picSubCateName || '현황사진'
        }
      )

      const presignedUrls = presignedResponse.data.data.presignedUrlResponseDtos

      // 2. 각 파일을 S3에 직접 업로드
      const uploadPromises = uploadedFiles.map(async (file, index) => {
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
          s3Key: presignedData.s3Key,
          uploadSuccess: true
        }
      })

      // 모든 파일 업로드 완료까지 대기
      const uploadResults = await Promise.all(uploadPromises)

      console.log('업로드 완료:', uploadResults)

      console.log('clickedPicCate는요!', clickedPicCate)

      // 3. DB에 사진 정보 기록
      const machinePicCreateRequestDtos = uploadResults.map(result => ({
        machinePicSubCateId: selectedSubCate || 1, // 기본값 또는 selectedMachine에서 가져오기
        originalFileName: result.fileName,
        s3Key: result.s3Key

        // cdnPath는 선택사항이므로 필요시 추가
      }))

      console.log('DB 기록 요청 데이터:', machinePicCreateRequestDtos)

      const dbResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${id}/machine-inspections/${selectedMachine.machineInspectionId}/machine-pics`,
        {
          machinePicCreateRequestDtos
        }
      )

      console.log('DB 기록 완료:', dbResponse.data)
      alert(`${uploadResults.length}개 사진이 성공적으로 업로드되었습니다.`)

      setUploadedFiles([])

      // 업로드 후 목록 새로고침

      // 업로드 후 목록 새로고침
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${id}/machine-pics?page=0&size=10`,
        {
          machineInspectionId: selectedMachine.machineInspectionId,
          machinePicCateId: clickedPicCate?.machinePicCateSeq || null
        }
      )

      setSelectedInspection(response.data.data)

      // 🔥 여기가 누락되어 있었습니다!
      console.log('🎯 사진 업로드 완료! 부모 콜백 호출 중...')

      if (onPhotoUploadSuccess) {
        onPhotoUploadSuccess()
        console.log('📞 onPhotoUploadSuccess 콜백 실행')
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (!open) return
    if (!selectedMachine || !selectedMachine.machineInspectionId) return

    const fetchData = async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${id}/machine-pics?page=0&size=10`,
        {
          machineInspectionId: selectedMachine.machineInspectionId,
          machinePicCateId: clickedPicCate?.machinePicCateSeq || null
        }
      )

      setSelectedInspection(response.data.data)
      console.log('response', response.data.data)
    }

    fetchData()
  }, [open, selectedMachine, id])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      style={{ zIndex: 1400 }}
      disableEnforceFocus
      disableAutoFocus
    >
      <DialogTitle>
        <span style={{ color: '#1976d2', fontWeight: 700, fontSize: 20 }}>점검 사진</span>
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>소분류 선택</Typography>

            <select
              value={selectedSubCate ?? ''}
              onChange={e => setSelectedSubCate(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              <option value=''>-- 소분류를 선택하세요 --</option>
              {clickedPicCate?.subCates?.map((sub: any) => (
                <option key={sub.machinePicSubCateSeq} value={sub.machinePicSubCateSeq}>
                  {sub.subCateName}
                </option>
              ))}
            </select>
          </Card>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
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
                  disabled={uploadedFiles.length === 0 || isUploading}
                  startIcon={<i className='ri-image-add-line' />}
                >
                  {isUploading ? '업로드 중...' : '사진 추가'}
                </Button>

                <Typography variant='body2' color='text.secondary'>
                  {uploadedFiles.length}개 파일 선택됨
                </Typography>
              </Box>

              {/* 선택된 파일 미리보기 */}
              {uploadedFiles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant='subtitle2' gutterBottom>
                    미리보기
                  </Typography>
                  <Grid container spacing={1}>
                    {uploadedFiles.map((file, index) => (
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
                    ))}
                  </Grid>
                </Box>
              )}
            </Card>
          </Grid>

          {/* 기존 사진 목록 */}
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom>
                검사 사진 목록
              </Typography>

              {selectedInspection?.content && selectedInspection.content.length > 0 ? (
                <Grid container spacing={2}>
                  {selectedInspection.content.map((inspe: any, idx: number) => (
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

export default InspectionDetailModal
