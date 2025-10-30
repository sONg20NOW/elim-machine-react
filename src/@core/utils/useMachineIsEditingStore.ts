import { create } from 'zustand'

interface isEditingState {
  isEditing: boolean
  setIsEditing: (value: boolean) => void
}

const useMachineIsEditingStore = create<isEditingState>(set => ({
  // ⭐ 초기 상태 (State)
  isEditing: false,

  // ⭐ 액션 (Action)
  setIsEditing: (value: boolean) => {
    set({ isEditing: value }) // set 함수를 통해 상태 업데이트
    console.log('zustand call (isEditing)!')
  }
}))

export default useMachineIsEditingStore
