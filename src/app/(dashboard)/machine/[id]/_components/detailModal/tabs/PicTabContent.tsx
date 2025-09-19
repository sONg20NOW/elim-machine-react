import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'

import { Button, IconButton, MenuItem, TextField, Tooltip, Typography } from '@mui/material'

import axios from 'axios'

import PictureModal from '../innerModals/PictureModal'
import type {
  MachineInspectionChecklistItemResultResponseDtoType,
  MachineInspectionDetailResponseDtoType,
  MachinePicCateWithPicCountDtoType
} from '@/app/_type/types'
import AlertModal from '@/app/_components/modal/AlertModal'
import DefaultModal from '@/app/_components/modal/DefaultModal'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { picCateInspectionStatusOption } from '@/app/_constants/options'

interface PicTabContentProps<T> {
  selectedMachineData: T
  editData: T
  setEditData: Dispatch<SetStateAction<T>>
  isEditing: boolean
  machineProjectId: string
  reloadData: () => Promise<void>
}

export default function PicTabContent({
  selectedMachineData,
  editData,
  setEditData,
  isEditing,
  machineProjectId,
  reloadData
}: PicTabContentProps<MachineInspectionDetailResponseDtoType>) {
  const machineInspectionId = selectedMachineData.machineInspectionResponseDto.id

  // 성능점검표 모달
  const [openPicModal, setOpenPicModal] = useState<boolean>(false)
  const [clickedPicCate, setClickedPicCate] = useState<MachinePicCateWithPicCountDtoType>()

  // 미흡사항 모달
  const [showDfModal, setShowDfModal] = useState(false)

  // 선택된 점검항목의 result ID (기본적으로 0 - 아무 동작 X)
  const [selectedDfId, setSelectedDfId] = useState<number>(0)

  // 한 번 이상 방문한 점검항목결과
  const [knownDfs, setKnownDfs] = useState<MachineInspectionChecklistItemResultResponseDtoType[]>([])

  // 한 번 이상 수정된 점검항목결과에서 선택된 점검항목
  const selectedDf = knownDfs.find(df => df.id === selectedDfId)

  useEffect(() => {
    // 미흡사항 버튼이 클릭됐을 때(selectedDfId가 변경될 때) 해당 id에 대한 정보가 없는 경우 GET.
    async function getDf(id: number) {
      if (id > 0 && !knownDfs.find(difficiency => difficiency.id === id)) {
        try {
          const response = await axios.get<{ data: MachineInspectionChecklistItemResultResponseDtoType }>(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${machineInspectionId}/machine-inspection-checklist-item-results/${id}`
          )

          setKnownDfs(prev => prev.concat(response.data.data))
        } catch (error) {
          handleApiError(error)
        }
      }
    }

    getDf(selectedDfId)
  }, [selectedDfId, machineInspectionId, knownDfs, machineProjectId])

  // 변경된 Df들만 저장.
  const handleSaveDf = useCallback(
    async (dfs: MachineInspectionChecklistItemResultResponseDtoType[]) => {
      try {
        const response = await axios.put<{
          data: {
            machineInspectionChecklistItemResultUpdateResponseDtos: MachineInspectionChecklistItemResultResponseDtoType[]
          }
        }>(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${machineInspectionId}/machine-inspection-checklist-item-results`,
          { machineInspectionChecklistItemResultUpdateRequestDtos: dfs }
        )

        const resDfs = response.data.data.machineInspectionChecklistItemResultUpdateResponseDtos

        // knownDfs 최신화
        const newKnownDfs = Array.from(knownDfs)

        resDfs.map(df => {
          const idx = knownDfs.findIndex(knownDf => knownDf.id === df.id)

          newKnownDfs.splice(idx, 1, df)
        })
        setKnownDfs(newKnownDfs)

        // editData 버전 최신화
        const newEditDataResultList = Array.from(editData.machineChecklistItemsWithPicCountDtos)

        resDfs.map(df => {
          const idx = editData.machineChecklistItemsWithPicCountDtos.findIndex(
            checklist => checklist.machineInspectionChecklistItemResultBasicResponseDto.id === df.id
          )

          newEditDataResultList.splice(idx, 1, {
            ...newEditDataResultList[idx],
            machineInspectionChecklistItemResultBasicResponseDto: {
              ...newEditDataResultList[idx].machineInspectionChecklistItemResultBasicResponseDto,
              version: df.version
            }
          })
        })
        setEditData(prev => ({ ...prev, machineChecklistItemsWithPicCountDtos: newEditDataResultList }))

        handleSuccess('미흡사항이 반영되었습니다.')
      } catch (error) {
        handleApiError(error)
      }
    },
    [machineProjectId, machineInspectionId, knownDfs, editData, setEditData]
  )

  function DeficiencyModal() {
    const [isEditingDf, setIsEditingDf] = useState(false)
    const [showDfAlertModal, setShowDfAlertModal] = useState(false)

    const [dfEditData, setDfEditData] = useState<MachineInspectionChecklistItemResultResponseDtoType>(
      JSON.parse(JSON.stringify(selectedDf))
    )

    const existDfChange = JSON.stringify(dfEditData) !== JSON.stringify(selectedDf)

    return (
      <DefaultModal
        size='sm'
        title={
          selectedMachineData?.machineChecklistItemsWithPicCountDtos.find(
            cate => cate.machineInspectionChecklistItemResultBasicResponseDto.id === selectedDfId
          )?.machineChecklistItemName ?? '미흡사항'
        }
        open={showDfModal}
        setOpen={setShowDfModal}
        onClose={() => {
          if (existDfChange) {
            setShowDfAlertModal(true)
          } else {
            setShowDfModal(false)
            setSelectedDfId(0)
          }
        }}
        primaryButton={
          <Button
            variant='contained'
            onClick={() => {
              setIsEditingDf(prev => !prev)

              if (isEditingDf && existDfChange) {
                handleSaveDf([dfEditData])
              }
            }}
          >
            {!isEditingDf ? '수정' : '저장'}
          </Button>
        }
        secondaryButton={
          isEditingDf ? (
            <Button
              variant='contained'
              color='secondary'
              onClick={() => {
                if (existDfChange) {
                  setShowDfAlertModal(true)
                } else {
                  setIsEditingDf(false)
                  setDfEditData(JSON.parse(JSON.stringify(selectedDfId)))
                }
              }}
            >
              취소
            </Button>
          ) : (
            <Button variant='contained' color='secondary' onClick={() => setShowDfModal(false)}>
              닫기
            </Button>
          )
        }
      >
        {selectedDfId && knownDfs.find(d => d.id === selectedDfId) ? (
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <span className='font-bold text-base ps-1'>미흡사항</span>
              {isEditingDf ? (
                <TextField
                  minRows={5}
                  multiline
                  slotProps={{ input: { sx: { padding: 4 } } }}
                  value={dfEditData?.deficiencies ?? ''}
                  onChange={e => setDfEditData(prev => ({ ...prev, deficiencies: e.target.value }))}
                />
              ) : (
                <span className='border solid min-h-40 rounded-lg p-4'>{selectedDf?.deficiencies ?? ''}</span>
              )}
            </div>
            <div className='flex flex-col gap-1'>
              <span className='font-bold text-base ps-1'>조치필요사항</span>
              {isEditingDf ? (
                <TextField
                  minRows={5}
                  multiline
                  slotProps={{ input: { sx: { padding: 4 } } }}
                  value={dfEditData?.actionRequired ?? ''}
                  onChange={e => setDfEditData(prev => ({ ...prev, actionRequired: e.target.value }))}
                />
              ) : (
                <span className='border solid min-h-40 rounded-lg p-4'>{selectedDf?.actionRequired ?? ''}</span>
              )}
            </div>
            {showDfAlertModal && selectedDf && (
              <AlertModal<MachineInspectionChecklistItemResultResponseDtoType>
                showAlertModal={showDfAlertModal}
                setShowAlertModal={setShowDfAlertModal}
                setEditData={setDfEditData}
                setIsEditing={setIsEditingDf}
                originalData={selectedDf}
              />
            )}
          </div>
        ) : (
          <Typography>미흡사항 데이터를 불러오는 데 실패했습니다.</Typography>
        )}
      </DefaultModal>
    )
  }

  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: 100 }}></th>
          <th>점검내용</th>
          <th style={{ width: 80 }}>점검결과</th>
        </tr>
      </thead>
      <tbody>
        {editData.machineChecklistItemsWithPicCountDtos.map((cate, idx) => {
          return (
            <tr key={cate.machineChecklistItemId}>
              {idx === 0 && (
                <th rowSpan={editData.machineChecklistItemsWithPicCountDtos.length} style={{ verticalAlign: 'top' }}>
                  점검항목
                </th>
              )}
              <td className='relative' style={{ verticalAlign: 'top' }}>
                <Tooltip
                  slotProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'white',
                        border: '1px solid black'
                      }
                    }
                  }}
                  arrow
                  placement='right'
                  title={cate.checklistSubItems.map((subCate, index) => (
                    <Typography sx={{ bgcolor: 'white' }} key={index}>
                      {index + 1}. {subCate.checklistSubItemName}
                      <Typography component={'span'} color='primary.main'>
                        {subCate.machinePicCount ? ` (${subCate.machinePicCount})` : ''}
                      </Typography>
                    </Typography>
                  ))}
                >
                  <Typography
                    onClick={() => {
                      setOpenPicModal(true)
                      setClickedPicCate(cate)
                    }}
                    key={idx}
                    sx={{
                      '&:hover': {
                        textDecoration: 'underline'
                      },
                      width: 'fit-content',
                      cursor: 'pointer'
                    }}
                  >
                    {idx + 1}. {cate.machineChecklistItemName}
                    <Typography component={'span'} color='primary.main'>
                      {cate.totalMachinePicCount ? ` (${cate.totalMachinePicCount})` : ''}
                    </Typography>
                  </Typography>
                </Tooltip>
                {cate.machineInspectionChecklistItemResultBasicResponseDto.inspectionResult === 'FAIL' && (
                  <IconButton
                    className='absolute right-1 top-[50%] -translate-y-1/2'
                    size='small'
                    onClick={() => {
                      setSelectedDfId(cate.machineInspectionChecklistItemResultBasicResponseDto.id)
                      setShowDfModal(true)
                    }}
                  >
                    <i className='tabler-clipboard' />
                  </IconButton>
                )}
              </td>
              <td
                style={{
                  textAlign: 'center'
                }}
              >
                {!isEditing ? (
                  <span>
                    {picCateInspectionStatusOption.find(
                      value =>
                        value.value === cate.machineInspectionChecklistItemResultBasicResponseDto.inspectionResult
                    )?.label ?? <i className='tabler-backslash text-lg' />}
                  </span>
                ) : (
                  <TextField
                    fullWidth
                    value={cate.machineInspectionChecklistItemResultBasicResponseDto.inspectionResult ?? 'NONE'}
                    size='small'
                    onChange={e => {
                      // picCates는 리스트, 리스트 중 idx번째 객체의 machineChecklistItemInspectionResult.status 값을 변경.
                      setEditData(prev => ({
                        ...prev,
                        machineChecklistItemsWithPicCountDtos: prev.machineChecklistItemsWithPicCountDtos.map(
                          (prevCate, i) =>
                            i === idx
                              ? {
                                  ...prevCate,
                                  machineInspectionChecklistItemResultBasicResponseDto: {
                                    ...prevCate.machineInspectionChecklistItemResultBasicResponseDto,
                                    inspectionResult: e.target.value
                                  }
                                }
                              : prevCate
                        )
                      }))
                    }}
                    variant='standard'
                    select
                    SelectProps={{
                      sx: {
                        '.MuiSelect-select': {
                          py: '1px', // 여기서 padding 제거
                          px: '0 !important'
                        }
                      },
                      IconComponent: () => null
                    }}
                  >
                    {picCateInspectionStatusOption.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
      {showDfModal && selectedDf && <DeficiencyModal />}
      <PictureModal
        machineProjectId={machineProjectId}
        open={openPicModal}
        setOpen={setOpenPicModal}
        inspectionData={selectedMachineData}
        clickedPicCate={clickedPicCate}
        onPhotoUploadSuccess={reloadData}
      />
    </table>
  )
}
