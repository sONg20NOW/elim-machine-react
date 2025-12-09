'use client'

// React Imports
import { useState } from 'react'

import type { MachineChecklistItemsWithPicCountResponseDtosType } from '@core/types'

import InspectionPicListModal from './InspectionPicListModal'
import ProjectPicListModal from './ProjectPicListModal'

type PictureListModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  clickedPicCate?: MachineChecklistItemsWithPicCountResponseDtosType
  projectPic?: boolean
  defaultPicInspectionId?: number
}

const PictureListModal = ({
  open,
  setOpen,
  clickedPicCate,
  projectPic = false,
  defaultPicInspectionId
}: PictureListModalProps) => {
  const [isProjectPic, setIsProjectPic] = useState(projectPic)

  function ToggleProjectPic() {
    setIsProjectPic(prev => !prev)
  }

  return isProjectPic ? (
    <ProjectPicListModal open={open} setOpen={setOpen} ToggleProjectPic={ToggleProjectPic} />
  ) : (
    <InspectionPicListModal
      open={open}
      setOpen={setOpen}
      clickedPicCate={clickedPicCate}
      ToggleProjectPic={ToggleProjectPic}
      defaultPicInspectionId={defaultPicInspectionId}
    />
  )
}

export default PictureListModal
