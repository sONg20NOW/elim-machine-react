export const QUERY_KEYS = {
  MACHINE_PROJECT_PIC: {
    GET_OVERVIEW: (machineProjectId: string) => ['overview', machineProjectId]
  },
  MACHINE_INSPECTION: {
    GET_INSPECTION_INFO: (machineProjectId: string, machineInspectionId: string) => [
      'single inspection info',
      machineProjectId,
      machineInspectionId
    ]
  }
}
