import type { StateCreator } from 'zustand'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CheckTabValueType = 'pictures' | 'empty' | 'info' | 'upload' | 'camera'

interface TabValueState {
  tabValue: CheckTabValueType
  setTabValue: (value: CheckTabValueType) => void
}

const checkTabValueCreator: StateCreator<TabValueState> = set => ({
  // ⭐ 초기 상태 (State)
  tabValue: 'pictures',

  // ⭐ 액션 (Action)
  setTabValue: (value: CheckTabValueType) => {
    set({ tabValue: value }) // set 함수를 통해 상태 업데이트
  }
})

const useCheckTabValueStore = create<TabValueState>()(
  persist(
    checkTabValueCreator, // 5. StateCreator 함수 전달
    {
      name: 'checkTabValueStorage'
    }
  )
)

export default useCheckTabValueStore
