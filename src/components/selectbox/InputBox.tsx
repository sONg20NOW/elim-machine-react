import { createContext, useContext, useState } from 'react'

import Grid from '@mui/material/Grid2'

import { Box, Button } from '@mui/material'

import { toast } from 'react-toastify'

import CustomTextField from '@/@core/components/mui/TextField'
import MultiSelectBox from './MultiSelectBox'
import YNSelectBox from './YNSelectBox'
import type { BoxSizeType, InputFieldType } from '@/app/_type/types'
import { MemberIdContext } from '@/app/[lang]/(dashboard)/member/_components/UserModal'
import { execDaumPostcode } from '@/app/_handler/daumMapPostcode'

interface InputBoxProps {
  isEditing?: boolean
  tabFieldKey: string
  value: string
  size?: BoxSizeType
  disabled?: boolean
  onChange: (value: string) => void
  tabInfos: Record<string, InputFieldType>
  showLabel?: boolean
}

const InputBoxContext = createContext<InputBoxProps | null>(null)

/**
 * @param size
 * (optional) box의 size, tabField에 정의되어 있는 사이즈보다 우선시됨.
 * @param tabInfos
 * id와 그에 따른 박스 구성에 필요한 정보들 (ex. {name: {size: 'md', type: 'text', label: '이름'}, ...})
 * @param tabFieldKey
 * box 구성 정보를 알아내는 데 필요한 id (ex. companyName, ...)
 * @param value
 * value
 * @param onChange
 * (value: string) => void
 * @see
 * src\app\_schema\MemberTabInfo.tsx 참고
 */
export function InputBox(props: InputBoxProps) {
  const { size, tabFieldKey, tabInfos } = props
  const tabField = tabInfos[tabFieldKey]

  const SizeMap = {
    sm: { xs: 12, sm: 2 },
    md: { xs: 12, sm: 6 },
    lg: { xs: 12 }
  }

  return (
    <InputBoxContext.Provider value={{ ...props, showLabel: props.showLabel ?? true }}>
      <Grid size={SizeMap[size ?? tabField?.size ?? 'md']}>
        <InputBoxContent />
      </Grid>
    </InputBoxContext.Provider>
  )
}

function InputBoxContent() {
  const props = useContext(InputBoxContext)
  const { isEditing, tabInfos, tabFieldKey, value, disabled, onChange, showLabel } = props!
  const tabField = tabInfos[tabFieldKey]

  // labe

  // 주민번호 핸들링
  const [juminNum, setJuminNum] = useState(value)
  const memberId = useContext(MemberIdContext)

  async function getJuminNum() {
    try {
      const juminNumRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members/jumin-num/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: memberId })
      })

      const juminNumResult = await juminNumRes.json()

      setJuminNum(juminNumResult.data.juminNum)
    } catch (error: any) {
      toast.error(error)
    }
  }

  // 수정 중이 아닐 때는 input이 아닌 일반 텍스트 박스가 뜨도록.
  if (isEditing === false) {
    const realValue =
      tabField.type === 'multi'
        ? tabField.options?.find(option => option.value === value)?.label
        : tabField.type === 'yn'
          ? value === 'Y'
            ? '예'
            : '아니오'
          : value

    return (
      <div className='flex flex-col p-0'>
        <span className=' text-[13px] p-0 mb-[1px] w-fit'>{tabField.label}</span>
        <Box className='relative border border-color-border rounded-lg px-[14px] py-[7.25px]'>
          {tabField.type !== 'juminNum' ? (
            <span>{realValue ? realValue : '_'}</span>
          ) : (
            <>
              <span>{realValue ? juminNum : '_'}</span>
              <Button
                onClick={getJuminNum}
                variant='contained'
                size='small'
                className='absolute top-[50%] -translate-y-1/2 right-1 p-1'
              >
                노출
              </Button>
            </>
          )}
        </Box>
      </div>
    )
  }

  switch (tabField?.type) {
    case 'date':
    case 'number':
      return (
        <CustomTextField
          slotProps={{ htmlInput: { name: tabFieldKey } }}
          type={tabField.type}
          id={tabFieldKey}
          disabled={disabled}
          fullWidth
          label={showLabel && tabField.label}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )
    case 'multi':
      return (
        <MultiSelectBox
          name={tabFieldKey}
          tabField={tabField}
          id={tabFieldKey}
          label={showLabel && tabField.label}
          disabled={disabled}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )
    case 'yn':
      return (
        <YNSelectBox
          name={tabFieldKey}
          id={tabFieldKey}
          disabled={disabled}
          label={showLabel && tabField.label}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )
    case 'text':
      return (
        <CustomTextField
          slotProps={{ htmlInput: { name: tabFieldKey } }}
          id={tabFieldKey}
          disabled={disabled}
          fullWidth
          label={showLabel && tabField.label}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )
    case 'long text':
      return (
        <CustomTextField
          multiline
          rows={4}
          slotProps={{ htmlInput: { name: tabFieldKey } }}
          id={tabFieldKey}
          disabled={disabled}
          fullWidth
          label={showLabel && tabField.label}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )
    case 'juminNum':
      return (
        <div className='relative'>
          <CustomTextField
            slotProps={{ htmlInput: { name: tabFieldKey } }}
            id={tabFieldKey}
            disabled={disabled}
            fullWidth
            label={showLabel && tabField.label}
            value={juminNum}
            onChange={e => {
              setJuminNum(e.target.value)
              onChange(e.target.value)
            }}
          />

          <Button onClick={getJuminNum} variant='contained' size='small' className='absolute bottom-[10%] right-1 p-1'>
            노출
          </Button>
        </div>
      )
    case 'map':
      return (
        <div className='relative'>
          <CustomTextField
            slotProps={{ htmlInput: { name: tabFieldKey } }}
            id={tabFieldKey}
            disabled={disabled}
            fullWidth
            label={showLabel && tabField.label}
            value={value}
            onChange={e => onChange(e.target.value)}
          />

          <Button
            onClick={() => {
              execDaumPostcode(tabFieldKey, onChange)
            }}
            variant='contained'
            size='small'
            className='absolute bottom-[10%] right-1 p-1'
          >
            검색
          </Button>
        </div>
      )
    default:
      return null
  }
}
