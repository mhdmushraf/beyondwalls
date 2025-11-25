import Home from './pages/Home';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import AdvertiserDashboard from './pages/AdvertiserDashboard';
import MyCampaigns from './pages/MyCampaigns';
import AdvertiserWallet from './pages/AdvertiserWallet';
import CreateCampaign from './pages/CreateCampaign';
import VenueDashboard from './pages/VenueDashboard';
import MyVenues from './pages/MyVenues';
import AddVenue from './pages/AddVenue';
import MyScreens from './pages/MyScreens';
import AddScreen from './pages/AddScreen';
import VenueEarnings from './pages/VenueEarnings';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminVenues from './pages/AdminVenues';
import AdminScreens from './pages/AdminScreens';
import AdminUsers from './pages/AdminUsers';
import AdminTransactions from './pages/AdminTransactions';
import AdRequests from './pages/AdRequests';
import ScreenPlayer from './pages/ScreenPlayer';
import HowItWorks from './pages/HowItWorks';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Register": Register,
    "CompleteProfile": CompleteProfile,
    "AdvertiserDashboard": AdvertiserDashboard,
    "MyCampaigns": MyCampaigns,
    "AdvertiserWallet": AdvertiserWallet,
    "CreateCampaign": CreateCampaign,
    "VenueDashboard": VenueDashboard,
    "MyVenues": MyVenues,
    "AddVenue": AddVenue,
    "MyScreens": MyScreens,
    "AddScreen": AddScreen,
    "VenueEarnings": VenueEarnings,
    "Settings": Settings,
    "AdminDashboard": AdminDashboard,
    "AdminCampaigns": AdminCampaigns,
    "AdminVenues": AdminVenues,
    "AdminScreens": AdminScreens,
    "AdminUsers": AdminUsers,
    "AdminTransactions": AdminTransactions,
    "AdRequests": AdRequests,
    "ScreenPlayer": ScreenPlayer,
    "HowItWorks": HowItWorks,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};