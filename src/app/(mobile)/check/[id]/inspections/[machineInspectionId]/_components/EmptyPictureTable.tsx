import type { RefObject } from 'react'
import { useEffect, useState, useCallback, useRef, useContext, memo } from 'react'

import { useParams } from 'next/navigation'

import {
  Box,
  Typography,
  CircularProgress,
  ImageList,
  ImageListItem,
  Paper,
  Fab,
  useScrollTrigger,
  Fade
} from '@mui/material'

import type { MachinePicCursorType, MachinePicPresignedUrlResponseDtoType } from '@core/types'

import { isMobileContext } from '@/components/ProtectedPage'
import { uploadSingleInspectionPic } from '@core/utils/uploadInspectionPictures'
import { useGetChecklistInfo } from '@core/hooks/customTanstackQueries'
import { auth } from '@core/utils/auth'
import { printErrorSnackbar, printSuccessSnackbar } from '@core/utils/snackbarHandler'

const EmptyPictureTable = memo(
  ({
    machineChecklistItemId,
    scrollableAreaRef,
    tabHeight
  }: {
    machineChecklistItemId: number | null
    scrollableAreaRef: RefObject<HTMLElement>
    tabHeight: number
  }) => {
    const { id: machineProjectId, machineInspectionId } = useParams()

    const isMobile = useContext(isMobileContext)

    const { data: checklistList, refetch } = useGetChecklistInfo(
      machineProjectId!.toString(),
      machineInspectionId!.toString()
    )

    const machineChecklistItemIdRef = useRef(machineChecklistItemId)
    const isLoadingRef = useRef(false)

    // 무한스크롤 관련 Ref들
    const hasNextRef = useRef(true)
    const nextCursorRef = useRef<MachinePicCursorType | null>(undefined)

    useEffect(() => {
      machineChecklistItemIdRef.current = machineChecklistItemId
    }, [machineChecklistItemId])

    const defaultPageSize = 4
    const [pictures, setPictures] = useState<MachinePicPresignedUrlResponseDtoType[]>([])

    const [isLoading, setIsLoading] = useState(false) // eslint-disable-line

    const trigger = useScrollTrigger({ target: scrollableAreaRef.current })

    // 현재 커서 정보에 기반해서 사진을 가져오는 함수.
    const getPictures = useCallback(
      async (pageSize: number) => {
        if (!hasNextRef.current || isLoadingRef.current) return

        isLoadingRef.current = true
        setIsLoading(true)

        try {
          const requestBody = {
            ...(nextCursorRef.current ? { cursor: nextCursorRef.current } : {}),
            machineInspectionId: Number(machineInspectionId),
            ...(machineChecklistItemIdRef.current ? { machineChecklistItemId: machineChecklistItemIdRef.current } : {})
          }

          const response = await auth.post<{
            data: {
              content: MachinePicPresignedUrlResponseDtoType[]
              hasNext: boolean
              nextCursor: MachinePicCursorType | null
            }
          }>(`/api/machine-projects/${machineProjectId}/machine-pics?page=0&size=${pageSize}`, requestBody)

          console.log('get pictures: ')
          setPictures(prev => prev.concat(response.data.data.content))
          hasNextRef.current = response.data.data.hasNext
          nextCursorRef.current = response.data.data.nextCursor

          isLoadingRef.current = false
          setIsLoading(false)

          return response.data.data
        } catch (err) {
          printErrorSnackbar(err)

          isLoadingRef.current = false
          setIsLoading(false)
        }
      },
      [machineProjectId, machineInspectionId]
    )

    const resetCursor = async () => {
      hasNextRef.current = true
      nextCursorRef.current = undefined
      setPictures([])
    }

    useEffect(() => {
      resetCursor()
    }, [machineChecklistItemId])

    // 스크롤 이벤트 핸들러
    const handleScroll = useCallback(() => {
      if (!scrollableAreaRef.current) return

      const scrollTop = scrollableAreaRef.current.scrollTop
      const scrollHeight = scrollableAreaRef.current.scrollHeight
      const clientHeight = scrollableAreaRef.current.clientHeight

      // 스크롤이 하단에서 100px 이내에 도달했을 때 다음 페이지 로드
      if (scrollTop + clientHeight >= scrollHeight - 100 && hasNextRef.current && !isLoadingRef.current) {
        console.log('get pic by handleScroll')
        getPictures(defaultPageSize)
      }
    }, [getPictures, scrollableAreaRef])

    useEffect(() => {
      if (!scrollableAreaRef.current) return

      const checkAndLoad = () => {
        if (!scrollableAreaRef.current) return

        const scrollHeight = scrollableAreaRef.current.scrollHeight
        const clientHeight = scrollableAreaRef.current.clientHeight

        // 스크롤이 아예 없거나 화면보다 내용이 적을 때
        if (clientHeight == scrollHeight && hasNextRef.current) {
          console.log('get pic by checkAndLoad')
          getPictures(defaultPageSize)
        }
      }

      // 초기 렌더링 직후, 데이터 불러오고 난 직후에도 체크
      checkAndLoad()

      scrollableAreaRef.current.addEventListener('scroll', handleScroll)

      return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll, getPictures, pictures, scrollableAreaRef])

    const EmptyImageCard = ({
      machineChecklistItemName,
      machineChecklistSubItemName,
      machineChecklistItemId,
      machineChecklistSubItemId
    }: {
      machineChecklistItemName: string
      machineChecklistSubItemName: string
      machineChecklistItemId: number
      machineChecklistSubItemId: number
    }) => {
      const emptyCameraRef = useRef<HTMLInputElement>(null)

      const subitemData = checklistList
        ?.find(v => v.machineChecklistItemId === machineChecklistItemId)
        ?.checklistSubItems.find(v => v.machineChecklistSubItemId === machineChecklistSubItemId)

      const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !machineProjectId || !machineInspectionId) return

        const file = event.target.files[0]

        if (
          await uploadSingleInspectionPic(
            machineProjectId.toString(),
            machineInspectionId.toString(),
            file,
            machineChecklistItemId,
            machineChecklistSubItemId
          )
        ) {
          refetch()
          printSuccessSnackbar('사진 업로드가 완료되었습니다')
        } else {
          printErrorSnackbar('', '사진 업로드에 실패했습니다')
        }
      }

      return (
        <Paper
          sx={{
            position: 'relative',
            cursor: 'pointer',
            borderColor: 'lightgray',
            borderWidth: '1px',
            ':active': { boxShadow: '0px 0px 21px 5px #282828' }
          }}
          variant='outlined'
          key={machineChecklistItemName}
          onClick={() => {
            emptyCameraRef.current?.click()
          }}
        >
          <input
            type='file'
            capture='environment'
            className='hidden absolute right-0 top-1/2 -translate-y-1/2'
            accept='image/*'
            ref={emptyCameraRef}
            onChange={e => {
              handleImageUpload(e)
            }}
          />
          <ImageListItem
            sx={{
              background: '#373737ff',
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              placeItems: 'center',
              display: 'grid'
            }}
          >
            <i className='tabler-camera text-[70px] text-white' />
          </ImageListItem>

          <div className='p-1'>
            <Typography
              fontSize={'medium'}
              fontWeight={600}
              color='primary.dark'
              textAlign={'center'}
            >{`${machineChecklistItemName}`}</Typography>
            <Typography
              fontSize={'medium'}
              color={(subitemData?.machinePicCount ?? 0) > 0 ? 'black' : 'red'}
              textAlign={'center'}
            >{`${machineChecklistSubItemName}`}</Typography>
          </div>
        </Paper>
      )
    }

    return (
      <div className='flex flex-col gap-8'>
        <Fade in={trigger}>
          <Fab
            sx={{
              position: 'fixed',
              right: 10,
              bottom: tabHeight + 10
            }}
            color='primary'
            onClick={() => scrollableAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <i className='tabler-chevron-up' />
          </Fab>
        </Fade>

        {checklistList && (
          <ImageList sx={{ overflow: 'visible' }} cols={isMobile ? 1 : 2} rowHeight={isMobile ? 180 : 240} gap={15}>
            {checklistList
              .filter(v =>
                machineChecklistItemIdRef.current
                  ? v.machineChecklistItemId === machineChecklistItemIdRef.current
                  : true
              )
              .map(v =>
                v.checklistSubItems.map(p => (
                  <EmptyImageCard
                    key={p.machineChecklistSubItemId}
                    machineChecklistItemId={v.machineChecklistItemId}
                    machineChecklistSubItemId={p.machineChecklistSubItemId}
                    machineChecklistItemName={v.machineChecklistItemName}
                    machineChecklistSubItemName={p.checklistSubItemName}
                  />
                ))
              )}
          </ImageList>
        )}

        {isLoadingRef.current && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={50} sx={{ mb: 5 }} />
          </Box>
        )}
      </div>
    )
  }
)

export default EmptyPictureTable
