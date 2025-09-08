import type { Dispatch, SetStateAction } from 'react'

import { DialogContent } from '@mui/material'
import Grid from '@mui/material/Grid2'

import type { memberDetailDtoType, TabType } from '@/app/_schema/types'
import { MEMBER_DETAIL_TAB_INFO } from '@/app/_schema/MemberTabInfo'
import { InputBox } from '@/components/selectbox/InputBox'

const MemberTabContent = ({
  tabName,
  userData,
  setUserData
}: {
  tabName: TabType['member']
  userData: memberDetailDtoType
  setUserData: Dispatch<SetStateAction<memberDetailDtoType>>
}) => {
  const tabInfos = MEMBER_DETAIL_TAB_INFO[tabName]

  const dtoMap: Record<typeof tabName, keyof memberDetailDtoType> = {
    basic: 'memberBasicResponseDto',
    privacy: 'memberPrivacyResponseDto',
    office: 'memberOfficeResponseDto',
    career: 'memberCareerResponseDto',
    etc: 'memberEtcResponseDto'
  }

  const properties = Object.keys(MEMBER_DETAIL_TAB_INFO[tabName])

  return (
    <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
      <Grid container spacing={3}>
        {properties.map(property => {
          return (
            <InputBox
              key={property}
              tabInfos={tabInfos}
              tabFieldKey={property}
              value={(userData[dtoMap[tabName]] as Record<string, string>)[property] ?? ''}
              onChange={e => {
                setUserData({
                  ...userData,
                  [dtoMap[tabName]]: {
                    ...userData[dtoMap[tabName]],
                    [property]: e.target.value
                  }
                })
              }}
            />
          )
        })}
      </Grid>
    </DialogContent>
  )
}

export default MemberTabContent
