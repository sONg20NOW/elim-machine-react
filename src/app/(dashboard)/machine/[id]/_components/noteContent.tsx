import { useContext, useEffect, useState } from 'react'

import { Button } from '@mui/material'
import axios from 'axios'

import CustomTextField from '@/@core/components/mui/TextField'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import type { MachineProjectResponseDtoType } from '@/app/_type/types'
import { IsEditingContext } from '../page'

const NoteContent = ({ id, projectData }: { id: string; projectData: MachineProjectResponseDtoType }) => {
  const { isEditing, setIsEditing } = useContext(IsEditingContext)
  const [note, setNote] = useState(projectData?.note || '')

  const [isSaving, setIsSaving] = useState(false)

  // ! 수정사항이 있다면 탭 변경 불가하도록.
  useEffect(() => {
    if (note) {
      setIsEditing(note !== projectData.note)
    }
  }, [note, projectData, setIsEditing])

  console.log('projectData in NoteContent:', projectData)

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const updatedData = {
        version: projectData.version,
        note: note
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${id}/note`,
        updatedData
      )

      console.log('참고사항 저장 성공:', response.data)
      handleSuccess('특이사항이 성공적으로 저장되었습니다.')
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <CustomTextField
        fullWidth
        rows={4}
        multiline
        label=''
        placeholder='참고 사항을 입력해 주세요'
        value={note}
        onChange={e => setNote(e.target.value)}
      />
      <Button variant='contained' color='primary' className='mt-4' onClick={handleSave} disabled={isSaving}>
        {isSaving ? '저장 중...' : '저장'}
      </Button>
    </div>
  )
}

export default NoteContent
