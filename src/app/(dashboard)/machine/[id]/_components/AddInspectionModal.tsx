'use client'

import { useContext, useEffect } from 'react'

import { useParams } from 'next/navigation'

import { Button, Typography, Grid2 } from '@mui/material'

import { toast } from 'react-toastify'

import { NumberField } from '@base-ui-components/react/number-field'

import { Controller, useForm } from 'react-hook-form'

import { IconCaretLeftFilled, IconCaretRightFilled } from '@tabler/icons-react'

import DefaultModal from '@/@core/components/custom/DefaultModal'
import type { MachineInspectionCreateRequestDtoType } from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { useGetCategories } from '@/@core/hooks/customTanstackQueries'
import { auth } from '@/@core/utils/auth'
import MultiInputBox from '@/@core/components/inputbox/MultiInputBox'
import TextInputBox from '@/@core/components/inputbox/TextInputBox'
import { setOffsetContext } from './tabs/InspectionListTabContent'

type AddInspectionModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

const AddInspectionModal = ({ open, setOpen }: AddInspectionModalProps) => {
  const machineProjectId = useParams().id?.toString() as string
  const setOffset = useContext(setOffsetContext)

  const form = useForm<MachineInspectionCreateRequestDtoType & { parentCategoryId: number }>({
    defaultValues: {
      parentCategoryId: 0,
      machineCategoryId: 0,
      purpose: '',
      location: '',
      cnt: 1
    }
  })

  const watchedParentCategoryId = form.watch('parentCategoryId')

  const { data: categoryList } = useGetCategories()

  const rootCategoryList = categoryList?.filter(v => v.parentId === null)
  const childCategoryList = categoryList?.filter(v => v.parentId === watchedParentCategoryId)

  useEffect(() => {
    form.setValue('machineCategoryId', 0)
  }, [watchedParentCategoryId, form])

  const handleSubmit = form.handleSubmit(async data => {
    const finalCategoryId = categoryList?.some(v => v.parentId === data.parentCategoryId)
      ? data.machineCategoryId
      : data.parentCategoryId

    if (!finalCategoryId) {
      toast.error('설비 종류를 선택해주세요.')

      return
    }

    try {
      const response = await auth
        .post<{ data: { machineInspectionIds: number[] } }>(
          `/api/machine-projects/${machineProjectId}/machine-inspections`,
          {
            inspections: [{ ...data, machineCategoryId: finalCategoryId }]
          }
        )
        .then(v => v.data.data.machineInspectionIds)

      setOffset && setOffset(1)
      setOpen(false)
      handleSuccess(`${response.length}개 설비가 추가되었습니다`)
    } catch (error) {
      handleApiError(error)
    }
  })

  return (
    categoryList && (
      <DefaultModal
        size='xs'
        open={open}
        setOpen={setOpen}
        title='설비 추가'
        primaryButton={
          <Controller
            name='cnt'
            control={form.control}
            render={({ field }) => (
              <div className='flex gap-3'>
                <NumberField.Root value={field.value} onValueChange={field.onChange} defaultValue={1} min={1} max={100}>
                  <NumberField.Group className='flex border rounded-lg'>
                    <NumberField.Decrement className='flex h-10 items-center justify-center rounded-tl-md rounded-bl-md border border-gray-200 bg-gray-50 bg-clip-padding text-gray-900 select-none hover:bg-gray-100 active:bg-gray-100'>
                      <IconCaretLeftFilled color='gray' />
                    </NumberField.Decrement>
                    <div className='flex items-center gap-1'>
                      <NumberField.Input className='h-8 w-8 border-gray-200 text-center text-base text-gray-900 tabular-nums focus:z-1 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800' />
                      <Typography variant='h6' sx={{ paddingInlineEnd: 2 }}>
                        개
                      </Typography>
                    </div>
                    <NumberField.Increment className='flex h-10 items-center justify-center rounded-tr-md rounded-br-md border border-gray-200 bg-gray-50 bg-clip-padding text-gray-900 select-none hover:bg-gray-100 active:bg-gray-100'>
                      <IconCaretRightFilled color='gray' />
                    </NumberField.Increment>
                  </NumberField.Group>
                </NumberField.Root>
                <Button variant='contained' onClick={handleSubmit} sx={{ mr: 1 }}>
                  추가
                </Button>
              </div>
            )}
          />
        }
        secondaryButton={
          <Button variant='outlined' color='secondary' onClick={() => setOpen(false)}>
            닫기
          </Button>
        }
      >
        <Grid2 container spacing={2} columns={1}>
          <MultiInputBox
            required
            form={form}
            name='parentCategoryId'
            labelMap={{
              parentCategoryId: {
                label: '분류',
                options: rootCategoryList?.map(v => ({ label: v.name, value: v.id }))
              }
            }}
          />
          {childCategoryList && childCategoryList.length > 0 && (
            <MultiInputBox
              required
              form={form}
              name='machineCategoryId'
              labelMap={{
                machineCategoryId: {
                  label: '종류',
                  options: childCategoryList.map(v => ({ label: v.name, value: v.id }))
                }
              }}
            />
          )}
          <TextInputBox form={form} name='purpose' labelMap={{ purpose: { label: '용도' } }} />
          <TextInputBox form={form} name='location' labelMap={{ location: { label: '위치' } }} />
        </Grid2>
      </DefaultModal>
    )
  )
}

export default AddInspectionModal
