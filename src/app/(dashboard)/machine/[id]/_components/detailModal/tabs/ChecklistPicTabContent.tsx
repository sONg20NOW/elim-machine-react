import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'

import { MenuItem, TextField, Tooltip, Typography } from '@mui/material'

import PictureListModal from '../../pictureUploadModal/PictureListModal'
import type {
  MachineInspectionDetailResponseDtoType,
  MachineChecklistItemsWithPicCountResponseDtosType
} from '@core/types'
import { picCateInspectionStatusOption } from '@/@core/data/options'
import DeficiencyModal from './checklistPicTab/DeficiencyModal'

interface ChecklistPicTabContentProps<T> {
  editData: T
  setEditData: Dispatch<SetStateAction<T>>
  isEditing: boolean
}

export default function ChecklistPicTabContent({
  editData,
  setEditData,
  isEditing
}: ChecklistPicTabContentProps<MachineInspectionDetailResponseDtoType>) {
  // 점검사진 모달
  const [openPicModal, setOpenPicModal] = useState<boolean>(false)
  const [clickedPicCate, setClickedPicCate] = useState<MachineChecklistItemsWithPicCountResponseDtosType>()

  return (
    <>
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
              <tr key={cate.machineProjectChecklistItemId}>
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
                        {index + 1}. {subCate.machineProjectChecklistSubItemName}
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
                      {idx + 1}. {cate.machineProjectChecklistItemName}
                      <Typography component={'span'} color='primary.main'>
                        {cate.totalMachinePicCount ? ` (${cate.totalMachinePicCount})` : ''}
                      </Typography>
                    </Typography>
                  </Tooltip>
                  {cate.machineInspectionChecklistItemResultBasicResponseDto?.inspectionResult === 'FAIL' && (
                    <DeficiencyModal checklistItemId={cate.machineProjectChecklistItemId} editData={editData} />
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
                      )?.label ?? picCateInspectionStatusOption.find(v => v.value === 'NONE')?.label}
                    </span>
                  ) : (
                    <TextField
                      value={
                        editData.machineChecklistItemsWithPicCountResponseDtos.find(
                          v => cate.machineProjectChecklistItemId === v.machineProjectChecklistItemId
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
      </table>
      {openPicModal && clickedPicCate && (
        <PictureListModal
          open={openPicModal}
          setOpen={setOpenPicModal}
          clickedPicCate={clickedPicCate}
          defaultPicInspectionId={editData.machineInspectionResponseDto.id}
        />
      )}
    </>
  )
}
