/**
 * CANONICAL ROUTE REGISTRY - Single source of truth for all app routes
 * All navigation must use these builders to prevent broken links
 */

export const ROUTES = {
  // Home & Core
  HOME: '/',
  
  // Work Orders (Jobs)
  JOBS: '/jobs',
  JOBS_BOARD: '/jobs/board',
  JOBS_CREATE: '/jobs/new',
  JOBS_DETAIL: '/jobs/:jobId',
  
  // PPM
  PPM_PLANS: '/ppm/plans',
  PPM_PLANS_DETAIL: '/ppm/plans/:planId',
  PPM_INSTANCES: '/ppm/instances',
  PPM_INSTANCES_DETAIL: '/ppm/instances/:instanceId',
  
  // Internal Ops & Compliance
  OPS: '/ops',
  OPS_TASKS: '/ops/tasks',
  OPS_TASKS_DETAIL: '/ops/tasks/:taskId',
  OPS_INCIDENTS: '/ops/incidents',
  OPS_INCIDENTS_CREATE: '/ops/incidents/new',
  OPS_INCIDENTS_DETAIL: '/ops/incidents/:incidentId',
  
  // Fleet
  FLEET: '/fleet/vehicles',
  FLEET_VEHICLES: '/fleet/vehicles',
  FLEET_VEHICLES_DETAIL: '/fleet/vehicles/:vehicleId',
  FLEET_CHECKS: '/fleet/checks',
  FLEET_DEFECTS: '/fleet/defects',
  FLEET_DEFECTS_DETAIL: '/fleet/defects/:defectId',
  FLEET_FUEL: '/fleet/fuel',
  FLEET_FUEL_DETAIL: '/fleet/fuel/:fuelId',
  FLEET_FUEL_REVIEW: '/fleet/fuel-review',
  
  // Hire / Rental
  HIRE: '/hire/assets',
  HIRE_ASSETS: '/hire/assets',
  HIRE_CALENDAR: '/hire/calendar',
  HIRE_CONTRACTS: '/hire/contracts',
  HIRE_CONTRACTS_CREATE: '/hire/contracts/new',
  HIRE_CONTRACTS_DETAIL: '/hire/contracts/:contractId',
  HIRE_INSPECTIONS_DETAIL: '/hire/inspections/:inspectionId',
  
  // Dashboards & Analytics
  DASHBOARDS: '/dashboards',
  DASHBOARDS_JOBS: '/dashboards/jobs',
  DASHBOARDS_PPM: '/dashboards/ppm',
  DASHBOARDS_FLEET: '/dashboards/fleet',
  DASHBOARDS_HIRE: '/dashboards/hire',
  DASHBOARDS_OPS: '/dashboards/ops',
  
  // Core Data & Admin
  CUSTOMERS: '/core/customers',
  CUSTOMERS_DETAIL: '/core/customers/:customerId',
  SITES: '/sites',
  SITES_DETAIL: '/sites/:siteId',
  CONTACTS: '/core/contacts',
  ASSETS: '/core/assets',
  ASSETS_DETAIL: '/core/assets/:assetId',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Special
  DIAGNOSTICS_ROUTES: '/diagnostics/routes',
  NOT_FOUND: '/404',
};

/**
 * Route builders for detail pages with ID substitution
 * ALL return absolute paths starting with "/"
 */
export const routeBuilders = {
  // Static routes
  jobs: () => ROUTES.JOBS,
  jobsBoard: () => ROUTES.JOBS_BOARD,
  jobsNew: () => ROUTES.JOBS_CREATE,
  ppmPlans: () => ROUTES.PPM_PLANS,
  ppmInstances: () => ROUTES.PPM_INSTANCES,
  ops: () => ROUTES.OPS,
  opsTasks: () => ROUTES.OPS_TASKS,
  opsIncidents: () => ROUTES.OPS_INCIDENTS,
  opsIncidentsNew: () => ROUTES.OPS_INCIDENTS_CREATE,
  fleetVehicles: () => ROUTES.FLEET_VEHICLES,
  fleetChecks: () => ROUTES.FLEET_CHECKS,
  fleetDefects: () => ROUTES.FLEET_DEFECTS,
  fleetFuel: () => ROUTES.FLEET_FUEL,
  fleetFuelReview: () => ROUTES.FLEET_FUEL_REVIEW,
  hireAssets: () => ROUTES.HIRE_ASSETS,
  hireCalendar: () => ROUTES.HIRE_CALENDAR,
  hireContracts: () => ROUTES.HIRE_CONTRACTS,
  hireContractsNew: () => ROUTES.HIRE_CONTRACTS_CREATE,
  customers: () => ROUTES.CUSTOMERS,
  sites: () => ROUTES.SITES,
  contacts: () => ROUTES.CONTACTS,
  assets: () => ROUTES.ASSETS,
  dashboards: () => ROUTES.DASHBOARDS,
  dashboardsJobs: () => ROUTES.DASHBOARDS_JOBS,
  dashboardsPPM: () => ROUTES.DASHBOARDS_PPM,
  dashboardsFleet: () => ROUTES.DASHBOARDS_FLEET,
  dashboardsHire: () => ROUTES.DASHBOARDS_HIRE,
  dashboardsOps: () => ROUTES.DASHBOARDS_OPS,
  adminSettings: () => ROUTES.ADMIN_SETTINGS,
  diagnosticsRoutes: () => ROUTES.DIAGNOSTICS_ROUTES,
  home: () => ROUTES.HOME,
  notFound: () => ROUTES.NOT_FOUND,

  // Detail routes (always return absolute paths)
  jobDetail: (jobId) => `/jobs/${jobId}`,
  ppmPlanDetail: (planId) => `/ppm/plans/${planId}`,
  ppmInstanceDetail: (instanceId) => `/ppm/instances/${instanceId}`,
  opsTaskDetail: (taskId) => `/ops/tasks/${taskId}`,
  incidentDetail: (incidentId) => `/ops/incidents/${incidentId}`,
  vehicleDetail: (vehicleId) => `/fleet/vehicles/${vehicleId}`,
  defectDetail: (defectId) => `/fleet/defects/${defectId}`,
  fuelDetail: (fuelId) => `/fleet/fuel/${fuelId}`,
  hireContractDetail: (contractId) => `/hire/contracts/${contractId}`,
  hireInspectionDetail: (inspectionId) => `/hire/inspections/${inspectionId}`,
  customerDetail: (customerId) => `/core/customers/${customerId}`,
  siteDetail: (siteId) => `/core/sites/${siteId}`,
  assetDetail: (assetId) => `/core/assets/${assetId}`,
};

/**
 * Safety guard: ensure path is absolute or known external
 * Logs warning for relative paths (dev only)
 */
export const ensureAbsolutePath = (path) => {
  if (!path) return path;
  if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path; // External links OK
  }
  if (path.startsWith('/')) {
    return path; // Already absolute
  }
  // Relative path detected - log warning
  if (typeof console !== 'undefined') {
    console.warn(`[Route Warning] Relative path detected: "${path}". Use routeBuilders or absolute paths (start with "/").`);
  }
  return `/${path}`; // Auto-fix
};