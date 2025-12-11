import type { StateCreator } from 'zustand'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AccessTokenState {
  accessToken: string | null
  setAccessToken: (value: string | null) => void
}

const accessTokenCreator: StateCreator<AccessTokenState> = set => ({
  // ⭐ 초기 상태 (State)
  accessToken: '',

  // ⭐ 액션 (Action)
  setAccessToken: (value: string | null) => {
    set({ accessToken: value }) // set 함수를 통해 상태 업데이트
    console.log(`zustand call: accessToken`)
  }
})

/**
 * localStorage에 저장되어 관리되는 accessToken
 */
const useAccessTokenStore = create<AccessTokenState>()(
  persist(accessTokenCreator, {
    name: 'accessToken'
  })
)

export default useAccessTokenStore
