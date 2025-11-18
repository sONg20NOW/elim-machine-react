import { useEffect, useState, useCallback, useRef, useContext } from 'react'

import { useParams } from 'next/navigation'

import {
  Box,
  Typography,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Button,
  Checkbox,
  TextField,
  MenuItem,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material'

// @ts-ignore
import type { AxiosRequestConfig } from 'axios'

import classNames from 'classnames'

import { toast } from 'react-toastify'

import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import type {
  MachineInspectionDetailResponseDtoType,
  MachinePicCursorType,
  MachinePicPresignedUrlResponseDtoType,
  MachineProjectPicReadResponseDtoType
} from '@/@core/types'

import SearchBar from '@/@core/components/custom/SearchBar'
import InspectionPicZoomModal from '../pictureZoomModal/InspectionPicZoomModal'
import { useGetInspectionsSimple } from '@/@core/hooks/customTanstackQueries'
import { auth } from '@/lib/auth'
import PictureListModal from '../pictureUpdateModal/PictureListModal'
import { MACHINE_PROJECT_PICTURE_TYPE } from '@/app/_constants/MachineProjectPictureCategory'
import ProjectPicZoomModal from '../pictureZoomModal/ProjectPicZoomModal'
import { isTabletContext } from '@/@core/components/custom/ProtectedPage'

const PictureListTabContent = () => {
  const machineProjectId = useParams().id?.toString() as string

  // 이름으로 검색 필터 (파일 이름, 카테고리 이름, 체크 아이템, 섭아이템 이름에 포함된 것만 필터링 하기.)
  const [keyword, setKeyword] = useState('')

  const [inspectionPics, setInspectionPics] = useState<MachinePicPresignedUrlResponseDtoType[]>([])
  const [projectPics, setProjectPics] = useState<MachineProjectPicReadResponseDtoType[]>([])
  const [open, setOpen] = useState(false)
  const defaultPageSize = 30

  const [inspectionPicsToDelete, setInspectionPicsToDelete] = useState<{ machinePicId: number; version: number }[]>([])
  const [projectPicsToDelete, setProjectPicsToDelete] = useState<{ id: number; version: number }[]>([])
  const [showCheck, setShowCheck] = useState(false)
  const [selectAll, setSelectAll] = useState(true)

  // inspection으로 필터링하기 위한 옵션
  const { data: inspectionList } = useGetInspectionsSimple(machineProjectId)
  const [inspectionId, setInspectionId] = useState(0)

  // ! 추후 세부 필터링 추가
  // const [machineChecklistItemId, setMachineChecklistItemId] = useState(0)
  // const [machineChecklistSubItemId, setMachineChecklistSubItemId] = useState(0)

  // 무한스크롤 관련 Ref들
  const isLoadingRef = useRef(false)
  const hasNextRef = useRef(true)
  const nextCursorRef = useRef<MachinePicCursorType | null>(undefined)

  const reloadIconRef = useRef<HTMLElement>(null)

  // 반응형을 위한 미디어쿼리
  const isTablet = useContext(isTabletContext)

  // 사진 클릭 기능 구현을 위한 상태
  const [selectedInspectionPic, setSelectedInspectionPic] = useState<MachinePicPresignedUrlResponseDtoType>()
  const [showInspecitonPicModal, setShowInspecitonPicModal] = useState(false)

  const [selectedProjectPic, setSelectedProjectPic] = useState<MachineProjectPicReadResponseDtoType>()
  const [showProjectPicModal, setShowProjectPicModal] = useState(false)

  const [selectedInspection, setSelectedInspection] = useState<MachineInspectionDetailResponseDtoType>()

  // 클릭된 사진이 속한 inspection 정보 가져오기. (사진 모달에 검사항목.하위항목을 위해 필요)
  const getInspectionByPic = useCallback(
    async (pic: MachinePicPresignedUrlResponseDtoType) => {
      try {
        const response = await auth.get<{ data: MachineInspectionDetailResponseDtoType }>(
          `/api/machine-projects/${machineProjectId}/machine-inspections/${pic.machineInspectionId}`
        )

        setSelectedInspection(response.data.data)
      } catch (error) {
        handleApiError(error)
      }
    },
    [machineProjectId]
  )

  // 현장사진을 가져오는 함수. (무한 스크롤 X)
  const getProjectPics = useCallback(async () => {
    try {
      const response = await auth
        .get<{
          data: {
            machineProjectPics: MachineProjectPicReadResponseDtoType[]
          }
        }>(`/api/machine-projects/${machineProjectId}/machine-project-pics`)
        .then(v => v.data.data.machineProjectPics)

      setProjectPics(response)

      return response
    } catch (err) {
      handleApiError(err)
    } finally {
    }
  }, [machineProjectId])

  // 현재 커서 정보에 기반해서 사진을 가져오는 함수. (설비 사진)
  const getInspectionPics = useCallback(
    async (pageSize = defaultPageSize) => {
      if (!hasNextRef.current || isLoadingRef.current) return

      isLoadingRef.current = true

      const requestBody = {
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

        console.log('get pictures: ', response.data.data.content)
        setInspectionPics(prev => prev.concat(response.data.data.content))
        hasNextRef.current = response.data.data.hasNext
        nextCursorRef.current = response.data.data.nextCursor

        return response.data.data
      } catch (err) {
        handleApiError(err)
      } finally {
        isLoadingRef.current = false
      }
    },
    [machineProjectId]
  )

  const handlefilterInspectionPics = useCallback(
    (pictures: MachinePicPresignedUrlResponseDtoType[]) => {
      const picturesFilterdWithKeyword = pictures
        .filter(
          pic =>
            pic.machineCategoryName.includes(keyword) ||
            pic.originalFileName.includes(keyword) ||
            pic.machineChecklistItemName.includes(keyword) ||
            pic.machineChecklistSubItemName.includes(keyword)
        )
        .filter(v => (inspectionId === 0 ? true : v.machineInspectionId === inspectionId))

      return picturesFilterdWithKeyword
    },
    [keyword, inspectionId]
  )

  const handlefilterProjectPics = useCallback(
    (pictures: MachineProjectPicReadResponseDtoType[]) => {
      const picturesFilterdWithKeyword = pictures.filter(
        pic => pic.originalFileName.includes(keyword) && inspectionId === 0
      )

      return picturesFilterdWithKeyword
    },
    [keyword, inspectionId]
  )

  const resetCursor = () => {
    hasNextRef.current = true
    nextCursorRef.current = undefined
    setInspectionPics([])
  }

  const refetchPictures = useCallback(async () => {
    resetCursor()
    await getInspectionPics(defaultPageSize)
    await getProjectPics()

    return
  }, [getInspectionPics, getProjectPics])

  const handleDeletePics = useCallback(async () => {
    try {
      // 설비사진 삭제
      await auth.delete(`/api/machine-projects/${machineProjectId}/machine-pics`, {
        data: { machinePicDeleteRequestDtos: inspectionPicsToDelete }
      } as AxiosRequestConfig)

      await auth.delete(`/api/machine-projects/${machineProjectId}/machine-project-pics`, {
        data: { machineProjectPicDeleteRequestDtos: projectPicsToDelete }
      } as AxiosRequestConfig)

      handleSuccess('선택된 사진들이 일괄삭제되었습니다.')

      // 삭제 예정 리스트 리셋
      setInspectionPicsToDelete([])
      setProjectPicsToDelete([])
      refetchPictures()
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId, inspectionPicsToDelete, projectPicsToDelete, refetchPictures])

  async function MoveInspectionPic(dir: 'next' | 'previous') {
    const currentPictureIdx = inspectionPics.findIndex(v => v.machinePicId === selectedInspectionPic?.machinePicId)

    if (currentPictureIdx === -1) {
      throw new Error('현재 사진을 찾을 수 없음. 관리자에게 문의하세요.')
    }

    switch (dir) {
      case 'next':
        if (currentPictureIdx + 1 < inspectionPics.length) {
          setSelectedInspectionPic(inspectionPics[currentPictureIdx + 1])

          return
        }

        if (hasNextRef.current) {
          const nextResponse = await getInspectionPics()

          // if (currentPictureIdx + 1 >= pictures.length) {
          //   throw new Error('hasNext가 true지만 다음 페이지 없음')
          // }

          setSelectedInspectionPic(nextResponse?.content[0])
        } else {
          toast.warning('다음 사진이 없습니다')
        }

        break
      case 'previous':
        if (currentPictureIdx === 0) {
          if (projectPics.length > 0) {
            setSelectedInspection(undefined)
            setSelectedInspectionPic(undefined)
            setSelectedProjectPic(projectPics[projectPics.length - 1])
            setShowProjectPicModal(true)
          } else toast.warning('첫번째 사진입니다')
        } else {
          setSelectedInspectionPic(inspectionPics[currentPictureIdx - 1])
        }

        break

      default:
        break
    }
  }

  async function MoveProjectPic(dir: 'next' | 'previous') {
    const currentPictureIdx = projectPics.findIndex(v => v.id === selectedProjectPic?.id)

    if (currentPictureIdx === -1) {
      throw new Error('현재 사진을 찾을 수 없음. 관리자에게 문의하세요.')
    }

    switch (dir) {
      case 'next':
        if (currentPictureIdx + 1 < projectPics.length) {
          setSelectedProjectPic(projectPics[currentPictureIdx + 1])
        } else {
          if (inspectionPics.length > 0) {
            setSelectedProjectPic(undefined)
            setSelectedInspectionPic(inspectionPics[0])
            getInspectionByPic(inspectionPics[0])
            setShowInspecitonPicModal(true)
          } else {
            toast.warning('다음 사진이 없습니다')
          }
        }

        break
      case 'previous':
        if (currentPictureIdx !== 0) {
          setSelectedProjectPic(projectPics[currentPictureIdx - 1])
        } else {
          toast.warning('첫번째 사진입니다')
        }

        break

      default:
        break
    }
  }

  useEffect(() => {
    getProjectPics()
  }, [getProjectPics])

  useEffect(() => {
    getInspectionPics(defaultPageSize)
  }, [getInspectionPics])

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight

    // 스크롤이 하단에서 100px 이내에 도달했을 때 다음 페이지 로드
    if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoadingRef.current && hasNextRef.current) {
      getInspectionPics(defaultPageSize)
    }
  }, [getInspectionPics])

  useEffect(() => {
    const checkAndLoad = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      // 스크롤이 아예 없거나 화면보다 내용이 적을 때
      if (scrollHeight <= clientHeight && hasNextRef.current && !isLoadingRef.current) {
        getInspectionPics(defaultPageSize)
      }
    }

    // 초기 렌더링 직후, 데이터 불러오고 난 직후에도 체크
    checkAndLoad()

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll, getInspectionPics, inspectionPics])

  // 검색 시 자동으로 fetch 시도.
  useEffect(() => {
    if (hasNextRef.current && !isLoadingRef.current) {
      getInspectionPics(defaultPageSize)
    }
  }, [handlefilterInspectionPics, getInspectionPics])

  // useEffect(() => {
  //   if (!showPicModal) {
  //     resetCursor()
  //     getPictures(defaultPageSize)
  //   }
  // }, [showPicModal, getPictures])

  useEffect(() => {
    if (!open) {
      refetchPictures()
    }
  }, [open, refetchPictures])

  function InspectionPicCard({ pic }: { pic: MachinePicPresignedUrlResponseDtoType }) {
    return (
      <div className='flex flex-col items-center'>
        <Paper
          sx={{
            width: '100%',
            position: 'relative',
            cursor: 'pointer',
            borderColor: 'lightgray',
            borderWidth: '1px',
            ':hover': { boxShadow: 10 }
          }}
          variant='outlined'
          onClick={() => {
            // 일괄선택 활성화 시 클릭 동작
            if (showCheck) {
              if (!inspectionPicsToDelete.find(v => v.machinePicId === pic.machinePicId)) {
                setInspectionPicsToDelete(prev => {
                  const newList = prev.map(v => ({ ...v }))

                  return newList.concat({ machinePicId: pic.machinePicId, version: pic.version })
                })
              } else {
                setInspectionPicsToDelete(prev => {
                  const newList = prev.map(v => ({ ...v }))

                  return newList.filter(v => v.machinePicId !== pic.machinePicId)
                })
              }
            }

            // 일괄선택 비활성화 시 클릭 동작
            else {
              getInspectionByPic(pic)
              setSelectedInspectionPic(pic)
              setShowInspecitonPicModal(true)
            }
          }}
        >
          <ImageListItem>
            <img
              src={pic.presignedUrl}
              alt={pic.originalFileName}
              style={{
                width: '100%',
                height: '50%',
                objectFit: 'cover',
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5
              }}
            />
            <ImageListItemBar sx={{ textAlign: 'center' }} title={pic.originalFileName} />
          </ImageListItem>

          {showCheck && (
            <Checkbox
              color='error'
              sx={{
                position: 'absolute',
                left: 0,
                top: 0
              }}
              checked={inspectionPicsToDelete.find(v => v.machinePicId === pic.machinePicId) ? true : false}
            />
          )}
        </Paper>
        <div className='flex flex-col items-center py-1'>
          <Typography className='text-green-600'>{pic.machineChecklistItemName}</Typography>
          <Typography
            className='text-gray-700'
            style={pic.alternativeSubTitle ? { textDecoration: 'line-through', opacity: '60%' } : {}}
          >
            {pic.machineChecklistSubItemName}
          </Typography>
          <Typography className='text-blue-500'>{pic.alternativeSubTitle}</Typography>
          <Typography className='text-red-500'>{pic.measuredValue}</Typography>
        </div>
      </div>
    )
  }

  function ProjectPicCard({ pic }: { pic: MachineProjectPicReadResponseDtoType }) {
    return (
      <div className='flex flex-col items-center'>
        <Paper
          sx={{
            width: '100%',
            position: 'relative',
            cursor: 'pointer',
            borderColor: 'lightgray',
            borderWidth: '1px',
            ':hover': { boxShadow: 10 }
          }}
          variant='outlined'
          key={`${pic.id}`}
          onClick={() => {
            // 일괄선택 활성화 시 클릭 동작
            if (showCheck) {
              if (!projectPicsToDelete.find(v => v.id === pic.id)) {
                setProjectPicsToDelete(prev => {
                  const newList = prev.map(v => ({ ...v }))

                  return newList.concat({ id: pic.id, version: pic.version })
                })
              } else {
                setProjectPicsToDelete(prev => {
                  const newList = prev.map(v => ({ ...v }))

                  return newList.filter(v => v.id !== pic.id)
                })
              }
            }

            // 일괄선택 비활성화 시 클릭 동작
            else {
              setSelectedProjectPic(pic)
              setShowProjectPicModal(true)
            }
          }}
        >
          <ImageListItem>
            <img
              src={pic.presignedUrl}
              alt={pic.originalFileName}
              style={{
                width: '100%',
                height: '50%',
                objectFit: 'cover',
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5
              }}
            />
            <ImageListItemBar sx={{ textAlign: 'center' }} title={pic.originalFileName} />
          </ImageListItem>

          {showCheck && (
            <Checkbox
              color='error'
              sx={{
                position: 'absolute',
                left: 0,
                top: 0
              }}
              checked={projectPicsToDelete.find(v => v.id === pic.id) ? true : false}
            />
          )}
        </Paper>
        <div className='flex flex-col items-center py-1'>
          <Typography className='text-green-600'>{`${MACHINE_PROJECT_PICTURE_TYPE.find(v => v.value === pic.machineProjectPicType)?.label}`}</Typography>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-5'>
      {/* 상단 필터링, 검색, 선택 삭제 등 */}
      <div className='flex justify-between'>
        <div className={classNames('flex gap-3', { 'flex-col': isTablet })}>
          <SearchBar placeholder='검색' setSearchKeyword={name => setKeyword(name)} />
          {inspectionList && (
            <TextField
              label='설비명으로 검색'
              sx={{ width: { sx: 'full', sm: 250 } }}
              select
              size='small'
              value={inspectionId}
              onChange={e => setInspectionId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem key={0} value={0}>
                전체
              </MenuItem>
              {inspectionList.map(v => (
                <MenuItem key={v.id} value={v.id}>
                  {v.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          <Tooltip arrow title='사진 새로고침'>
            <IconButton
              onClick={() => {
                if (!reloadIconRef.current || reloadIconRef.current.classList.contains('animate-spin')) return

                reloadIconRef.current.classList.add('animate-spin')
                setTimeout(() => {
                  reloadIconRef.current?.classList.remove('animate-spin')
                }, 1000)
                refetchPictures()
                setKeyword('')
                setInspectionId(0)
              }}
            >
              <i ref={reloadIconRef} className='tabler-reload text-lime-600' />
            </IconButton>
          </Tooltip>
          {/* ! 추후구현
           {
            inspectionId !== 0 && filterPics(pictures).length !== 0
            && (
              <TextField
                label='점검항목으로 검색'
                sx={{ width: { sx: 'full', sm: 250 } }}
                select
                size='small'
                value={machineChecklistItemId}
                onChange={e => setMachineChecklistItemId(Number(e.target.value))}
                fullWidth
              >
                <MenuItem key={0} value={0}>
                  전체
                </MenuItem>
                {[].map(v => (
                  <MenuItem key={v.mach} value={v.machineInspectionId}>
                    {v.machineInspectionName}
                  </MenuItem>
                ))}
              </TextField>
            )
          } */}
        </div>
        <div className='flex gap-2 items-start'>
          <Button variant='outlined' type='button' color='success' onClick={() => setOpen(true)}>
            현장사진 추가
          </Button>
          <div className={classNames('flex gap-1', { 'flex-col': isTablet })}>
            {showCheck && [
              <Button
                key={1}
                color='warning'
                onClick={async () => {
                  if (selectAll) {
                    setInspectionPicsToDelete(
                      handlefilterInspectionPics(
                        inspectionPics.concat(await getInspectionPics(1000).then(v => v?.content ?? []))
                      )
                    )
                    setProjectPicsToDelete(handlefilterProjectPics(projectPics))
                  } else {
                    setInspectionPicsToDelete([])
                    setProjectPicsToDelete([])
                  }

                  setSelectAll(prev => !prev)
                }}
              >
                {selectAll ? '전체선택' : '전체해제'}
              </Button>,
              <Button
                key={2}
                color='error'
                onClick={() => handleDeletePics()}
                disabled={projectPicsToDelete.length + inspectionPicsToDelete.length === 0}
              >
                일괄삭제({inspectionPicsToDelete.length + projectPicsToDelete.length})
              </Button>
            ]}
            <Button
              color={showCheck ? 'secondary' : 'primary'}
              variant='contained'
              onClick={() => {
                if (showCheck) {
                  setInspectionPicsToDelete([])
                  setProjectPicsToDelete([])
                }

                setShowCheck(prev => !prev)
                setSelectAll(true)
              }}
            >
              {showCheck ? '취소' : '선택삭제'}
            </Button>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-8'>
        {handlefilterProjectPics(projectPics) && handlefilterProjectPics(projectPics).length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant='h3'>현장사진</Typography>
            <ImageList sx={{ overflow: 'visible' }} cols={isTablet ? 1 : 4} rowHeight={isTablet ? 180 : 300} gap={15}>
              {handlefilterProjectPics(projectPics).map(pic => {
                return <ProjectPicCard key={pic.id} pic={pic} />
              })}
            </ImageList>
            {/* 더 이상 데이터가 없을 때 메시지 */}
          </Box>
        )}

        {inspectionList &&
          inspectionList.map(insp => {
            const inspectionsPic = inspectionPics.filter(pic => pic.machineInspectionId === insp.id)

            return (
              handlefilterInspectionPics(inspectionsPic)?.length > 0 && (
                <Box key={insp.id} sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div className='flex gap-3 items-end'>
                    <Typography variant='h3'>{insp.name}</Typography>
                    {/* <Typography variant='h6' sx={{ marginBottom: 1 }}>{`[${insp.machineParentCateName}]`}</Typography> */}
                  </div>
                  <ImageList
                    sx={{ overflow: 'visible' }}
                    cols={isTablet ? 1 : 4}
                    rowHeight={isTablet ? 180 : 300}
                    gap={15}
                  >
                    {handlefilterInspectionPics(inspectionsPic).map(pic => {
                      return <InspectionPicCard key={pic.machinePicId} pic={pic} />
                    })}
                  </ImageList>
                  {/* 더 이상 데이터가 없을 때 메시지 */}
                </Box>
              )
            )
          })}
        {handlefilterInspectionPics(inspectionPics).length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
            <Typography variant='body1'>사진 데이터가 존재하지 않습니다</Typography>
          </Box>
        )}
      </div>
      {/* 로딩 인디케이터 */}
      {isLoadingRef.current && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {selectedInspectionPic && selectedInspection && (
        <InspectionPicZoomModal
          open={showInspecitonPicModal}
          setOpen={setShowInspecitonPicModal}
          selectedPic={selectedInspectionPic}
          selectedInspection={selectedInspection}
          setPictures={setInspectionPics}
          MovePicture={MoveInspectionPic}
        />
      )}
      {selectedProjectPic && (
        <ProjectPicZoomModal
          open={showProjectPicModal}
          setOpen={setShowProjectPicModal}
          selectedPic={selectedProjectPic}
          setPictures={setProjectPics}
          MovePicture={MoveProjectPic}
        />
      )}
      {open && <PictureListModal open={open} setOpen={setOpen} projectPic />}
    </div>
  )
}

export default PictureListTabContent
