import Home from './pages/Home';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Register": Register,
    "CompleteProfile": CompleteProfile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};