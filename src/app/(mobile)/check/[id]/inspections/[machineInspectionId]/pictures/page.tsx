'use client'

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import { Box, IconButton, InputLabel, MenuItem, TextField, Typography } from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import { toast } from 'react-toastify'

import MobileHeader from '@/app/(mobile)/_components/MobileHeader'
import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import DeleteModal from '@/@core/components/custom/DeleteModal'
import { auth } from '@/lib/auth'
import type {
  machineChecklistItemsWithPicCountResponseDtosType,
  MachinePicCursorType,
  MachinePicPresignedUrlResponseDtoType,
  MachinePicUpdateResponseDtoType
} from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

const max_pic = 100

interface formType {
  presignedUrl: string
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

  const inspectionName = 'default'
  const [pictures, setPictures] = useState<MachinePicPresignedUrlResponseDtoType[]>([])
  const [selectedPicId, setSelectedPicId] = useState(Number(initialPicId))
  const selectedPic = pictures.find(v => v.machinePicId === selectedPicId)

  const [openAlert, setOpenAlert] = useState(false)

  const [checkiistList, setCheckiistList] = useState<machineChecklistItemsWithPicCountResponseDtosType[]>([])
  const [machineChecklistItemId, setMachineChecklistItemId] = useState(0)

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
      presignedUrl: '',
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

  const watchedPresignedUrl = watch('presignedUrl')
  const watchedSubItemId = watch('machineChecklistSubItemId')

  const subItems = useMemo(() => {
    return checkiistList.find(v => v.machineChecklistItemId === machineChecklistItemId)?.checklistSubItems ?? []
  }, [checkiistList, machineChecklistItemId])

  useEffect(() => {
    if (!subItems.find(v => v.machineChecklistSubItemId === watchedSubItemId)) {
      setValue('machineChecklistSubItemId', 0)
    }
  }, [subItems, watchedSubItemId, setValue])

  useEffect(() => {
    console.log('select picture:', selectedPic)

    if (selectedPic) {
      reset({
        presignedUrl: selectedPic.presignedUrl,
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
    }
  }, [selectedPic, reset])

  // inspectionId가 바뀔 때마다 점검항목 가져오기
  const getChecklistList = useCallback(async () => {
    const response = await auth.get<{
      data: { machineChecklistItemsWithPicCountResponseDtos: machineChecklistItemsWithPicCountResponseDtosType[] }
    }>(`/api/machine-projects/${machineProjectId}/machine-inspections/${machineInspectionId}`)

    setCheckiistList(response.data.data.machineChecklistItemsWithPicCountResponseDtos)
    console.log('get checklist items succeed: ', response.data.data.machineChecklistItemsWithPicCountResponseDtos)
  }, [machineProjectId, machineInspectionId])

  useEffect(() => {
    getChecklistList()
  }, [getChecklistList])

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
      handleApiError(e)
    }

    return
  }, [machineProjectId, selectedPicId, getValues, pictures, router])

  const handleSave = useCallback(
    async (data: formType) => {
      if (!watchedSubItemId) {
        toast.warning('수정을 위해서는 하위항목을 지정해주세요.')

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
        handleSuccess(`사진정보가 수정되었습니다.`)
      } catch (e) {
        handleApiError(e)
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
            <IconButton type='button' sx={{ p: 0 }} onClick={() => router.back()}>
              <i className='tabler-chevron-left text-white text-3xl' />
            </IconButton>
          }
          right={
            <Box sx={{ display: 'flex', gap: isMobile ? 2 : 4 }}>
              <IconButton type='submit' sx={{ p: 0 }} disabled={!isDirty}>
                <i
                  ref={saveButtonRef}
                  className={`tabler-device-floppy text-white text-3xl ${isDirty ? 'animate-ring' : ''}`}
                />
              </IconButton>
              <IconButton type='button' sx={{ p: 0 }} onClick={() => setOpenAlert(true)}>
                <i className='tabler-trash-filled text-red-400 text-3xl' />
              </IconButton>
            </Box>
          }
          title={inspectionName + initialPicId}
        />
        {/* 본 컨텐츠 (스크롤 가능 영역)*/}
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
          <Box sx={{ height: '40dvh', border: '1px solid lightgray', borderRadius: 2, p: 2, position: 'relative' }}>
            <IconButton type='button' sx={{ position: 'absolute', right: 8, top: 8, color: 'primary.main' }}>
              <i className='tabler-camera text-4xl' onClick={() => imageInputRef.current?.click()} />
            </IconButton>
            <input
              type='file'
              hidden
              ref={imageInputRef}
              accept='image/*' // 이미지 파일만 허용
              capture='environment'
              onChange={e => {
                if (e.target.files) {
                  setValue('presignedUrl', URL.createObjectURL(e.target.files[0]), {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }
              }}
            />

            {watchedPresignedUrl ? (
              <img
                src={watchedPresignedUrl}
                alt={getValues().alternativeSubTitle}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Typography>이미지 오류!</Typography>
            )}
          </Box>
          <div className='flex flex-col gap-1'>
            <InputLabel sx={{ px: 2 }}>점검항목</InputLabel>
            <TextField
              slotProps={{ input: { sx: { fontSize: 18 } } }}
              value={machineChecklistItemId}
              onChange={e => setMachineChecklistItemId(Number(e.target.value))}
              fullWidth
              select
            >
              {checkiistList
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
              <InputLabel sx={{ px: 2 }}>하위항목</InputLabel>
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
                    slotProps={{ input: { sx: { fontSize: 18 } } }}
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
        <DeleteModal showDeleteModal={openAlert} setShowDeleteModal={setOpenAlert} onDelete={handleDeletePicture} />
      </Box>
    </form>
  )
}
