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
    ) => ['GET_CHECKLIST_RESULT', machineProjectId, machineInspectionId, machineChecklistItemResultId],
    GET_INSPECTIONS_SIMPLE: (machineProjectId: string) => ['GET_INSPECTIONS_SIMPLE', machineProjectId],
    GET_INSPECTIONS: (machineProjectId: string, queryParams: string) => [
      'GET_INSPECTIONS',
      machineProjectId,
      queryParams
    ],
    GET_ROOT_CATEGORIES: (machineProjectId: string) => ['GET_ROOT_CATEGORIES', machineProjectId]
  },
  MACHINE_CATEGORY: {
    GET_MACHINE_CATEGORY: ['GET_MACHINE_CATEGORY'],
    GET_MACHINE_LEAF_CATEGORY: ['GET_MACHINE_LEAF_CATEGORY']
  },
  MACHINE_ENERGY_TYPE: ['MACHINE_ENERGY_TYPE'],
  MACHINE_ENERGY_TARGET: {
    GET_ENERGY_TARGETS: (machineProjectId: string, machineEnergyTypeId: string) => [
      'GET_ENERGY_TARGETS',
      machineProjectId,
      machineEnergyTypeId
    ]
  },
  MACHINE_ENERGY_USAGE: {
    GET_ENERGY_USAGES: (machineProjectId: string, machineEnergyTypeId: string, years: number[]) => [
      'GET_ENERGY_USAGES',
      machineProjectId,
      machineEnergyTypeId,
      years.join(',')
    ]
  },
  MACHINE_REPORT_CATEGORY_CONTROLLER: ['MACHINE_REPORT_CATEGORY_CONTROLLER'],
  MACHINE_REPORT: {
    GET_MACHINE_REPORT_STATUSES: (machineProjectId: string, machineReportCategoryIds: number[]) => [
      'GET_MACHINE_REPORT_STATUSES',
      machineProjectId,
      machineReportCategoryIds.join(',')
    ]
  },
  MACHINE_INSPECTION_OPINION: {
    GET_INSPECTION_OPINION: (machineProjectId: string) => ['GET_INSPECTION_OPINION', machineProjectId]
  },
  ENGINEER: {
    GET_ENGINEERS_OPTIONS: ['GET_ENGINEERS_OPTIONS'],
    GET_ENGINEER_BY_MEMBERID: (memberId: string) => ['GET_ENGINEER_BY_MEMBERID', memberId],
    GET_ENGINEERS: (queryParams: string) => ['GET_ENGINEERS', queryParams],
    GET_ENGINEER: (engineerId: string) => ['GET_ENGINEER', engineerId]
  },
  MACHINE_PROJECT: {
    GET_MACHINE_PROJECT_ENGINEERS: (machineProjectId: string) => ['GET_MACHINE_PROJECT_ENGINEERS', machineProjectId],
    GET_MACHINE_PROJECT_SCHEDULE_TAB: (machineProjectId: string) => [
      'GET_MACHINE_PROJECT_SCHEDULE_TAB',
      machineProjectId
    ],
    GET_MACHINE_PROJECT: (machineProjectId: string) => ['GET_MACHINE_PROJECT', machineProjectId],
    GET_MACHINE_PROJECTS: (queryParams: string) => ['GET_MACHINE_PROJECTS', queryParams]
  },
  MEMBER: {
    GET_SINGLE_MEMBER: (memberId: string) => ['GET_SINGLE_MEMBER', memberId],
    GET_MEMBERS: (queryParams: string) => ['GET_MEMBERS', queryParams]
  },
  MACHINE_PERFORMANCE_REVIEW: {
    GET_RESULT_SUMMARY: (machineProjectId: string) => ['GET_RESULT_SUMMARY', machineProjectId],
    GET_OPERATION_STATUS: (machineProjectId: string) => ['GET_OPERATION_STATUS', machineProjectId],
    GET_YEARLY_PLAN: (machineProjectId: string) => ['GET_YEARLY_PLAN', machineProjectId],
    GET_MEASUREMENT: (machineProjectId: string) => ['GET_MEASUREMENT', machineProjectId],
    GET_IMPROVEMENT: (machineProjectId: string) => ['GET_IMPROVEMENT', machineProjectId],
    GET_GUIDE: (machineProjectId: string) => ['GET_GUIDE', machineProjectId],
    GET_AGING: (machineProjectId: string) => ['GET_AGING', machineProjectId]
  },
  LICENSE: {
    GET_LICENSES_NAMES: ['GET_LICENSES_NAMES'],
    GET_LICENSES: (queryParams: string) => ['GET_LICENSES', queryParams],
    GET_LICENSE: (licenseId: string) => ['GET_LICENSE', licenseId]
  }
}
