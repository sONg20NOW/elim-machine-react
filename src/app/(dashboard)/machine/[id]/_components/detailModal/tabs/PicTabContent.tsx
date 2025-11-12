import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'

import { IconButton, MenuItem, TextField, Tooltip, Typography } from '@mui/material'

import PictureListModal from '../../pictureUpdateModal/PictureListModal'
import type {
  MachineInspectionDetailResponseDtoType,
  MachineChecklistItemsWithPicCountResponseDtosType
} from '@/@core/types'
import DefaultModal from '@/@core/components/custom/DefaultModal'
import { picCateInspectionStatusOption } from '@/app/_constants/options'

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
  // 점검사진 모달
  const [openPicModal, setOpenPicModal] = useState<boolean>(false)
  const [clickedPicCate, setClickedPicCate] = useState<MachineChecklistItemsWithPicCountResponseDtosType>()

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
        {editData.machineChecklistItemsWithPicCountResponseDtos.map((cate, idx) => {
          return (
            <tr key={cate.machineChecklistItemId}>
              {idx === 0 && (
                <th
                  rowSpan={editData.machineChecklistItemsWithPicCountResponseDtos.length}
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
                  title={cate.checklistSubItems?.map((subCate, index) => (
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
                {cate.machineInspectionChecklistItemResultBasicResponseDto?.inspectionResult === 'FAIL' && (
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
                  textAlign: 'center',
                  padding: 0
                }}
              >
                {!isEditing ? (
                  <span>
                    {picCateInspectionStatusOption.find(
                      value =>
                        value.value === cate.machineInspectionChecklistItemResultBasicResponseDto?.inspectionResult
                    )?.label ?? <i className='tabler-backslash text-lg' />}
                  </span>
                ) : (
                  <TextField
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
                      root: { sx: { width: '80%' } },
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
        })}
      </tbody>
      {openPicModal && clickedPicCate && (
        <PictureListModal open={openPicModal} setOpen={setOpenPicModal} clickedPicCate={clickedPicCate} />
      )}
    </table>
  )
}

interface DeficiencyModalProps<T> {
  editData: T
  setEditData: Dispatch<SetStateAction<T>>
  isEditing: boolean
  checklistItemId: number
}

// 미흡사항 클립보드 클릭 시 나오는 모달
const DeficiencyModal = ({
  checklistItemId,
  editData,
  setEditData,
  isEditing
}: DeficiencyModalProps<MachineInspectionDetailResponseDtoType>) => {
  const [open, setOpen] = useState(false)

  const currentChecklist = editData.machineChecklistItemsWithPicCountResponseDtos.find(
    v => v.machineChecklistItemId === checklistItemId
  )

  const currentChecklistResult = currentChecklist?.machineInspectionChecklistItemResultBasicResponseDto

  const [basicDto, setBasicDto] = useState(currentChecklistResult)

  useEffect(() => {
    setBasicDto(currentChecklistResult)
  }, [currentChecklistResult])

  function handleClose() {
    basicDto &&
      setEditData(prev => ({
        ...prev,
        machineChecklistItemsWithPicCountResponseDtos: prev.machineChecklistItemsWithPicCountResponseDtos.map(v =>
          v.machineChecklistItemId === currentChecklist?.machineChecklistItemId
            ? { ...v, machineInspectionChecklistItemResultBasicResponseDto: basicDto }
            : v
        )
      }))
  }

  return (
    basicDto && (
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
            handleClose()
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
                    value={basicDto.deficiencies ?? ''}
                    onChange={e => setBasicDto(prev => prev && { ...prev, deficiencies: e.target.value })}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <Typography variant='h5'>조치필요사항</Typography>
                  <TextField
                    minRows={3}
                    multiline
                    slotProps={{ input: { sx: { padding: 4 } } }}
                    value={basicDto.actionRequired ?? ''}
                    onChange={e => setBasicDto(prev => prev && { ...prev, actionRequired: e.target.value })}
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
                      {(basicDto.deficiencies ?? '' !== '') ? basicDto.deficiencies : '-'}
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
                      {(basicDto.actionRequired ?? '' !== '') ? basicDto.actionRequired : '-'}
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
