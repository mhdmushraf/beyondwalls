import './App.css'
import React, { useEffect, Suspense } from 'react'
import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import MobileAppOnboarding from '@/components/mobile/MobileAppOnboarding';
import { isMobileApp } from '@/components/mobile/mobileDetection';
import MobileRouteTransition from '@/components/mobile/MobileRouteTransition';
import { AnimatePresence } from 'framer-motion';
import CafeScreenAdvertisingDubai from './pages/CafeScreenAdvertisingDubai';
import GymScreenAdvertisingDubai from './pages/GymScreenAdvertisingDubai';
import CoworkingSpaceAdvertisingDubai from './pages/CoworkingSpaceAdvertisingDubai';
import ClinicScreenAdvertisingDubai from './pages/ClinicScreenAdvertisingDubai';
import MonetizeYourScreensDubai from './pages/MonetizeYourScreensDubai';
import DOOHAdvertisingCostDubai from './pages/DOOHAdvertisingCostDubai';
import IndoorVenueDOOHvsBillboardsDubai from './pages/IndoorVenueDOOHvsBillboardsDubai';
import WhatIsDOOHAdvertisingGuide from './pages/WhatIsDOOHAdvertisingGuide';
import EarnMoneyVenueScreensDubai from './pages/EarnMoneyVenueScreensDubai';
import DOOHAdvertisingMarketplaceDubai from './pages/DOOHAdvertisingMarketplaceDubai';
import ScreensOverview from './pages/ScreensOverview';
import Workspace from './pages/Workspace';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Marketplace from './pages/Marketplace';
import Campaigns from './pages/Campaigns';
import Media from './pages/Media';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import MyScreens from './pages/MyScreens';
import Bookings from './pages/Bookings';
import Playlists from './pages/Playlists';
import Revenue from './pages/Revenue';
import Screens from './pages/Screens';
import Content from './pages/Content';
import Team from './pages/Team';
import Finance from './pages/Finance';
import Clients from './pages/Clients';
import Reports from './pages/Reports';
import Organizations from './pages/Organizations';
import UsersPage from './pages/Users';
import Approvals from './pages/Approvals';
import Network from './pages/Network';
import AddScreen from './pages/AddScreen';
import ScreenPairing from './pages/ScreenPairing';
import ScreenDetail from './pages/ScreenDetail';
import Plans from './pages/Plans';

// Lazy load pages for code splitting
const LazyPageLoader = ({ Page }) => (
  <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
    <Page />
  </Suspense>
);

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();
  const isRunningOnMobileApp = isMobileApp();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // MOBILE APP: Force intro screen for unauthenticated mobile app users
  if (isRunningOnMobileApp && !isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<MobileAppOnboarding />} />
      </Routes>
    );
  }

  // Render the main app
   return (
     <AnimatePresence mode="wait">
       <Routes>
         <Route path="/" element={
           <LayoutWrapper currentPageName={mainPageKey}>
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <MainPage />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         {Object.entries(Pages).map(([path, Page]) => (
           <Route
             key={path}
             path={`/${path}`}
             element={
               <LayoutWrapper currentPageName={path}>
                 <MobileRouteTransition>
                   <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                     <Page />
                   </Suspense>
                 </MobileRouteTransition>
               </LayoutWrapper>
             }
           />
         ))}
         <Route path="/workspace" element={
           <LayoutWrapper currentPageName="Workspace">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <Workspace />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/ScreensOverview" element={
           <LayoutWrapper currentPageName="ScreensOverview">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <ScreensOverview />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/CafeScreenAdvertisingDubai" element={
           <LayoutWrapper currentPageName="CafeScreenAdvertisingDubai">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <CafeScreenAdvertisingDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/GymScreenAdvertisingDubai" element={
           <LayoutWrapper currentPageName="GymScreenAdvertisingDubai">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <GymScreenAdvertisingDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/CoworkingSpaceAdvertisingDubai" element={
           <LayoutWrapper currentPageName="CoworkingSpaceAdvertisingDubai">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <CoworkingSpaceAdvertisingDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/ClinicScreenAdvertisingDubai" element={
           <LayoutWrapper currentPageName="ClinicScreenAdvertisingDubai">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <ClinicScreenAdvertisingDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/MonetizeYourScreensDubai" element={
           <LayoutWrapper currentPageName="MonetizeYourScreensDubai">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <MonetizeYourScreensDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/DOOHAdvertisingCostDubai" element={
           <LayoutWrapper currentPageName="DOOHAdvertisingCostDubai">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <DOOHAdvertisingCostDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/IndoorVenueDOOHvsBillboardsDubai" element={
           <LayoutWrapper currentPageName="IndoorVenueDOOHvsBillboardsDubai">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <IndoorVenueDOOHvsBillboardsDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/WhatIsDOOHAdvertisingGuide" element={
           <LayoutWrapper currentPageName="WhatIsDOOHAdvertisingGuide">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <WhatIsDOOHAdvertisingGuide />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/EarnMoneyVenueScreensDubai" element={
           <LayoutWrapper currentPageName="EarnMoneyVenueScreensDubai">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <EarnMoneyVenueScreensDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/DOOHAdvertisingMarketplaceDubai" element={
           <LayoutWrapper currentPageName="DOOHAdvertisingMarketplaceDubai">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <DOOHAdvertisingMarketplaceDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/plans" element={
           <LayoutWrapper currentPageName="Plans">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <Plans />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/login" element={<Login />} />
         {[
           { path: '/marketplace', name: 'Marketplace', Comp: Marketplace },
           { path: '/campaigns', name: 'Campaigns', Comp: Campaigns },
           { path: '/media', name: 'Media', Comp: Media },
           { path: '/analytics', name: 'Analytics', Comp: Analytics },
           { path: '/settings', name: 'Settings', Comp: Settings },
           { path: '/my-screens', name: 'MyScreens', Comp: MyScreens },
           { path: '/bookings', name: 'Bookings', Comp: Bookings },
           { path: '/playlists', name: 'Playlists', Comp: Playlists },
           { path: '/revenue', name: 'Revenue', Comp: Revenue },
           { path: '/screens', name: 'Screens', Comp: Screens },
           { path: '/content', name: 'Content', Comp: Content },
           { path: '/team', name: 'Team', Comp: Team },
           { path: '/finance', name: 'Finance', Comp: Finance },
           { path: '/clients', name: 'Clients', Comp: Clients },
           { path: '/reports', name: 'Reports', Comp: Reports },
           { path: '/organizations', name: 'Organizations', Comp: Organizations },
           { path: '/users', name: 'Users', Comp: UsersPage },
           { path: '/approvals', name: 'Approvals', Comp: Approvals },
           { path: '/network', name: 'Network', Comp: Network },
           { path: '/add-screen', name: 'AddScreen', Comp: AddScreen },
           { path: '/screen-pairing', name: 'ScreenPairing', Comp: ScreenPairing },
           { path: '/screen-detail', name: 'ScreenDetail', Comp: ScreenDetail },
         ].map(({ path, name, Comp }) => (
           <Route key={path} path={path} element={
             <LayoutWrapper currentPageName={name}>
               <MobileRouteTransition>
                 <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                   <Comp />
                 </Suspense>
               </MobileRouteTransition>
             </LayoutWrapper>
           } />
         ))}
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password" element={<ResetPassword />} />
         <Route path="*" element={<PageNotFound />} />
       </Routes>
     </AnimatePresence>
   );
};


function App() {
  // Detect and apply system dark mode
  useEffect(() => {
    const applyDarkMode = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyDarkMode();

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyDarkMode();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster closeButton richColors position="top-right" />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App