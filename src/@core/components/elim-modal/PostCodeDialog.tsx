import type { Dispatch, SetStateAction } from 'react'
import React, { useRef } from 'react'

import DefaultModal from './DefaultModal'

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
