'use client'

import type { ChangeEvent } from 'react'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogTitle,
  Fab,
  IconButton,
  InputLabel,
  MenuItem,
  TextField,
  Typography
} from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import { IconCamera, IconChevronLeft } from '@tabler/icons-react'

import MobileHeader from '@/app/(mobile)/_components/MobileHeader'
import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import { auth } from '@/lib/auth'
import type {
  MachinePicCursorType,
  MachinePicPresignedUrlResponseDtoType,
  MachinePicUpdateResponseDtoType
} from '@/@core/types'
import { useGetChecklistInfo, useGetSingleInspectionSumamry } from '@/@core/hooks/customTanstackQueries'
import { printErrorSnackbar, printSuccessSnackbar, printWarningSnackbar } from '@/@core/utils/snackbarHandler'
import getS3Key from '@/@core/utils/getS3Key'

const max_pic = 100

interface formType {
  version: number
  machinePicId: number
  machineInspectionId: number
  machineChecklistSubItemId: number
  originalFileName: string
  alternativeSubTitle: string
  measuredValue: string
  remark: string
}

export default function PicturePage() {
  const { id: machineProjectId, machineInspectionId } = useParams()

  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPicId = searchParams.get('picId')

  const isMobile = useContext(isMobileContext)

  const saveButtonRef = useRef<HTMLElement>(null)
  const scrollableAreaRef = useRef<HTMLElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [pictures, setPictures] = useState<MachinePicPresignedUrlResponseDtoType[]>([])
  const [selectedPicId, setSelectedPicId] = useState(Number(initialPicId))
  const selectedPic = pictures.find(v => v.machinePicId === selectedPicId)

  const [openAlert, setOpenAlert] = useState(false)

  const [machineChecklistItemId, setMachineChecklistItemId] = useState(0)
  const { data: checklistList } = useGetChecklistInfo(machineProjectId!.toString(), machineInspectionId!.toString())

  const { data: currentInspectioin } = useGetSingleInspectionSumamry(`${machineProjectId}`, `${machineInspectionId}`)

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    control,
    watch,
    formState: { isDirty }
  } = useForm<formType>({
    defaultValues: {
      machinePicId: 0,
      version: 0,
      machineInspectionId: 0,
      machineChecklistSubItemId: 0,
      originalFileName: '',
      alternativeSubTitle: '',
      measuredValue: '',
      remark: ''
    }
  })

  const watchedSubItemId = watch('machineChecklistSubItemId')

  const subItems = useMemo(() => {
    return checklistList?.find(v => v.machineChecklistItemId === machineChecklistItemId)?.checklistSubItems ?? []
  }, [checklistList, machineChecklistItemId])

  useEffect(() => {
    if (!subItems.find(v => v.machineChecklistSubItemId === watchedSubItemId)) {
      setValue('machineChecklistSubItemId', 0)
    }
  }, [subItems, watchedSubItemId, setValue])

  useEffect(() => {
    console.log('select picture:', selectedPic)

    if (selectedPic) {
      reset({
        version: selectedPic.version,
        machinePicId: selectedPic.machinePicId,
        machineInspectionId: selectedPic.machineInspectionId,
        machineChecklistSubItemId: selectedPic.machineChecklistSubItemId ?? 0,
        originalFileName: selectedPic.originalFileName ?? '',
        alternativeSubTitle: selectedPic.alternativeSubTitle ?? '',
        measuredValue: selectedPic.measuredValue ?? '',
        remark: selectedPic.remark
      })
      setMachineChecklistItemId(selectedPic.machineChecklistItemId ?? 0)
      setTimeout(() => {
        scrollableAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    }
  }, [selectedPic, reset])

  // 모든 사진 가져오기
  const getAllPictures = useCallback(async () => {
    const response = await auth
      .post<{
        data: {
          content: MachinePicPresignedUrlResponseDtoType[]
          hasNext: boolean
          nextCursor: MachinePicCursorType | null
        }
      }>(`/api/machine-projects/${machineProjectId}/machine-pics?page=0&size=${max_pic}`, {
        machineInspectionId: Number(machineInspectionId)
      })
      .then(v => v.data.data.content)

    setPictures(response)
    console.log('get all pictures:', response)
  }, [machineInspectionId, machineProjectId])

  useEffect(() => {
    getAllPictures()
  }, [getAllPictures])

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files) return
    const file: File = files[0]

    const s3Key = await getS3Key(
      `${machineProjectId}`,
      [file],
      `${machineInspectionId}`,
      selectedPic?.machineChecklistItemId,
      selectedPic?.machineChecklistSubItemId
    ).then(v => v && v[0])

    if (!s3Key?.uploadSuccess) {
      return
    }

    try {
      const response = await auth
        .put<{
          data: MachinePicUpdateResponseDtoType
        }>(
          `/api/machine-projects/${machineProjectId}/machine-inspections/${machineInspectionId}/machine-pics/${selectedPicId}`,
          { version: getValues().version, s3Key: s3Key.s3Key }
        )
        .then(v => v.data.data)

      setPictures(prev =>
        prev.map(v =>
          v.machinePicId === selectedPicId
            ? {
                ...v,
                ...response,
                machineChecklistItemId: machineChecklistItemId,
                presignedUrl: URL.createObjectURL(file)
              }
            : v
        )
      )
      reset({ ...response })
      console.log('updated picture:', response)
      printSuccessSnackbar(`사진이 변경되었습니다`)
    } catch (e) {
      printErrorSnackbar(e, '사진 변경에 실패했습니다')
    }
  }

  const handleDeletePicture = useCallback(async () => {
    try {
      await auth.delete(`/api/machine-projects/${machineProjectId}/machine-pics`, {
        // @ts-ignore
        data: {
          machinePicDeleteRequestDtos: [{ machinePicId: getValues().machinePicId, version: getValues().version }]
        }
      })

      const rest = pictures.filter(v => v.machinePicId !== selectedPicId)

      if (rest.length) {
        setSelectedPicId(rest[0].machinePicId)
        setPictures(rest)
      } else {
        router.back()
      }

      setOpenAlert(false)
    } catch (e) {
      printErrorSnackbar(e)
    }

    return
  }, [machineProjectId, selectedPicId, getValues, pictures, router])

  const handleSave = useCallback(
    async (data: formType) => {
      if (!watchedSubItemId) {
        printWarningSnackbar('수정을 위해서는 하위항목을 지정해주세요.')

        return
      }

      try {
        const response = await auth
          .put<{
            data: MachinePicUpdateResponseDtoType
          }>(
            `/api/machine-projects/${machineProjectId}/machine-inspections/${machineInspectionId}/machine-pics/${selectedPicId}`,
            data
          )
          .then(v => v.data.data)

        setPictures(prev =>
          prev.map(v =>
            v.machinePicId === selectedPicId ? { ...v, ...response, machineChecklistItemId: machineChecklistItemId } : v
          )
        )
        reset({ ...response })
        console.log('updated picture:', response)
        printSuccessSnackbar(`사진정보가 수정되었습니다.`)
      } catch (e) {
        printErrorSnackbar(e)
      }
    },
    [machineProjectId, selectedPicId, machineInspectionId, reset, watchedSubItemId, machineChecklistItemId]
  )

  function TinyImgCard({ pic }: { pic: MachinePicPresignedUrlResponseDtoType }) {
    const imageRef = useRef<HTMLElement>(null)

    useEffect(() => {
      if (selectedPicId === pic.machinePicId) {
        imageRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center' })
      }
    })

    return (
      <Box
        ref={imageRef}
        onClick={() => {
          setSelectedPicId(pic.machinePicId)
        }}
        sx={{
          height: '10dvh',
          width: '20dvh',
          border: selectedPicId === pic.machinePicId ? '4px solid #3477FE' : '1px solid lightgray',
          p: 1,
          flexShrink: 0
        }}
      >
        {pic && (
          <img
            src={pic.presignedUrl}
            alt={pic.alternativeSubTitle}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
      </Box>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
        {/* 헤더 */}
        <MobileHeader
          left={
            <Button type='button' sx={{ p: 0, display: 'flex', gap: 2, minWidth: 0 }} onClick={() => router.back()}>
              <IconChevronLeft color='white' size={30} />
              {!isMobile && <Typography color='white'>{currentInspectioin?.machineInspectionName}</Typography>}
            </Button>
          }
          right={
            <Box sx={{ display: 'flex', gap: isMobile ? 2 : 4 }}>
              <IconButton type='submit' sx={{ p: 0 }} disabled={!isDirty || !watchedSubItemId}>
                <i
                  ref={saveButtonRef}
                  className={`tabler-device-floppy text-white text-3xl ${isDirty ? 'animate-ring' : ''}`}
                />
              </IconButton>
              <IconButton type='button' sx={{ p: 0 }} onClick={() => setOpenAlert(true)}>
                <i className='tabler-file-x-filled text-red-400 text-3xl' />
              </IconButton>
            </Box>
          }
          title={`사진(${pictures.length})`}
        />
        {/* 본 컨텐츠 (스크롤 가능 영역)*/}
        {checklistList ? (
          <Box
            ref={scrollableAreaRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              py: !isMobile ? 10 : 4,
              px: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 5
            }}
          >
            <div className='flex flex-col'>
              <Typography variant='h5' sx={{ paddingInlineStart: 2 }}>
                # {currentInspectioin?.machineInspectionName}
              </Typography>
              <Box
                sx={{
                  minHeight: isMobile ? '35dvh' : '48dvh',
                  height: isMobile ? '35dvh' : '48dvh',
                  border: '1px solid lightgray',
                  borderRadius: 2,
                  p: 2,
                  position: 'relative',
                  background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3))'
                }}
              >
                <Fab
                  size='small'
                  type='button'
                  sx={{ position: 'absolute', right: 14, top: 14, backgroundColor: '#ffffff9f' }}
                >
                  <IconCamera color='white' size={30} onClick={() => imageInputRef.current?.click()} />
                </Fab>
                <input
                  type='file'
                  hidden
                  ref={imageInputRef}
                  accept='image/*' // 이미지 파일만 허용
                  capture='environment'
                  onChange={handleImageChange}
                />
                <img
                  src={selectedPic?.presignedUrl}
                  alt={getValues().alternativeSubTitle}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>
            </div>
            <div className='flex flex-col gap-1'>
              <InputLabel sx={{ px: 2 }}>파일 이름</InputLabel>
              <TextField
                size={isMobile ? 'small' : 'medium'}
                fullWidth
                {...register('originalFileName')}
                hiddenLabel
                multiline
                slotProps={{ input: { sx: { fontSize: 18 } } }}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <InputLabel required sx={{ px: 2 }}>
                점검항목
              </InputLabel>
              <TextField
                slotProps={{ input: { sx: { fontSize: 18 } } }}
                value={machineChecklistItemId}
                onChange={e => setMachineChecklistItemId(Number(e.target.value))}
                fullWidth
                size={isMobile ? 'small' : 'medium'}
                select
              >
                {checklistList
                  .filter(p => p.checklistSubItems.length !== 0)
                  .map(v => (
                    <MenuItem key={v.machineChecklistItemId} value={v.machineChecklistItemId}>
                      {v.machineChecklistItemName}
                    </MenuItem>
                  ))}
              </TextField>
            </div>
            {machineChecklistItemId && !!subItems.length && (
              <div className='flex flex-col gap-1'>
                <InputLabel required sx={{ px: 2 }}>
                  하위항목
                </InputLabel>
                <Controller
                  control={control}
                  name={'machineChecklistSubItemId'}
                  render={({ field: { ref, onChange, value } }) => (
                    <TextField
                      ref={ref}
                      onChange={e => onChange(Number(e.target.value))}
                      value={value}
                      fullWidth
                      select
                      size={isMobile ? 'small' : 'medium'}
                      slotProps={{
                        input: { sx: { fontSize: 18 } },
                        select: {
                          displayEmpty: true,
                          renderValue: value => {
                            if (!value || value === '') {
                              return (
                                <Typography variant='inherit' color='error'>
                                  하위 항목은 필수 입력입니다
                                </Typography>
                              )
                            }

                            return (
                              <Typography variant='inherit'>
                                {subItems.find(v => v.machineChecklistSubItemId === value)?.checklistSubItemName}
                              </Typography>
                            )
                          }
                        }
                      }}
                    >
                      {subItems.map(v => (
                        <MenuItem key={v.machineChecklistSubItemId} value={v.machineChecklistSubItemId}>
                          {v.checklistSubItemName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </div>
            )}

            <div className='flex flex-col gap-1'>
              <InputLabel sx={{ px: 2 }}>대체타이틀</InputLabel>
              <TextField
                size={isMobile ? 'small' : 'medium'}
                fullWidth
                {...register('alternativeSubTitle')}
                hiddenLabel
                multiline
                slotProps={{ input: { sx: { fontSize: 18 } } }}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <InputLabel sx={{ px: 2 }}>측정값</InputLabel>
              <TextField
                size={isMobile ? 'small' : 'medium'}
                fullWidth
                {...register('measuredValue')}
                hiddenLabel
                multiline
                slotProps={{ input: { sx: { fontSize: 18 } } }}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <InputLabel sx={{ px: 2 }}>비고</InputLabel>
              <TextField
                minRows={3}
                size={isMobile ? 'small' : 'medium'}
                fullWidth
                {...register('remark')}
                hiddenLabel
                multiline
                slotProps={{ input: { sx: { fontSize: 18 } } }}
              />
            </div>
          </Box>
        ) : (
          <div className='w-full h-full grid place-items-center'>
            <CircularProgress />
          </div>
        )}
        {/* 탭 리스트 */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            gap: 2,
            overflowX: 'scroll',
            width: '100dvw'
          }}
        >
          {pictures.map(pic => (
            <TinyImgCard key={pic.machinePicId} pic={pic} />
          ))}
        </Box>
        <Dialog open={openAlert}>
          <DialogTitle variant='h3'>
            사진을 삭제하시겠습니까?
            <DialogContentText>삭제 후에는 되돌릴 수 없습니다.</DialogContentText>
          </DialogTitle>
          <DialogActions>
            <Button
              variant='contained'
              className='bg-color-warning hover:bg-color-warning-light'
              onClick={handleDeletePicture}
              type='submit'
            >
              삭제
            </Button>
            <Button variant='contained' color='secondary' type='reset' onClick={() => setOpenAlert(false)}>
              취소
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </form>
  )
}
