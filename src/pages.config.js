import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobsBoard from './pages/JobsBoard';
import CreateJob from './pages/CreateJob';
import JobDetail from './pages/JobDetail';
import MyJobs from './pages/MyJobs';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import Sites from './pages/Sites';
import SiteDetail from './pages/SiteDetail';
import Contacts from './pages/Contacts';
import Teams from './pages/Teams';
import Employees from './pages/Employees';
import AdminSettings from './pages/AdminSettings';
import PPM from './pages/PPM';
import Hire from './pages/Hire';
import InternalOps from './pages/InternalOps';
import Fleet from './pages/Fleet';
import ContactDetail from './pages/ContactDetail';
import PPMPlanDetail from './pages/PPMPlanDetail';
import PPMInstanceDetail from './pages/PPMInstanceDetail';
import InternalTaskDetail from './pages/InternalTaskDetail';
import IncidentDetail from './pages/IncidentDetail';
import MyVehicle from './pages/MyVehicle';
import VehicleDetail from './pages/VehicleDetail';
import HireContractDetail from './pages/HireContractDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Jobs": Jobs,
    "JobsBoard": JobsBoard,
    "CreateJob": CreateJob,
    "JobDetail": JobDetail,
    "MyJobs": MyJobs,
    "Customers": Customers,
    "CustomerDetail": CustomerDetail,
    "Assets": Assets,
    "AssetDetail": AssetDetail,
    "Sites": Sites,
    "SiteDetail": SiteDetail,
    "Contacts": Contacts,
    "Teams": Teams,
    "Employees": Employees,
    "AdminSettings": AdminSettings,
    "PPM": PPM,
    "Hire": Hire,
    "InternalOps": InternalOps,
    "Fleet": Fleet,
    "ContactDetail": ContactDetail,
    "PPMPlanDetail": PPMPlanDetail,
    "PPMInstanceDetail": PPMInstanceDetail,
    "InternalTaskDetail": InternalTaskDetail,
    "IncidentDetail": IncidentDetail,
    "MyVehicle": MyVehicle,
    "VehicleDetail": VehicleDetail,
    "HireContractDetail": HireContractDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};