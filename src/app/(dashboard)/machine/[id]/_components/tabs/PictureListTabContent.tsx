import { useEffect, useState, useCallback, useRef, useContext } from 'react'

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Box, Typography, CircularProgress, ImageList, Button, TextField, MenuItem, Divider } from '@mui/material'

// @ts-ignore
import type { AxiosRequestConfig } from 'axios'

import classNames from 'classnames'

import { toast } from 'react-toastify'

import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import type {
  MachinePicCursorType,
  MachinePicPresignedUrlResponseDtoType,
  MachineProjectPicReadResponseDtoType
} from '@core/types'

import SearchBar from '@/@core/components/elim-inputbox/SearchBar'
import InspectionPicZoomModal from '../pictureZoomModal/InspectionPicZoomModal'
import { useGetInspectionsSimple } from '@core/hooks/customTanstackQueries'
import { auth } from '@core/utils/auth'
import PictureListModal from '../pictureUploadModal/PictureListModal'
import { projectPicOption } from '@/@core/data/options'
import ProjectPicZoomModal from '../pictureZoomModal/ProjectPicZoomModal'
import ProjectPicCard from '../pictureCard/ProjectPicCard'
import InspectionPicCard from '../pictureCard/InspectionPicCard'
import ReloadButton from '../ReloadButton'
import { isTabletContext } from '@/@core/contexts/mediaQueryContext'

