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
import VenueDetail from './pages/VenueDetail';
import EditVenue from './pages/EditVenue';
import ScreenDetail from './pages/ScreenDetail';
import ManageScreenContent from './pages/ManageScreenContent';
import EditScreen from './pages/EditScreen';
import LiveScreenMonitorPage from './pages/LiveScreenMonitorPage';

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
         <Route path="/EditVenue/:id" element={
           <LayoutWrapper currentPageName="EditVenue">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <EditVenue />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/VenueDetail/:id" element={
           <LayoutWrapper currentPageName="VenueDetail">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <VenueDetail />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/ScreenDetail/:id" element={
           <LayoutWrapper currentPageName="ScreenDetail">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <ScreenDetail />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/EditScreen/:id" element={
           <LayoutWrapper currentPageName="EditScreen">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <EditScreen />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/ManageScreenContent" element={
           <LayoutWrapper currentPageName="ManageScreenContent">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <ManageScreenContent />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
         <Route path="/LiveScreenMonitorPage" element={
           <LayoutWrapper currentPageName="LiveScreenMonitorPage">
             <MobileRouteTransition>
               <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
                 <LiveScreenMonitorPage />
               </Suspense>
             </MobileRouteTransition>
           </LayoutWrapper>
         } />
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