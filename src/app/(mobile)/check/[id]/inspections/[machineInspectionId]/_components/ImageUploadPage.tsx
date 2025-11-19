import { useContext, useEffect, useRef, useState } from 'react'

import { useParams } from 'next/navigation'

import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  InputLabel,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import { toast } from 'react-toastify'

import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import { uploadInspectionPictures } from '@/@core/utils/uploadInspectionPictures'
import { useGetChecklistInfo } from '@/@core/hooks/customTanstackQueries'

interface checklistFormType {
  checklistSubItemId: number
}

export default function ImageUploadPage() {
  const { id: machineProjectId, machineInspectionId } = useParams()

  const inputRef = useRef<HTMLInputElement>(null)

  const isMobile = useContext(isMobileContext)

  const { refetch } = useGetChecklistInfo(machineProjectId!.toString(), machineInspectionId!.toString())

  const [filesToUpload, setFilesToUpload] = useState<File[]>([])

  const [checklistItemId, setChecklistItemId] = useState(0)
  const [uploading, setUploading] = useState(false)

  const emptyCameraRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !machineProjectId || !machineInspectionId) return

    const file = event.target.files[0]

    setFilesToUpload(prev => [...prev, file])
  }

  const checklistForm = useForm<checklistFormType>({
    defaultValues: {
      checklistSubItemId: 0
    }
  })

  const watchedChecklistSubItemId = checklistForm.watch('checklistSubItemId')

  const { data: checklistList } = useGetChecklistInfo(machineProjectId!.toString(), machineInspectionId!.toString())

  useEffect(() => {
    checklistForm.reset({ checklistSubItemId: 0 })
  }, [checklistItemId, checklistForm])

  const removeFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadPictures = (data: checklistFormType) => {
    if (!(machineProjectId && machineInspectionId)) {
      toast.warning('기계정보와 설비정보가 없습니다.')

      return
    }

    if (!checklistForm.getValues().checklistSubItemId) {
      toast.warning('하위항목을 먼저 지정해주세요')

      return
    }

    setUploading(true)

    setTimeout(async () => {
      setUploading(false)

      const result = await uploadInspectionPictures(
        machineProjectId.toString(),
        machineInspectionId.toString(),
        filesToUpload,
        checklistItemId,
        data.checklistSubItemId
      )

      if (result) {
        setFilesToUpload([])
        refetch()
      }
    }, 1500)
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

  return (
    <form onSubmit={checklistForm.handleSubmit(handleUploadPictures)}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: !isMobile ? 6 : 4 }}>
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          multiple
          onChange={e => {
            const files = e.target.files

            if (files) {
              const newFiles = Array.from(files)

              setFilesToUpload(prev => [...prev, ...newFiles])
            }
          }}
          className='hidden'
        />
        <input
          type='file'
          capture='environment'
          className='hidden'
          accept='image/*'
          ref={emptyCameraRef}
          onChange={handleImageUpload}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: !isMobile ? 2 : 1 }}>
          <div className='flex flex-col gap-1'>
            <InputLabel sx={{ px: 2 }}>점검항목</InputLabel>
            <TextField
              onChange={e => setChecklistItemId(Number(e.target.value))}
              value={checklistItemId}
              select
              size={isMobile ? 'small' : 'medium'}
              fullWidth
              slotProps={{ input: { sx: { fontSize: 18 } } }}
            >
              <MenuItem value={0} disabled>
                <Typography sx={{ fontSize: 18, opacity: '50%' }}>--- 점검항목을 선택하세요 ---</Typography>
              </MenuItem>
              {checklistList?.map(v => (
                <MenuItem key={v.machineChecklistItemId} value={v.machineChecklistItemId}>
                  {v.machineChecklistItemName}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <Controller
            control={checklistForm.control}
            name='checklistSubItemId'
            render={({ field }) => (
              <div className='flex flex-col gap-1'>
                <InputLabel sx={{ px: 2 }}>하위항목</InputLabel>
                <TextField
                  select
                  ref={field.ref}
                  onChange={e => field.onChange(Number(e.target.value))}
                  value={field.value}
                  size={isMobile ? 'small' : 'medium'}
                  fullWidth
                  hiddenLabel
                  slotProps={{ input: { sx: { fontSize: 18 } } }}
                >
                  <MenuItem value={0} disabled>
                    <Typography sx={{ fontSize: 18, opacity: '50%' }}>--- 하위항목을 선택하세요 ---</Typography>
                  </MenuItem>
                  {checklistList &&
                    checklistList
                      .find(v => v.machineChecklistItemId === checklistItemId)
                      ?.checklistSubItems.map(p => (
                        <MenuItem key={p.machineChecklistSubItemId} value={p.machineChecklistSubItemId}>
                          {p.checklistSubItemName}
                        </MenuItem>
                      ))}
                </TextField>
              </div>
            )}
          />
        </Box>
        {/* 선택된 파일 미리보기 */}
        <Box sx={{ border: '1px solid lightgray', p: 2, borderRadius: 1, display: 'grid', gap: 3 }}>
          <Typography sx={{ paddingInlineStart: 2 }} color='black' variant='h5' gutterBottom>
            미리보기
          </Typography>
          {filesToUpload.length > 0 ? (
            <ImageList cols={isMobile ? 1 : 2} gap={0} rowHeight={isMobile ? 150 : 250}>
              {filesToUpload.map((file, index) => (
                <PicturePreviewCard key={index} file={file} index={index} />
              ))}
            </ImageList>
          ) : (
            <Box sx={{ p: 2, display: 'grid', placeItems: 'center' }}>
              <Typography>업로드할 파일이 없습니다.</Typography>
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              ...(isMobile && { flexDirection: 'column' }),
              justifyContent: 'end',
              gap: 2,
              alignItems: 'end'
            }}
          >
            <Typography>{filesToUpload.length}개 선택됨</Typography>
            <div className='flex gap-2'>
              <Button color='success' variant='contained' type='button' onClick={() => emptyCameraRef.current?.click()}>
                카메라
              </Button>

              <Button type='button' variant='contained' onClick={() => inputRef.current?.click()}>
                갤러리
              </Button>
              <Button
                type='submit'
                variant='contained'
                color='secondary'
                disabled={filesToUpload.length === 0 || watchedChecklistSubItemId === 0}
              >
                사진 업로드
              </Button>
            </div>
          </Box>
        </Box>
      </Box>
      <Backdrop sx={{ color: 'white' }} open={uploading} onClick={e => e.stopPropagation()}>
        <CircularProgress color='inherit' />
      </Backdrop>
    </form>
  )
}