const PictureListTabContent = () => {
  const router = useRouter()
  const machineProjectId = useParams().id?.toString() as string
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 반응형을 위한 미디어쿼리
  const isTablet = useContext(isTabletContext)

  // 이름으로 검색 필터 (파일 이름, 카테고리 이름, 체크 아이템, 섭아이템 이름에 포함된 것만 필터링 하기.)
  const keyword = searchParams.get('keyword')
  const inspectionId = Number(searchParams.get('inspectionId'))

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

  // 무한스크롤 관련 Ref들
  const loadingInspectionPicsRef = useRef(false)
  const loadingProjectPicsRef = useRef(false)

  const isLoading = loadingInspectionPicsRef.current || loadingProjectPicsRef.current

  const hasNextRef = useRef(true)
  const nextCursorRef = useRef<MachinePicCursorType | null>(undefined)

  const listContainerRef = useRef<HTMLDivElement>(null)

  // 사진 클릭 기능 구현을 위한 상태
  const [selectedInspectionPicId, setSelectedInspectionPicId] = useState<number>()
  const selectedInspectionPic = inspectionPics.find(v => v.machinePicId === selectedInspectionPicId)

  const [selectedProjectPicId, setSelectedProjectPicId] = useState<number>()
  const selectedProjectPic = projectPics.find(v => v.id === selectedProjectPicId)

  const [openInspecitonPic, setOpenInspecitonPic] = useState(false)
  const [openProjectPic, setOpenProjectPic] = useState(false)

  /**
   * set searchParam 'keyword' for searching keyword
   * @param keyword
   */
  const setKeywordSearchParam = useCallback(
    (keyword: string) => {
      const params = new URLSearchParams(searchParams.toString())

      params.set('keyword', keyword)

      router.push(pathname + '?' + params.toString())
    },
    [searchParams, router, pathname]
  )

  /**
   * set searchParam 'inspectionId' for searching
   * @param keyword
   */
  const setInspectionIDSearchParam = useCallback(
    (inspectionId: string) => {
      const params = new URLSearchParams(searchParams.toString())

      params.set('inspectionId', inspectionId)

      router.push(pathname + '?' + params.toString())
    },
    [searchParams, router, pathname]
  )

  /**
   * get project pictures at once
   * @description no infinite scroll
   */
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
      console.log('get project pics:', response)

      return response
    } catch (err) {
      handleApiError(err)
    } finally {
    }
  }, [machineProjectId])

  /**
   * get inspection pictures based on current cursor information
   * @description current cursor information = hasNextRef, nextCursorRef
   */
  const getInspectionPics = useCallback(
    async (pageSize = defaultPageSize) => {
      if (!hasNextRef.current || loadingInspectionPicsRef.current) return

      loadingInspectionPicsRef.current = true

      const requestBody = {
        ...(nextCursorRef.current ? { cursor: nextCursorRef.current } : {})
      }

      try {
        const response = await auth
          .post<{
            data: {
              content: MachinePicPresignedUrlResponseDtoType[]
              hasNext: boolean
              nextCursor: MachinePicCursorType | null
            }
          }>(`/api/machine-projects/${machineProjectId}/machine-pics?page=0&size=${pageSize}`, requestBody)
          .then(v => v.data.data)

        console.log('get inspection pictures: ')

        // 사진 목록을 가져올 때 이미 같은 id가 inspectionPics에 있다면 새로 가져온 데이터로 교체
        setInspectionPics(prev =>
          prev
            .filter(exist => !response.content.some(newPic => newPic.machinePicId === exist.machinePicId))
            .concat(response.content)
        )
        hasNextRef.current = response.hasNext
        nextCursorRef.current = response.nextCursor

        return response
      } catch (err) {
        handleApiError(err)
      } finally {
        loadingInspectionPicsRef.current = false
      }
    },
    [machineProjectId]
  )

  const handlefilterInspectionPics = useCallback(
    (pictures: MachinePicPresignedUrlResponseDtoType[]) => {
      const picturesFilterdWithKeyword = pictures
        .filter(pic =>
          keyword
            ? pic.machineCategoryName.includes(keyword) ||
              pic.originalFileName.includes(keyword) ||
              pic.machineProjectChecklistItemName.includes(keyword) ||
              pic.machineProjectChecklistSubItemName.includes(keyword)
            : true
        )
        .filter(v => (!inspectionId ? true : v.machineInspectionId === inspectionId))

      return picturesFilterdWithKeyword
    },
    [keyword, inspectionId]
  )

  const handlefilterProjectPics = useCallback(
    (pictures: MachineProjectPicReadResponseDtoType[]) => {
      const picturesFilterdWithKeyword = pictures.filter(
        pic =>
          !inspectionId &&
          (keyword
            ? pic.originalFileName.includes(keyword) ||
              projectPicOption.find(v => v.value === pic.machineProjectPicType)?.label.includes(keyword)
            : true)
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
      setShowCheck(false)
      refetchPictures()
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId, inspectionPicsToDelete, projectPicsToDelete, refetchPictures])

  function handleClickInspectionPicCard(pic: MachinePicPresignedUrlResponseDtoType) {
    // 일괄선택 활성화 시 사진카드 클릭 동작
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

    // 일괄선택 비활성화 시 사진카드 클릭 동작
    else {
      setSelectedInspectionPicId(pic.machinePicId)
      setOpenInspecitonPic(true)
    }
  }

  function handleClickProjectPicCard(pic: MachineProjectPicReadResponseDtoType) {
    // 일괄선택 활성화 시 사진카드 클릭 동작
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

    // 일괄선택 비활성화 시 사진카드 클릭 동작
    else {
      setSelectedProjectPicId(pic.id)
      setOpenProjectPic(true)
    }
  }

  async function MoveInspectionPic(dir: 'next' | 'previous') {
    const currentPictureIdx = inspectionPics.findIndex(v => v.machinePicId === selectedInspectionPicId)

    if (currentPictureIdx === -1) {
      throw new Error('현재 사진을 찾을 수 없음. 관리자에게 문의하세요.')
    }

    switch (dir) {
      case 'next':
        if (currentPictureIdx + 1 < inspectionPics.length) {
          setSelectedInspectionPicId(inspectionPics[currentPictureIdx + 1].machinePicId)

          return
        }

        if (hasNextRef.current) {
          const nextResponse = await getInspectionPics()

          // if (currentPictureIdx + 1 >= pictures.length) {
          //   throw new Error('hasNext가 true지만 다음 페이지 없음')
          // }

          setSelectedInspectionPicId(nextResponse?.content[0].machinePicId)
        } else {
          toast.warning('다음 사진이 없습니다')
        }

        break
      case 'previous':
        // 현장사진 <- 설비사진 으로 넘어가는 경우
        if (currentPictureIdx === 0) {
          if (projectPics.length > 0) {
            setSelectedInspectionPicId(undefined)
            setSelectedProjectPicId(projectPics[projectPics.length - 1].id)
            setOpenProjectPic(true)
          } else toast.warning('첫번째 사진입니다')
        } else {
          setSelectedInspectionPicId(inspectionPics[currentPictureIdx - 1].machinePicId)
        }

        break

      default:
        break
    }
  }

  async function MoveProjectPic(dir: 'next' | 'previous') {
    const currentPictureIdx = projectPics.findIndex(v => v.id === selectedProjectPicId)

    if (currentPictureIdx === -1) {
      throw new Error('현재 사진을 찾을 수 없음. 관리자에게 문의하세요.')
    }

    switch (dir) {
      case 'next':
        if (currentPictureIdx + 1 < projectPics.length) {
          setSelectedProjectPicId(projectPics[currentPictureIdx + 1].id)
        } else {
          // 현장사진 -> 설비사진 으로 넘어가는 경우
          if (inspectionPics.length > 0) {
            setSelectedProjectPicId(undefined)
            setSelectedInspectionPicId(inspectionPics[0].machinePicId)
            setOpenInspecitonPic(true)
          } else {
            toast.warning('다음 사진이 없습니다')
          }
        }

        break
      case 'previous':
        if (currentPictureIdx !== 0) {
          setSelectedProjectPicId(projectPics[currentPictureIdx - 1].id)
        } else {
          toast.warning('첫번째 사진입니다')
        }

        break

      default:
        break
    }
  }

  const handleScrollInside = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const scrollTop = target.scrollTop
    const scrollHeight = target.scrollHeight
    const clientHeight = target.clientHeight

    if (scrollTop + clientHeight >= scrollHeight - 100 && !loadingInspectionPicsRef.current && hasNextRef.current) {
      getInspectionPics(defaultPageSize)
    }
  }

  useEffect(() => {
    getProjectPics()
  }, [getProjectPics])

  useEffect(() => {
    getInspectionPics(defaultPageSize)
  }, [getInspectionPics])

  useEffect(() => {
    //check if current scroll height is shorter than client height. If so, get inspection pictures
    const checkAndLoad = () => {
      const container = listContainerRef.current

      if (!container || !container.checkVisibility()) return

      if (container.scrollHeight <= container.clientHeight && hasNextRef.current && !loadingInspectionPicsRef.current) {
        getInspectionPics(defaultPageSize)
      }
    }

    // 초기 렌더링 직후, 데이터 불러오고 난 직후에도 체크
    checkAndLoad()
  }, [getInspectionPics, inspectionPics])

  // 검색 시 자동으로 fetch 시도.
  useEffect(() => {
    if (hasNextRef.current && !loadingInspectionPicsRef.current) {
      getInspectionPics(defaultPageSize)
    }
  }, [handlefilterInspectionPics, getInspectionPics])

  useEffect(() => {
    if (!open) {
      refetchPictures()
    }
  }, [open, refetchPictures])

  return (
    <div className='h-full flex flex-col gap-5'>
      {/* 상단 필터링, 검색, 선택삭제 등 */}
      <div className='flex justify-between'>
        <div className={classNames('flex gap-3', { 'flex-col': isTablet })}>
          <SearchBar placeholder='검색' setSearchKeyword={setKeywordSearchParam} defaultValue={keyword ?? undefined} />
          {inspectionList && (
            <TextField
              label='설비명으로 검색'
              sx={{ width: { sx: 'full', sm: 250 } }}
              select
              size='small'
              value={inspectionId}
              onChange={e => setInspectionIDSearchParam(e.target.value)}
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
          <ReloadButton handleClick={refetchPictures} tooltipText='사진 새로고침' />
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
                onClick={handleDeletePics}
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
      {/* 사진 리스트 부분 */}
      <div className='flex-1 flex flex-col gap-8 overflow-y-auto' ref={listContainerRef} onScroll={handleScrollInside}>
        {/* 현장사진 리스트 */}
        {handlefilterProjectPics(projectPics) && handlefilterProjectPics(projectPics).length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant='h3'>- 현장사진</Typography>
            <ImageList sx={{ overflow: 'visible' }} cols={isTablet ? 1 : 4} rowHeight={isTablet ? 150 : 250} gap={10}>
              {handlefilterProjectPics(projectPics).map(pic => {
                return (
                  <ProjectPicCard
                    key={`${pic.id}_${pic.version}`}
                    pic={pic}
                    showCheck={showCheck}
                    checked={projectPicsToDelete.find(v => v.id === pic.id) ? true : false}
                    handleClick={handleClickProjectPicCard}
                  />
                )
              })}
            </ImageList>
            {/* 더 이상 데이터가 없을 때 메시지 */}
          </Box>
        )}

        {/* 설비사진 리스트 */}
        {inspectionList &&
          inspectionList.map(insp => {
            const inspectionsPic = inspectionPics.filter(pic => pic.machineInspectionId === insp.id)

            return (
              handlefilterInspectionPics(inspectionsPic)?.length > 0 && (
                <Box key={insp.id} sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Divider variant='middle' />

                  <div className='flex gap-3 items-end'>
                    <Typography variant='h3'>{`-  ${insp.name}`}</Typography>
                    {/* <Typography variant='h6' sx={{ marginBottom: 1 }}>{`[${insp.machineParentCateName}]`}</Typography> */}
                  </div>
                  <ImageList
                    sx={{ overflow: 'visible' }}
                    cols={isTablet ? 1 : 4}
                    rowHeight={isTablet ? 150 : 250}
                    gap={10}
                  >
                    {handlefilterInspectionPics(inspectionsPic).map(pic => {
                      return (
                        <InspectionPicCard
                          key={`${pic.machinePicId}_${pic.version}`}
                          pic={pic}
                          showCheck={showCheck}
                          checked={inspectionPicsToDelete.find(v => v.machinePicId === pic.machinePicId) ? true : false}
                          handleClick={handleClickInspectionPicCard}
                        />
                      )
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
        {/* 로딩 인디케이터 */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </div>

      {selectedInspectionPic && (
        <InspectionPicZoomModal
          open={openInspecitonPic}
          setOpen={setOpenInspecitonPic}
          selectedPic={selectedInspectionPic}
          setPictures={setInspectionPics}
          MovePicture={MoveInspectionPic}
        />
      )}
      {selectedProjectPic && (
        <ProjectPicZoomModal
          open={openProjectPic}
          setOpen={setOpenProjectPic}
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
