'use client'

import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'

import Image from 'next/image'

import { Box, IconButton, TextField, Typography } from '@mui/material'

import MobileHeader from '@/app/(mobile)/_components/MobileHeader'
import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import DeleteModal from '@/@core/components/custom/DeleteModal'
import { auth } from '@/lib/auth'
import type { MachinePicCursorType, MachinePicPresignedUrlResponseDtoType } from '@/@core/types'

const max_pic = 100

export default function PicturePage() {
  const { id: machineProjectId, machineInspectionId } = useParams()

  const router = useRouter()
  const searchParams = useSearchParams()
  const picId = searchParams.get('picId')

  const isMobile = useContext(isMobileContext)

  const saveButtonRef = useRef<HTMLElement>(null)
  const scrollableAreaRef = useRef<HTMLElement>(null)

  const inspectionName = 'default'
  const [pictures, setPictures] = useState<MachinePicPresignedUrlResponseDtoType[]>([])
  const [selectedPicId, setSelectedPicId] = useState(Number(picId))
  const selectedPic = pictures.find(v => v.machinePicId === selectedPicId)

  const [openAlert, setOpenAlert] = useState(false)

  async function handleDeletePicture() {
    return
  }

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* 헤더 */}
      <MobileHeader
        left={
          <IconButton sx={{ p: 0 }} onClick={() => router.back()}>
            <i className='tabler-chevron-left text-white text-3xl' />
          </IconButton>
        }
        right={
          <Box sx={{ display: 'flex', gap: isMobile ? 2 : 4 }}>
            <IconButton sx={{ p: 0 }}>
              <i ref={saveButtonRef} className=' tabler-device-floppy text-white text-3xl' />
            </IconButton>
            <IconButton sx={{ p: 0 }} onClick={() => setOpenAlert(true)}>
              <i className='tabler-trash-filled text-red-400 text-3xl' />
            </IconButton>
          </Box>
        }
        title={inspectionName + picId}
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
          <IconButton size='large' sx={{ position: 'absolute', right: 0, top: 0 }}>
            <i className='tabler-camera' />
          </IconButton>
          {selectedPic ? (
            <img
              src={selectedPic.presignedUrl}
              alt={selectedPic.alternativeSubTitle}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Typography>이미지 오류!</Typography>
          )}
        </Box>
        <TextField fullWidth />
        <TextField fullWidth />
        <TextField fullWidth />
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
  )
}
