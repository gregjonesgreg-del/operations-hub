import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobsBoard from './pages/JobsBoard';
import CreateJob from './pages/CreateJob';
import JobDetail from './pages/JobDetail';
import MyJobs from './pages/MyJobs';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
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
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};