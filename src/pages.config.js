import AdminSettings from './pages/AdminSettings';
import AssetDetail from './pages/AssetDetail';
import Assets from './pages/Assets';
import ContactDetail from './pages/ContactDetail';
import Contacts from './pages/Contacts';
import CreateHireContract from './pages/CreateHireContract';
import CreateIncident from './pages/CreateIncident';
import CreateJob from './pages/CreateJob';
import CustomerDetail from './pages/CustomerDetail';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Dashboards from './pages/Dashboards';
import DashboardsFleet from './pages/DashboardsFleet';
import DashboardsHire from './pages/DashboardsHire';
import DashboardsJobs from './pages/DashboardsJobs';
import DashboardsOps from './pages/DashboardsOps';
import DashboardsPPM from './pages/DashboardsPPM';
import DiagnosticsRoutes from './pages/DiagnosticsRoutes';
import Employees from './pages/Employees';
import Fleet from './pages/Fleet';
import FleetChecks from './pages/FleetChecks';
import FleetDefectDetail from './pages/FleetDefectDetail';
import FleetDefects from './pages/FleetDefects';
import FleetFuel from './pages/FleetFuel';
import FleetFuelDetail from './pages/FleetFuelDetail';
import FleetFuelReview from './pages/FleetFuelReview';
import Hire from './pages/Hire';
import HireAssetDetail from './pages/HireAssetDetail';
import HireCalendar from './pages/HireCalendar';
import HireContractDetail from './pages/HireContractDetail';
import HireContracts from './pages/HireContracts';
import HireInspectionDetail from './pages/HireInspectionDetail';
import IncidentDetail from './pages/IncidentDetail';
import InternalOps from './pages/InternalOps';
import InternalTaskDetail from './pages/InternalTaskDetail';
import JobDetail from './pages/JobDetail';
import Jobs from './pages/Jobs';
import JobsBoard from './pages/JobsBoard';
import MyJobs from './pages/MyJobs';
import MyVehicle from './pages/MyVehicle';
import NotFound from './pages/NotFound';
import PPM from './pages/PPM';
import PPMInstanceDetail from './pages/PPMInstanceDetail';
import PPMPlanDetail from './pages/PPMPlanDetail';
import SiteDetail from './pages/SiteDetail';
import Sites from './pages/Sites';
import Teams from './pages/Teams';
import VehicleDetail from './pages/VehicleDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminSettings": AdminSettings,
    "AssetDetail": AssetDetail,
    "Assets": Assets,
    "ContactDetail": ContactDetail,
    "Contacts": Contacts,
    "CreateHireContract": CreateHireContract,
    "CreateIncident": CreateIncident,
    "CreateJob": CreateJob,
    "CustomerDetail": CustomerDetail,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "Dashboards": Dashboards,
    "DashboardsFleet": DashboardsFleet,
    "DashboardsHire": DashboardsHire,
    "DashboardsJobs": DashboardsJobs,
    "DashboardsOps": DashboardsOps,
    "DashboardsPPM": DashboardsPPM,
    "DiagnosticsRoutes": DiagnosticsRoutes,
    "Employees": Employees,
    "Fleet": Fleet,
    "FleetChecks": FleetChecks,
    "FleetDefectDetail": FleetDefectDetail,
    "FleetDefects": FleetDefects,
    "FleetFuel": FleetFuel,
    "FleetFuelDetail": FleetFuelDetail,
    "FleetFuelReview": FleetFuelReview,
    "Hire": Hire,
    "HireAssetDetail": HireAssetDetail,
    "HireCalendar": HireCalendar,
    "HireContractDetail": HireContractDetail,
    "HireContracts": HireContracts,
    "HireInspectionDetail": HireInspectionDetail,
    "IncidentDetail": IncidentDetail,
    "InternalOps": InternalOps,
    "InternalTaskDetail": InternalTaskDetail,
    "JobDetail": JobDetail,
    "Jobs": Jobs,
    "JobsBoard": JobsBoard,
    "MyJobs": MyJobs,
    "MyVehicle": MyVehicle,
    "NotFound": NotFound,
    "PPM": PPM,
    "PPMInstanceDetail": PPMInstanceDetail,
    "PPMPlanDetail": PPMPlanDetail,
    "SiteDetail": SiteDetail,
    "Sites": Sites,
    "Teams": Teams,
    "VehicleDetail": VehicleDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};