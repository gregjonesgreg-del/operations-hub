import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobsBoard from './pages/JobsBoard';
import CreateJob from './pages/CreateJob';
import JobDetail from './pages/JobDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Jobs": Jobs,
    "JobsBoard": JobsBoard,
    "CreateJob": CreateJob,
    "JobDetail": JobDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};