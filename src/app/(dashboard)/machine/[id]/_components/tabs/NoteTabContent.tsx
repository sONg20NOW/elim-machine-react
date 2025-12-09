import { useContext, useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { Button, Grid2, Typography } from '@mui/material'

import { useForm } from 'react-hook-form'

import { useGetMachineProject, useMutateMachineProjectNote } from '@core/hooks/customTanstackQueries'
import TextInputBox from '@/@core/components/elim-inputbox/TextInputBox'
import AlertModal from '@/@core/components/elim-modal/AlertModal'
import isEditingContext from '../../isEditingContext'

const MAX_LENGTH = 500

const NoteTabContent = ({}) => {
  const params = useParams()
  const machineProjectId = params?.id as string

  const { data: projectData } = useGetMachineProject(machineProjectId)
  const { mutateAsync: mutateNoteAsync, isPending } = useMutateMachineProjectNote(machineProjectId)

  const { setIsEditing } = useContext(isEditingContext)!

  const [openAlert, setOpenAlert] = useState(false)

  const form = useForm<{ note: string }>({
    defaultValues: {
      note: projectData?.note ?? ''
    }
  })

  const isDirty = form.formState.isDirty
  const watchedNote = form.watch('note')

  useEffect(() => {
    setIsEditing(isDirty)
  }, [isDirty, setIsEditing])

  const handleSave = form.handleSubmit(async data => {
    if (!projectData?.version) {
      console.log('A타입 에러 발생')

      return
    }

    if (isDirty) {
      const newNote = await mutateNoteAsync({ ...data, version: projectData.version })

      form.reset(newNote)
    }
  })

  const handleDontSave = () => {
    form.reset()
    setOpenAlert(false)
  }

  return (
    projectData && (
      <div className='grid gap-4 max-w-[890px]'>
        <Grid2 container columns={1}>
          <TextInputBox multiline={10} form={form} name='note' labelMap={{ note: { label: '' } }} />
        </Grid2>
        <div className='flex justify-between items-start'>
          <div className='flex gap-2 items-end'>
            <Button variant='contained' color='success' disabled={!isDirty || isPending} onClick={handleSave}>
              저장
            </Button>
            <Button color='error' disabled={!isDirty || isPending} onClick={() => setOpenAlert(true)}>
              변경사항 폐기
            </Button>
          </div>
          <Typography>
            {watchedNote.length} / {MAX_LENGTH}
          </Typography>
        </div>
        {openAlert && (
          <AlertModal
            open={openAlert}
            setOpen={setOpenAlert}
            handleConfirm={handleDontSave}
            title='특이사항 변경사항이 사라집니다'
            subtitle='그래도 진행하시겠습니까?'
          />
        )}
      </div>
    )
  )
}

export default NoteTabContent
