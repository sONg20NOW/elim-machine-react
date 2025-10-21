// map 핸들링
const popupWiddth = 500
const popupHeight = 600

/**
 *
 * @param ElementId
 * 주소가 입력되는 input element의 id
 * @param onChange
 * (optional) string을 인자로 받는 함수 -> 클릭 시 추가 핸들링이 필요한 경우 사용
 *
 */
export function execDaumPostcode(ElementId: string, onChange?: (value: string) => void) {
  // @ts-ignore
  new daum.Postcode({
    width: popupWiddth, //생성자에 크기 값을 명시적으로 지정해야 합니다.
    height: popupHeight,
    theme: {
      searchBgColor: '#7367F0', //검색창 배경색
      queryTextColor: '#FFFFFF' //검색창 글자색
    },

    // @ts-ignore
    oncomplete: function (data) {
      // 주소 정보를 해당 필드에 넣는다.
      ;(document.getElementById(ElementId) as HTMLInputElement).value = data.address

      if (onChange) onChange(data.address)
    }
  }).open({
    left: (2 * window.screen.width) / 3 - popupWiddth / 2,
    top: window.screen.height - popupHeight / 2
  })
}

import type { Dispatch, SetStateAction } from 'react'
import React, { useRef } from 'react'

import DefaultModal from '../../@core/components/custom/DefaultModal'

interface PostCodeDialogProps {
  ElementId: string
  onChange?: (value: string) => void
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export default function PostCodeDialog({ ElementId, onChange, open, setOpen }: PostCodeDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <DefaultModal
      size='xs'
      title='우편번호 검색'
      open={open}
      setOpen={setOpen}
      TransitionProps={{
        onEntered: () => {
          if (!containerRef.current) return
          const element = document.getElementById(ElementId) as HTMLInputElement

          // @ts-ignore
          new daum.Postcode({
            oncomplete: (data: any) => {
              setOpen(false)
              if (element) element.value = data.address
              if (onChange) onChange(data.address)
            },
            width: '100%',
            height: '100%'
          }).embed(containerRef.current)
        }
      }}
    >
      <div
        ref={containerRef}
        style={{ width: '100%', height: '50vh', minHeight: '400px', position: 'relative', boxSizing: 'border-box' }}
      />
    </DefaultModal>
  )
}
