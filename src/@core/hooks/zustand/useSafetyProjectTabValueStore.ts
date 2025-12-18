import type { StateCreator } from 'zustand'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { SafetyProjectTabValueType } from '@/@core/types'

interface TabValueState {
  tabValue: SafetyProjectTabValueType
  setTabValue: (value: SafetyProjectTabValueType) => void
}

const safetyProjectTabValueCreator: StateCreator<TabValueState> = set => ({
  // ⭐ 초기 상태 (State)
  tabValue: '현장정보',

  // ⭐ 액션 (Action)
  setTabValue: (value: SafetyProjectTabValueType) => {
    set({ tabValue: value }) // set 함수를 통해 상태 업데이트
    console.log(`zustand call! (tabvalue: ${value})`)
  }
})

const useSafetyProjectTabValueStore = create<TabValueState>()(
  persist(
    safetyProjectTabValueCreator, // 5. StateCreator 함수 전달
    {
      name: 'safetyProjectTabValueStorage'
    }
  )
)

export default useSafetyProjectTabValueStore
