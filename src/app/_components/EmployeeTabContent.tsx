import { table } from 'console'

import type { Dispatch, SetStateAction } from 'react'

import { DialogContent, Divider } from '@mui/material'
import Grid from '@mui/material/Grid2'

import { EMPLOYEE_DETAIL_TAB_INFO, employeeTab, EmployeeTabField } from '../_schema/EmployeeTabInfo'
import CustomTextField from '@/@core/components/mui/TextField'
import type { EditUserInfoData } from '../_schema/types'

/**
 *
 * @param
 * @param inputFieldContainers
 * 배열 형식,
 * 예시: [['foreignYn', 'juminNum'], ['birthday']]
 * @returns
 * 입력에 알맞는 DidalogContent 컴포넌트 리턴
 */
const GridSizeMap = {
  sm: { xs: 8, sm: 4 },
  md: { xs: 12, sm: 6 },
  lg: { xs: 12 }
}

// TODO: parmas로 넣기
const category = 'privacy'
const dummy = [['foreignYn', 'juminNum'], ['birthday']]
const userData

// TODO:
export function EmployeeTabContent({
  userData,
  setUserData
}: {
  userData: EditUserInfoData
  setUserData: Dispatch<SetStateAction<EditUserInfoData>>
}) {
  const TabInfo = EMPLOYEE_DETAIL_TAB_INFO[category]

  const detailUserData = { privacy: 'memberPrivacyResponseDto', basic: '' }[category]

  function InputField({ tabField, inputField }: { tabField: (typeof TabInfo)[string]; inputField: string }) {
    switch (tabField.type) {
      case 'text':
        break
      case 'date':
        break
      case 'multi':
        break
      case 'number':
        ;<CustomTextField
          fullWidth
          label={tabField.label}
          type='number'
          value={userData?.memberPrivacyResponseDto?.[inputField] ?? ''}
          onChange={e =>
            setUserData({
              ...userData,
              memberPrivacyResponseDto: {
                ...userData?.memberPrivacyResponseDto,
                familyCnt: Number(e.target.value)
              }
            })
          }
        />
        break
      case 'yn':
        break
      default:
        break
    }
  }

  function InputFieldContainer({ tabField, idx }: { tabField: (typeof TabInfo)[string]; idx: number }) {
    return <Grid key={idx} {...GridSizeMap[tabField.size]}></Grid>
  }

  return (
    <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
      {dummy.map((container, idx) => (
        <Grid key={idx} container spacing={5}>
          {container.map((inputField, idx) => {
            const tabField = TabInfo[inputField]

            return <Grid key={idx} {...GridSizeMap[tabField.size]}></Grid>
          })}
        </Grid>
      ))}
    </DialogContent>
  )
}
