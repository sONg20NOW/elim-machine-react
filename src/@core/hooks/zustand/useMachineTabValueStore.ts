import type { StateCreator } from 'zustand'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MachineTabValue = '현장정보' | '점검일정/참여기술진' | '설비목록' | '전체사진' | '특이사항'

interface TabValueState {
  tabValue: MachineTabValue
  setTabValue: (value: MachineTabValue) => void
}

const machineTabValueCreator: StateCreator<TabValueState> = set => ({
  // ⭐ 초기 상태 (State)
  tabValue: '현장정보',

  // ⭐ 액션 (Action)
  setTabValue: (value: MachineTabValue) => {
    set({ tabValue: value }) // set 함수를 통해 상태 업데이트
    console.log(`zustand call! (tabvalue: ${value})`)
  }
})

const useMachineTabValueStore = create<TabValueState>()(
  persist(
    machineTabValueCreator, // 5. StateCreator 함수 전달
    {
      name: 'machineTabValueStorage'
    }
  )
)

export default useMachineTabValueStore
