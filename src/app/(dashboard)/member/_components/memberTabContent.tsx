import type { Dispatch, SetStateAction } from 'react'

import { DialogContent, Grid2 } from '@mui/material'

import type { memberDetailDtoType, TabType } from '@/@core/types'
import { MEMBER_INPUT_INFO } from '@/app/_constants/input/MemberInputInfo'
import { InputBox } from '@/@core/components/custom/InputBox'

const MemberTabContent = ({
  isEditing,
  tabName,
  userData,
  setUserData
}: {
  isEditing?: boolean
  tabName: TabType['member']
  userData: memberDetailDtoType
  setUserData: Dispatch<SetStateAction<memberDetailDtoType>>
}) => {
  const tabInfos = MEMBER_INPUT_INFO[tabName]

  const dtoMap: Record<typeof tabName, keyof memberDetailDtoType> = {
    basic: 'memberBasicResponseDto',
    privacy: 'memberPrivacyResponseDto',
    office: 'memberOfficeResponseDto',
    career: 'memberCareerResponseDto',
    etc: 'memberEtcResponseDto'
  }

  const dtoKey: keyof memberDetailDtoType = dtoMap[tabName]
  const properties = Object.keys(MEMBER_INPUT_INFO[tabName])

  const currentSubData = userData[dtoKey] as Record<string, any>

  return (
    <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
      <Grid2 container spacing={3}>
        {properties.map(property => {
          return (
            <InputBox
              isEditing={isEditing}
              key={property}
              tabInfos={tabInfos}
              tabFieldKey={property}
              value={currentSubData[property] ?? ''}
              onChange={(value: string) => {
                setUserData({
                  ...userData,
                  [dtoMap[tabName]]: {
                    ...userData[dtoMap[tabName]],
                    [property]: value
                  }
                })
              }}
            />
          )
        })}
      </Grid2>
    </DialogContent>
  )
}

export default MemberTabContent
