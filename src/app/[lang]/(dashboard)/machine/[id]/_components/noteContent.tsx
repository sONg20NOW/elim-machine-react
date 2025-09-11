import { useState } from 'react'

import { Button } from '@mui/material'
import axios from 'axios'

import CustomTextField from '@/@core/components/mui/TextField'

const NoteContent = ({ id, projectData }: any) => {
  const [note, setNote] = useState(projectData?.machineProjectScheduleAndEngineerResponseDto?.note || '')

  const [isSaving, setIsSaving] = useState(false)

  console.log('projectData in NoteContent:', projectData)

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const updatedData = {
        ...projectData.machineProjectScheduleAndEngineerResponseDto,
        note: note
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${id}/schedule`,
        updatedData
      )

      console.log('참고사항 저장 성공:', response.data)
      alert('특이사항이 성공적으로 저장되었습니다.')
    } catch (error) {
      console.error('참고사항 저장 실패:', error)
      alert('특이사항 저장에 실패했습니다.')
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
