'use client'

import { useEffect, useState } from 'react'

import axios from 'axios'
import { Grid, MenuItem, Button } from '@mui/material'

import { toast } from 'react-toastify'

import CustomTextField from '@/@core/components/mui/TextField'
import DefaultModal from '@/app/_components/modal/DefaultModal'
import type { MachineCategoryResponseDtoType, MachineInspectionCreateRequestDtoType } from '@/app/_type/types'
import { handleApiError } from '@/utils/errorHandler'
import { UseListsContext } from '../page'

type AddInspectionModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  machineProjectId: string
  getFilteredInspectionList: () => void
}

const AddInspectionModal = ({
  getFilteredInspectionList,
  open,
  setOpen,
  machineProjectId
}: AddInspectionModalProps) => {
  const categoryList = UseListsContext().categoryList

  const [newData, setNewData] = useState<MachineInspectionCreateRequestDtoType>({
    machineCategoryId: 0,
    purpose: '',
    location: '',
    cnt: 1
  })

  const [parentCategory, setParentCategory] = useState<MachineCategoryResponseDtoType>()
  const [showSubCategory, setShowSubCategory] = useState(false)

  useEffect(() => {
    // 해당 분류의 자식이 없다면 newData의 categoryId로
    if (parentCategory?.id) {
      if (categoryList.every(v => v.parentId !== parentCategory.id)) {
        setShowSubCategory(false)
        setNewData(prev => ({ ...prev, machineCategoryId: parentCategory.id }))
      } else {
        setShowSubCategory(true)
      }
    }
  }, [parentCategory, categoryList])

  const handleSubmit = async () => {
    if (!newData.machineCategoryId) {
      toast.error('종류를 선택해주세요.')

      return
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections`,
        { inspections: [newData] }
      )

      setOpen(false)
      getFilteredInspectionList()
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <DefaultModal
      size='xs'
      open={open}
      setOpen={setOpen}
      title='설비 추가'
      primaryButton={
        <Button variant='contained' onClick={handleSubmit} sx={{ mr: 1 }}>
          추가
        </Button>
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
            select
            fullWidth
            label='분류'
            value={parentCategory ? JSON.stringify(parentCategory) : ''}
            onChange={e => {
              setParentCategory(JSON.parse(e.target.value))
            }}
          >
            {categoryList
              .filter(v => v.parentId === null)
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
              placeholder='종류를 선택해주세요'
              select
              fullWidth
              label='종류'
              value={newData.machineCategoryId ?? ''}
              onChange={e => setNewData(prev => ({ ...prev, machineCategoryId: Number(e.target.value) }))}
            >
              {categoryList
                .filter(v => v.parentId === parentCategory?.id)
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
            label='용도'
            value={newData.purpose}
            onChange={e => setNewData(prev => ({ ...prev, purpose: e.target.value }))}
            placeholder='용도를 입력하세요'
          />
        </Grid>

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
            type='number'
            fullWidth
            label='수량'
            value={newData.cnt}
            onChange={e => setNewData(prev => ({ ...prev, cnt: Number(e.target.value) }))}
          />
        </Grid>
      </Grid>
    </DefaultModal>
  )
}

export default AddInspectionModal
