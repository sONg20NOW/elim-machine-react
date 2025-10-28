export const QUERY_KEYS = {
  MACHINE_PROJECT_PIC: {
    GET_OVERVIEW: (machineProjectId: string) => ['GET_OVERVIEW', machineProjectId]
  },
  MACHINE_INSPECTION: {
    GET_INSPECTION_INFO: (machineProjectId: string, machineInspectionId: string) => [
      'GET_INSPECTION_INFO',
      machineProjectId,
      machineInspectionId
    ],
    GET_CHECKLIST_RESULT: (
      machineProjectId: string,
      machineInspectionId: string,
      machineChecklistItemResultId: string
    ) => ['GET_CHECKLIST_RESULT', machineProjectId, machineInspectionId, machineChecklistItemResultId]
  },
  MACHINE_CATEGORY: ['MACHINE_CATEGORY'],
  MACHINE_ENERGY_TYPE: ['MACHINE_ENERGY_TYPE'],
  MACHINE_ENERGY_TARGET: {
    GET_ENERGY_TARGETS: (machineProjectId: string, machineEnergyTypeId: string) => [
      'GET_ENERGY_TARGETS',
      machineProjectId,
      machineEnergyTypeId
    ]
  },
  MACHINE_ENERGY_USAGE: {
    GET_ENERGY_USAGES: (machineProjectId: string, machineEnergyTypeId: string) => [
      'GET_ENERGY_USAGES',
      machineProjectId,
      machineEnergyTypeId
    ]
  },
  MACHINE_REPORT_CATEGORY_CONTROLLER: ['MACHINE_REPORT_CATEGORY_CONTROLLER'],
  MACHINE_INSPECTION_OPINION: {
    GET_INSPECTION_OPINION: (machineProjectId: string) => ['GET_INSPECTION_OPINION', machineProjectId]
  }
}
