import type { StateCreator } from 'zustand'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { MachineProjectTabValueType } from '@/@core/types'

interface TabValueState {
  tabValue: MachineProjectTabValueType
  setTabValue: (value: MachineProjectTabValueType) => void
}

const machineProjectTabValueCreator: StateCreator<TabValueState> = set => ({
  // ⭐ 초기 상태 (State)
  tabValue: '현장정보',

  // ⭐ 액션 (Action)
  setTabValue: (value: MachineProjectTabValueType) => {
    set({ tabValue: value }) // set 함수를 통해 상태 업데이트
    console.log(`zustand call! (tabvalue: ${value})`)
  }
})

const useMachineProjectTabValueStore = create<TabValueState>()(
  persist(
    machineProjectTabValueCreator, // 5. StateCreator 함수 전달
    {
      name: 'machineTabValueStorage'
    }
  )
)

export default useMachineProjectTabValueStore
