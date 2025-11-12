import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { memo, useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { IconButton, MenuItem, TextField, Tooltip, Typography } from '@mui/material'

import PictureListModal from '../../pictureUpdateModal/PictureListModal'
import type {
  MachineInspectionDetailResponseDtoType,
  MachineChecklistItemsWithPicCountResponseDtosType,
  MachineInspectionChecklistItemResultBasicResponseDtoType
} from '@/@core/types'
import DefaultModal from '@/@core/components/custom/DefaultModal'
import { picCateInspectionStatusOption } from '@/app/_constants/options'
import { useGetSingleInspection } from '@/@core/hooks/customTanstackQueries'
import useCurrentInspectionIdStore from '@/@core/utils/useCurrentInspectionIdStore'

interface PicTabContentProps<T> {
  editData: T
  setEditData: Dispatch<SetStateAction<T>>
  isEditing: boolean
}

export default function PicTabContent({
  editData,
  setEditData,
  isEditing
}: PicTabContentProps<MachineInspectionDetailResponseDtoType>) {
  const machineProjectId = useParams().id?.toString() as string
  const currentInspectionId = useCurrentInspectionIdStore(set => set.currentInspectionId)

  const { data: selectedInspection } = useGetSingleInspection(machineProjectId, currentInspectionId.toString())

  // 점검사진 모달
  const [openPicModal, setOpenPicModal] = useState<boolean>(false)
  const [clickedPicCate, setClickedPicCate] = useState<MachineChecklistItemsWithPicCountResponseDtosType>()

  // clickedPicCate가 존재한다면, selectedMachine이 변경될 때마다 clickedPicCate도 최신화.
  useEffect(() => {
    if (clickedPicCate) {
      setClickedPicCate(prev =>
        selectedInspection?.machineChecklistItemsWithPicCountResponseDtos.find(
          v => prev?.machineChecklistItemId === v.machineChecklistItemId
        )
      )
    }
  }, [selectedInspection, clickedPicCate])

  return (
    selectedInspection && (
      <table>
        <thead>
          <tr>
            <th style={{ width: 100 }}></th>
            <th>점검내용</th>
            <th style={{ width: 80 }}>점검결과</th>
          </tr>
        </thead>
        <tbody>
          {(!isEditing ? selectedInspection : editData).machineChecklistItemsWithPicCountResponseDtos.map(
            (cate, idx) => {
              return (
                <tr key={cate.machineChecklistItemId}>
                  {idx === 0 && (
                    <th
                      rowSpan={
                        (!isEditing ? selectedInspection : editData).machineChecklistItemsWithPicCountResponseDtos
                          .length
                      }
                      style={{ verticalAlign: 'top' }}
                    >
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
                      <DeficiencyModal
                        checklistItemId={cate.machineChecklistItemId}
                        editData={editData}
                        setEditData={setEditData}
                        isEditing={isEditing}
                      />
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
                        value={
                          editData.machineChecklistItemsWithPicCountResponseDtos.find(
                            v => cate.machineChecklistItemId === v.machineChecklistItemId
                          )?.machineInspectionChecklistItemResultBasicResponseDto.inspectionResult ?? 'NONE'
                        }
                        size='small'
                        onChange={e => {
                          // picCates는 리스트, 리스트 중 idx번째 객체의 machineChecklistItemInspectionResult.status 값을 변경.
                          setEditData(prev => ({
                            ...prev,
                            machineChecklistItemsWithPicCountResponseDtos:
                              prev.machineChecklistItemsWithPicCountResponseDtos.map((prevCate, i) =>
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
                        slotProps={{
                          select: {
                            sx: {
                              '.MuiSelect-select': {
                                py: '1px', // 여기서 padding 제거
                                px: '0 !important'
                              }
                            },
                            IconComponent: () => null
                          }
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
            }
          )}
        </tbody>
        {openPicModal && clickedPicCate && (
          <PictureListModal open={openPicModal} setOpen={setOpenPicModal} clickedPicCate={clickedPicCate} />
        )}
      </table>
    )
  )
}

interface DeficiencyModalProps<T> {
  editData: T
  setEditData: Dispatch<SetStateAction<T>>
  isEditing: boolean
  checklistItemId: number
}

// 미흡사항 클립보드 클릭 시 나오는 모달
const DeficiencyModal = memo(
  ({
    checklistItemId,
    editData,
    setEditData,
    isEditing
  }: DeficiencyModalProps<MachineInspectionDetailResponseDtoType>) => {
    const machineProjectId = useParams().id?.toString() as string
    const currentInspectionId = useCurrentInspectionIdStore(set => set.currentInspectionId)

    const { data: selectedInspection } = useGetSingleInspection(machineProjectId, currentInspectionId.toString())

    const [open, setOpen] = useState(false)

    const currentChecklist = editData.machineChecklistItemsWithPicCountResponseDtos.find(
      v => v.machineChecklistItemId === checklistItemId
    )

    const currentChecklistResult = currentChecklist?.machineInspectionChecklistItemResultBasicResponseDto

    function handleChange(
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      fieldName: 'actionRequired' | 'deficiencies'
    ) {
      currentChecklistResult &&
        setEditData(prev => {
          const newBasicDto: MachineInspectionChecklistItemResultBasicResponseDtoType = {
            ...currentChecklistResult,
            [fieldName]: e.target.value
          }

          return {
            ...prev,
            machineChecklistItemsWithPicCountResponseDtos: prev.machineChecklistItemsWithPicCountResponseDtos.map(v =>
              v.machineChecklistItemId === currentChecklist?.machineChecklistItemId
                ? { ...v, machineInspectionChecklistItemResultBasicResponseDto: newBasicDto }
                : v
            )
          }
        })
    }

    return (
      selectedInspection && (
        <>
          <IconButton
            className='absolute right-1 top-[50%] -translate-y-1/2'
            size='small'
            onClick={() => {
              setOpen(true)
            }}
          >
            <i className='tabler-clipboard' />
          </IconButton>
          <DefaultModal
            size='sm'
            title={
              <Typography variant='h3' fontWeight={600}>
                {currentChecklist?.machineChecklistItemName ?? '미흡사항'}
              </Typography>
            }
            open={open}
            setOpen={setOpen}
            onClose={() => {
              setOpen(false)
            }}
          >
            {currentChecklistResult ? (
              isEditing ? (
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-1'>
                    <Typography variant='h5'>미흡사항</Typography>
                    <TextField
                      minRows={3}
                      multiline
                      slotProps={{ input: { sx: { padding: 4 } } }}
                      value={currentChecklistResult.deficiencies ?? ''}
                      onChange={e => handleChange(e, 'deficiencies')}
                    />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <Typography variant='h5'>조치필요사항</Typography>
                    <TextField
                      minRows={3}
                      multiline
                      slotProps={{ input: { sx: { padding: 4 } } }}
                      value={currentChecklistResult.actionRequired ?? ''}
                      onChange={e => handleChange(e, 'actionRequired')}
                    />
                  </div>
                </div>
              ) : (
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-1'>
                    <Typography variant='h5'>미흡사항</Typography>
                    <Tooltip
                      arrow
                      placement='right'
                      title={
                        <Typography color='warning.main' sx={{ whiteSpace: 'pre-line' }}>
                          {`수정을 원하시면 먼저\n이 창을 닫고 수정 버튼을 눌러주세요`}
                        </Typography>
                      }
                    >
                      <Typography sx={{ wordBreak: 'break-all', width: 'fit-content', px: 2 }}>
                        {(currentChecklistResult.deficiencies ?? '' !== '') ? currentChecklistResult.deficiencies : '-'}
                      </Typography>
                    </Tooltip>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <Typography variant='h5'>조치필요사항</Typography>
                    <Tooltip
                      arrow
                      placement='right'
                      title={
                        <Typography color='warning.main' sx={{ whiteSpace: 'pre-line' }}>
                          {`수정을 원하시면 먼저\n이 창을 닫고 수정 버튼을 눌러주세요`}
                        </Typography>
                      }
                    >
                      <Typography sx={{ wordBreak: 'break-all', width: 'fit-content', px: 2 }}>
                        {(currentChecklistResult.actionRequired ?? '' !== '')
                          ? currentChecklistResult.actionRequired
                          : '-'}
                      </Typography>
                    </Tooltip>
                  </div>
                </div>
              )
            ) : (
              <Typography>미흡사항 데이터를 불러오는 데 실패했습니다.</Typography>
            )}
          </DefaultModal>
        </>
      )
    )
  }
)
