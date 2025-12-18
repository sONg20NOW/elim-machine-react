import { createContext } from 'react'

const isEditingContext = createContext<{
  isEditing: boolean
  setIsEditing: (value: boolean) => void
} | null>(null)

export default isEditingContext
