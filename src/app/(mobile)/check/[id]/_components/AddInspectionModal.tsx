'use client'

import { useEffect, useState } from 'react'

import { Grid, MenuItem, Button, Typography, IconButton } from '@mui/material'

import { NumberField } from '@base-ui-components/react/number-field'

import CustomTextField from '@/@core/components/mui/TextField'
import DefaultModal from '@/@core/components/custom/DefaultModal'
import type { MachineCategoryResponseDtoType, MachineInspectionCreateRequestDtoType } from '@/@core/types'
import { auth } from '@/@core/utils/auth'
import { useGetCategories } from '@/@core/hooks/customTanstackQueries'
import { printErrorSnackbar, printSuccessSnackbar } from '@/@core/utils/snackbarHandler'

type AddInspectionModalProps = {
  disabled: boolean
  machineProjectId: string
  getFilteredInspectionList: () => void
}

const AddInspectionModal = ({ disabled, getFilteredInspectionList, machineProjectId }: AddInspectionModalProps) => {
  const [newData, setNewData] = useState<MachineInspectionCreateRequestDtoType>({
    machineCategoryId: 0,
    purpose: '',
    location: '',
    cnt: 1
  })

  const { data: categoryList } = useGetCategories()

  const [open, setOpen] = useState(false)

  const [parentCategory, setParentCategory] = useState<MachineCategoryResponseDtoType>()
  const [showSubCategory, setShowSubCategory] = useState(false)

  // const [engineerIds, setEngineerIds] = useState<number[]>([])

  useEffect(() => {
    // 해당 분류의 자식이 없다면 newData의 categoryId로
    if (parentCategory?.id) {
      if (categoryList?.every(v => v.parentId !== parentCategory.id)) {
        setShowSubCategory(false)
        setNewData(prev => ({ ...prev, machineCategoryId: parentCategory.id }))
      } else {
        setShowSubCategory(true)
        setNewData(prev => ({ ...prev, machineCategoryId: 0 }))
      }
    }
  }, [parentCategory, categoryList])

  // 추후에 engineer 추가 가능하도록.
  const handleSubmit = async () => {
    if (!newData.machineCategoryId) {
      printErrorSnackbar('', '종류를 선택해주세요.')

      return
    }

    try {
      await auth.post(`/api/machine-projects/${machineProjectId}/machine-inspections`, { inspections: [newData] })

      setOpen(false)
      printSuccessSnackbar('설비 목록이 추가되었습니다')
      getFilteredInspectionList()
    } catch (error) {
      printErrorSnackbar(error)
    }
  }

  return (
    <>
      <IconButton
        disabled={disabled}
        type='button'
        sx={{ boxShadow: 3, backgroundColor: 'white' }}
        onClick={() => setOpen(true)}
      >
        <i className='tabler-plus' />
      </IconButton>
      <DefaultModal
        size='xs'
        open={open}
        setOpen={setOpen}
        title='설비 추가'
        primaryButton={
          <div className='flex gap-3 items-center'>
            <NumberField.Root
              value={newData.cnt}
              onValueChange={value => setNewData(prev => ({ ...prev, cnt: value ?? 0 }))}
              defaultValue={1}
              min={1}
              max={100}
            >
              {/* <NumberField.ScrubArea className='cursor-ew-resize'>
                        <label className='cursor-ew-resize text-sm font-light text-gray-900'>수량</label>
                        <NumberField.ScrubAreaCursor className='drop-shadow-[0_1px_1px_#0008] filter'>
                          <i className='tabler-plus' />
                        </NumberField.ScrubAreaCursor>
                      </NumberField.ScrubArea> */}

              <NumberField.Group className='flex border rounded-lg'>
                <NumberField.Decrement className='flex h-10 items-center justify-center rounded-tl-md rounded-bl-md border border-gray-200 bg-gray-50 bg-clip-padding text-gray-900 select-none hover:bg-gray-100 active:bg-gray-100'>
                  <i className='tabler-chevron-left' />
                </NumberField.Decrement>
                <div className='flex items-center gap-1'>
                  <NumberField.Input className='h-8 w-8 border-gray-200 text-center text-base text-gray-900 tabular-nums focus:z-1 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800' />
                  <Typography variant='h6' sx={{ paddingInlineEnd: 2 }}>
                    개
                  </Typography>
                </div>
                <NumberField.Increment className='flex h-10 items-center justify-center rounded-tr-md rounded-br-md border border-gray-200 bg-gray-50 bg-clip-padding text-gray-900 select-none hover:bg-gray-100 active:bg-gray-100'>
                  <i className='tabler-chevron-right' />
                </NumberField.Increment>
              </NumberField.Group>
            </NumberField.Root>
            <Button variant='contained' onClick={handleSubmit} sx={{ mr: 1 }} disabled={!newData.machineCategoryId}>
              추가
            </Button>
          </div>
        }
        secondaryButton={
          <Button variant='outlined' color='secondary' onClick={() => setOpen(false)}>
            닫기
          </Button>
        }
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <CustomTextField
              required
              select
              fullWidth
              label='분류'
              value={parentCategory ? JSON.stringify(parentCategory) : ''}
              onChange={e => {
                setParentCategory(JSON.parse(e.target.value))
              }}
            >
              {categoryList
                ?.filter(v => v.parentId === null)
                .map(parentCategory => (
                  <MenuItem key={parentCategory.id} value={JSON.stringify(parentCategory)}>
                    {parentCategory.name}
                  </MenuItem>
                ))}
            </CustomTextField>
          </Grid>

          {showSubCategory && (
            <Grid item xs={12}>
              <CustomTextField
                required
                placeholder='종류를 선택해주세요'
                select
                fullWidth
                label='종류'
                value={newData.machineCategoryId ?? ''}
                onChange={e => setNewData(prev => ({ ...prev, machineCategoryId: Number(e.target.value) }))}
              >
                {categoryList
                  ?.filter(v => v.parentId === parentCategory?.id)
                  .map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
              </CustomTextField>
            </Grid>
          )}
          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              label='위치'
              value={newData.location}
              onChange={e => setNewData(prev => ({ ...prev, location: e.target.value }))}
              placeholder='위치를 입력하세요'
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              label='용도'
              value={newData.purpose}
              onChange={e => setNewData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder='용도를 입력하세요'
            />
          </Grid>

          {/* {engineerIds.map((id, idx) => (
            <Grid key={idx} item xs={12}>
              <small>{`점검진${idx + 1}`}</small>
              <Typography
                sx={{ position: 'relative', border: '1px solid', borderRadius: 1, p: 2, borderColor: 'lightgray' }}
              >
                {participatedEngineerList.find(v => v.engineerId === id)?.engineerName ?? '오류'}
                <IconButton
                  sx={{ position: 'absolute', right: 0, top: '50%', translate: '0 -50%' }}
                  onClick={() => setEngineerIds(prev => prev.filter(v => v !== id))}
                >
                  <i className='tabler-x text-error text-base' />
                </IconButton>
              </Typography>
            </Grid>
          ))}
          <Grid item xs={12}>
            <CustomTextField
              select
              fullWidth
              label={`점검진${engineerIds.length + 1}`}
              value={''}
              onChange={e => setEngineerIds(prev => [...prev, Number(e.target.value)])}
            >
              {participatedEngineerList
                .filter(v => !engineerIds.includes(v.engineerId))
                .map(v => (
                  <MenuItem value={v.engineerId} key={v.engineerId}>
                    {v.engineerName}
                  </MenuItem>
                ))}
            </CustomTextField>
          </Grid> */}
        </Grid>
      </DefaultModal>
    </>
  )
}

export default AddInspectionModal
