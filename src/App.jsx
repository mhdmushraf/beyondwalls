import './App.css'
import React, { Suspense } from 'react'
import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import Player from './pages/Player';
import PortalLayout from './components/portal/PortalLayout';
import PortalDashboard from './pages/portal/PortalDashboard';
import PortalVenues from './pages/portal/PortalVenues';
import PortalScreens from './pages/portal/PortalScreens';
import PortalScreenDetail from './pages/portal/PortalScreenDetail';
import AdminApprovals from './pages/admin/AdminApprovals';
import PortalMedia from './pages/portal/PortalMedia';
import PortalMenus from './pages/portal/PortalMenus';
import PortalPlaylists from './pages/portal/PortalPlaylists';
import PortalUrgent from './pages/portal/PortalUrgent';
import PortalChat from './pages/portal/PortalChat';
import PortalQR from './pages/portal/PortalQR';
import QRRedirect from './pages/QRRedirect';
import PortalBilling from './pages/portal/PortalBilling';
import PortalSupport from './pages/portal/PortalSupport';
import PortalMarketplace from './pages/portal/PortalMarketplace';
import PortalCampaigns from './pages/portal/PortalCampaigns';
import PortalAdRequests from './pages/portal/PortalAdRequests';
import PortalPayReturn from './pages/portal/PortalPayReturn';
import PortalClients from './pages/portal/PortalClients';
import PortalSettings from './pages/portal/PortalSettings';
import DeleteAccount from './pages/DeleteAccount';
import AdminMarketplace from './pages/admin/AdminMarketplace';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminScreenWall from './pages/admin/AdminScreenWall';
import AdminInstalls from './pages/admin/AdminInstalls';
import AdminSupport from './pages/admin/AdminSupport';
import AdminLeads from './pages/admin/AdminLeads';
import AdminBilling from './pages/admin/AdminBilling';
import AdminSettings from './pages/admin/AdminSettings';
import { I18nProvider } from '@/lib/i18n';
import BrandSplash from '@/components/BrandSplash';

