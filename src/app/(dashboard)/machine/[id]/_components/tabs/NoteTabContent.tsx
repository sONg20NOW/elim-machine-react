import { useState } from 'react'

import { useParams } from 'next/navigation'

import { Button, Typography } from '@mui/material'
import axios from 'axios'

import CustomTextField from '@/@core/components/mui/TextField'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import AlertModal from '@/@core/components/custom/AlertModal'
import useMachineIsEditingStore from '@/@core/utils/useMachineIsEditingStore'
import { useGetMachineProject } from '@/@core/hooks/customTanstackQueries'

const NoteTabContent = ({}) => {
  const params = useParams()
  const machineProjectId = params?.id as string

  const { data: projectData, refetch: refetchProjectData } = useGetMachineProject(machineProjectId)

  const { isEditing, setIsEditing } = useMachineIsEditingStore()
  const [note, setNote] = useState(projectData?.note || '')

  const [showAlertModal, setShowAlertModal] = useState(false)

  const [isSaving, setIsSaving] = useState(false)

  const existChange = note !== projectData?.note

  const maxLength = 500

  // 최대 글자수를 넘기면 입력 불가.

  const handleSave = async () => {
    if (existChange) {
      try {
        setIsSaving(true)

        const updatedData = {
          version: projectData?.version,
          note: note
        }

        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/note`,
          updatedData
        )

        refetchProjectData()
        console.log('참고사항 저장 성공:', response.data)
        handleSuccess('특이사항이 성공적으로 저장되었습니다.')
        setIsEditing(false)
      } catch (error) {
        handleApiError(error)
      } finally {
        setIsSaving(false)
      }
    } else {
      setIsEditing(false)
    }
  }

  return (
    projectData && (
      <div className='relative'>
        {isEditing ? (
          <CustomTextField
            inputProps={{ maxLength: maxLength }}
            fullWidth
            rows={4}
            multiline
            label=''
            placeholder='참고 사항을 입력해 주세요'
            value={note}
            onChange={e => setNote(e.target.value)}
            onFocus={() => setIsEditing(true)}
          />
        ) : (
          <Typography
            sx={{
              whiteSpace: 'pre-line',
              overflowWrap: 'break-word',
              border: 'solid 1px',
              borderColor: 'lightgray',
              borderRadius: 1,
              px: 3.3,
              py: 1.8
            }}
            minHeight={110}
          >
            {note}
          </Typography>
        )}
        <div className='flex gap-2 mt-4'>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              if (isEditing) {
                handleSave()
              } else {
                setIsEditing(true)
              }
            }}
            disabled={isSaving}
          >
            {isEditing ? '저장' : '수정'}
          </Button>
          {isEditing && (
            <Button
              variant='contained'
              color='secondary'
              onClick={() => {
                if (existChange) {
                  setShowAlertModal(true)
                } else {
                  setIsEditing(false)
                }
              }}
            >
              취소
            </Button>
          )}
        </div>
        {showAlertModal && (
          <AlertModal
            setIsEditing={setIsEditing}
            showAlertModal={showAlertModal}
            setShowAlertModal={setShowAlertModal}
            setEditData={setNote}
            originalData={projectData.note ?? ''}
          />
        )}
        <Typography sx={{ position: 'absolute', right: 0, bottom: 0 }}>
          {note.length} / {maxLength}
        </Typography>
      </div>
    )
  )
}

export default NoteTabContent
