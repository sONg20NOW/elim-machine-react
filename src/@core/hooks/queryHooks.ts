import { useMutation, useQueryClient } from '@tanstack/react-query'

import { auth } from '@/lib/auth'
import { QUERY_KEYS } from '@/app/_constants/queryKeys'

interface MachineProjectPicUpdateResponseDtoType {
  id: number
  version: number
  originalFileName: string
  machineProjectPicType: string
  remark: string
}

export const useUpdateOverviewPic = (machineProjectId: number, machineProjectPicId: number) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (updatedData: {
      version: number
      originalFileName: string
      machineProjectPicType: string
      remark: string
    }) =>
      await auth
        .put<{
          data: MachineProjectPicUpdateResponseDtoType
        }>(`/api/machine-projects/${machineProjectId}/machine-project-pics/${machineProjectPicId}`, updatedData)
        .then(p => p.data.data),
    onSuccess: v => {
      queryClient.setQueryData(QUERY_KEYS.MACHINE_PROJECT_PIC.GET_OVERVIEW(machineProjectId.toString()), v)
    }
  })
}
