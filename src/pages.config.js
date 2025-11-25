import Home from './pages/Home';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import AdvertiserDashboard from './pages/AdvertiserDashboard';
import MyCampaigns from './pages/MyCampaigns';
import AdvertiserWallet from './pages/AdvertiserWallet';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Register": Register,
    "CompleteProfile": CompleteProfile,
    "AdvertiserDashboard": AdvertiserDashboard,
    "MyCampaigns": MyCampaigns,
    "AdvertiserWallet": AdvertiserWallet,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};