// Lazy load pages for code splitting
const LazyPageLoader = ({ Page }) => (
  <Suspense fallback={<BrandSplash />}>
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
      <BrandSplash />
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Only force login on genuinely protected routes. On PUBLIC routes
      // (home, marketing, login/register themselves), an auth_required error —
      // e.g. from a stale/expired token — must NOT redirect, or it creates an
      // infinite reload loop that shows as a permanent spinner. Just fall
      // through and render the public page.
      const PUBLIC_PATH_PREFIXES = [
        '/', '/home', '/about', '/services', '/contact',
        '/screenlocations', '/blog', '/blogpost', '/authorprofile', '/helpcenter',
        '/terms', '/privacy', '/delete-account', '/howitworks', '/connect', '/plans', '/sitemap',
        '/forvenues', '/foradvertisers', '/bone', '/pricing',
        
        '/doohadvertisingdubai', '/digitalsignageuae', '/cafescreenadvertisingdubai',
        '/gymscreenadvertisingdubai', '/coworkingspaceadvertisingdubai',
        '/clinicscreenadvertisingdubai', '/monetizeyourscreensdubai',
        '/doohadvertisingcostdubai', '/indoorvenuedoohvsbillboardsdubai',
        '/whatisdoohadvertisingguide', '/earnmoneyvenuescreensdubai',
        '/doohadvertisingmarketplacedubai', '/robotstxt', '/sitemapxml', '/notfound',
        '/login', '/signup', '/forgot-password', '/reset-password', '/player',
      ];
      const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      const onPublicRoute = PUBLIC_PATH_PREFIXES.includes(currentPath) || currentPath.startsWith('/q/');
      if (!onPublicRoute) {
        navigateToLogin();
        return null;
      }
      // On a public route: ignore the auth error and render the page.
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
               <Suspense fallback={<BrandSplash />}>
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
                   <Suspense fallback={<BrandSplash />}>
                     <Page />
                   </Suspense>
                 </MobileRouteTransition>
               </LayoutWrapper>
             }
           />
         ))}
         <Route path="/CafeScreenAdvertisingDubai" element={
           <LayoutWrapper currentPageName="CafeScreenAdvertisingDubai">
             <MobileRouteTransition>
               <Suspense fallback={<BrandSplash />}>
                 <CafeScreenAdvertisingDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/GymScreenAdvertisingDubai" element={
           <LayoutWrapper currentPageName="GymScreenAdvertisingDubai">
             <MobileRouteTransition>
               <Suspense fallback={<BrandSplash />}>
                 <GymScreenAdvertisingDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/CoworkingSpaceAdvertisingDubai" element={
           <LayoutWrapper currentPageName="CoworkingSpaceAdvertisingDubai">
             <MobileRouteTransition>
               <Suspense fallback={<BrandSplash />}>
                 <CoworkingSpaceAdvertisingDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/ClinicScreenAdvertisingDubai" element={
           <LayoutWrapper currentPageName="ClinicScreenAdvertisingDubai">
             <MobileRouteTransition>
               <Suspense fallback={<BrandSplash />}>
                 <ClinicScreenAdvertisingDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/MonetizeYourScreensDubai" element={
           <LayoutWrapper currentPageName="MonetizeYourScreensDubai">
             <MobileRouteTransition>
               <Suspense fallback={<BrandSplash />}>
                 <MonetizeYourScreensDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/DOOHAdvertisingCostDubai" element={
           <LayoutWrapper currentPageName="DOOHAdvertisingCostDubai">
             <MobileRouteTransition>
               <Suspense fallback={<BrandSplash />}>
                 <DOOHAdvertisingCostDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/IndoorVenueDOOHvsBillboardsDubai" element={
           <LayoutWrapper currentPageName="IndoorVenueDOOHvsBillboardsDubai">
             <MobileRouteTransition>
               <Suspense fallback={<BrandSplash />}>
                 <IndoorVenueDOOHvsBillboardsDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/WhatIsDOOHAdvertisingGuide" element={
           <LayoutWrapper currentPageName="WhatIsDOOHAdvertisingGuide">
             <MobileRouteTransition>
               <Suspense fallback={<BrandSplash />}>
                 <WhatIsDOOHAdvertisingGuide />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/EarnMoneyVenueScreensDubai" element={
           <LayoutWrapper currentPageName="EarnMoneyVenueScreensDubai">
             <MobileRouteTransition>
               <Suspense fallback={<BrandSplash />}>
                 <EarnMoneyVenueScreensDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/DOOHAdvertisingMarketplaceDubai" element={
           <LayoutWrapper currentPageName="DOOHAdvertisingMarketplaceDubai">
             <MobileRouteTransition>
               <Suspense fallback={<BrandSplash />}>
                 <DOOHAdvertisingMarketplaceDubai />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/plans" element={<Navigate to="/Pricing" replace />} />
         <Route path="/HowItWorks" element={<Navigate to="/ForAdvertisers" replace />} />
         <Route path="/Services" element={<Navigate to="/ForVenues" replace />} />
         <Route path="/login" element={<Login />} />
         <Route path="/signup" element={<Signup />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password" element={<ResetPassword />} />
         <Route path="/player" element={<Player />} />
         <Route path="/q/:id" element={<QRRedirect />} />
         <Route path="/delete-account" element={<DeleteAccount />} />
         <Route path="/onboarding" element={<Onboarding />} />
         <Route path="/admin" element={<AdminLayout />}>
           <Route index element={<AdminOverview />} />
           <Route path="approvals" element={<AdminApprovals />} />
           <Route path="screens" element={<AdminScreenWall />} />
           <Route path="installs" element={<AdminInstalls />} />
           <Route path="support" element={<AdminSupport />} />
           <Route path="leads" element={<AdminLeads />} />
           <Route path="billing" element={<AdminBilling />} />
           <Route path="settings" element={<AdminSettings />} />
           <Route path="marketplace" element={<AdminMarketplace />} />
         </Route>
         <Route path="/app" element={<PortalLayout />}>
           <Route index element={<PortalDashboard />} />
           <Route path="venues" element={<PortalVenues />} />
           <Route path="screens" element={<PortalScreens />} />
           <Route path="screens/:screenId" element={<PortalScreenDetail />} />
           <Route path="media" element={<PortalMedia />} />
           <Route path="menus" element={<PortalMenus />} />
           <Route path="playlists" element={<PortalPlaylists />} />
           <Route path="urgent" element={<PortalUrgent />} />
           <Route path="chat" element={<PortalChat />} />
           <Route path="qr" element={<PortalQR />} />
           <Route path="billing" element={<PortalBilling />} />
           <Route path="support" element={<PortalSupport />} />
           <Route path="marketplace" element={<PortalMarketplace />} />
           <Route path="campaigns" element={<PortalCampaigns />} />
           <Route path="ad-requests" element={<PortalAdRequests />} />
           <Route path="pay/return" element={<PortalPayReturn />} />
           <Route path="clients" element={<PortalClients />} />
           <Route path="settings" element={<PortalSettings />} />
         </Route>
         <Route path="*" element={<PageNotFound />} />
         </Routes>
     </AnimatePresence>
   );
};


function App() {
  // Dark mode is intentionally not supported. The marketing and app pages
  // use hardcoded light Tailwind classes; applying the .dark token set
  // produces dark surfaces with dark text. Do not re-add without auditing
  // every page.

  return (
    <I18nProvider>
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
    </I18nProvider>
  )
}

export default App