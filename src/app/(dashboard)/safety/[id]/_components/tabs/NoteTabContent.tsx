import { useContext, useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { Button, Grid2, Typography } from '@mui/material'

import { useForm } from 'react-hook-form'

import { useGetSafetyProject, useMutateSafetyProjectSpecialNote } from '@core/hooks/customTanstackQueries'
import TextInputBox from '@/@core/components/elim-inputbox/TextInputBox'
import AlertModal from '@/@core/components/elim-modal/AlertModal'
import isEditingContext from '../../isEditingContext'
import ResetButton from '@/@core/components/elim-button/ResetButton'

const MAX_LENGTH = 500

const NoteTabContent = ({}) => {
  const params = useParams()
  const safetyProjectId = params?.id as string

  const { data: safetyProjectData } = useGetSafetyProject(safetyProjectId)
  const { mutateAsync: mutateNoteAsync, isPending } = useMutateSafetyProjectSpecialNote(safetyProjectId)

  const { setIsEditing } = useContext(isEditingContext)!

  const [openAlert, setOpenAlert] = useState(false)

  const form = useForm<{ specialNote: string }>({
    defaultValues: {
      specialNote: safetyProjectData?.specialNote ?? ''
    }
  })

  const isDirty = form.formState.isDirty
  const watchedSpecialNote = form.watch('specialNote')

  useEffect(() => {
    setIsEditing(isDirty)
  }, [isDirty, setIsEditing])

  const handleSave = form.handleSubmit(async data => {
    if (typeof safetyProjectData?.version !== 'number') {
      console.log('A타입 에러 발생')

      return
    }

    if (isDirty) {
      const newSpecialNote = await mutateNoteAsync({ ...data, version: safetyProjectData.version })

      form.reset({ specialNote: newSpecialNote.specialNote })
    }
  })

  const handleDontSave = () => {
    form.reset()
    setOpenAlert(false)
  }

  return (
    safetyProjectData && (
      <div className='grid gap-4 max-w-[890px]'>
        <Grid2 container columns={1}>
          <TextInputBox multiline={10} form={form} name='specialNote' labelMap={{ specialNote: { label: '' } }} />
        </Grid2>
        <div className='flex justify-between items-start'>
          <div className='flex gap-2 items-center'>
            <Button variant='contained' color='success' disabled={!isDirty || isPending} onClick={handleSave}>
              저장
            </Button>
            <ResetButton isDirty={isDirty} onClick={() => setOpenAlert(true)} />
          </div>
          <Typography>
            {watchedSpecialNote.length} / {MAX_LENGTH}
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
