import {
  LayoutDashboard,
  Store,
  Megaphone,
  Image as ImageIcon,
  BarChart3,
  Settings,
  MonitorPlay,
  CalendarCheck,
  ListVideo,
  Wallet,
  Monitor,
  FileText,
  Users,
  DollarSign,
  FileBarChart,
  Building2,
  ClipboardCheck,
  Network,
} from 'lucide-react';

const SETTINGS = { label: 'Settings', icon: Settings, path: '/settings' };

const ADVERTISER_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/workspace' },
  { label: 'Marketplace', icon: Store, path: '/marketplace' },
  { label: 'Campaigns', icon: Megaphone, path: '/campaigns' },
  { label: 'Media', icon: ImageIcon, path: '/media' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  SETTINGS,
];

const VENUE_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/workspace' },
  { label: 'My Screens', icon: MonitorPlay, path: '/my-screens' },
  { label: 'Bookings', icon: CalendarCheck, path: '/bookings' },
  { label: 'Playlists', icon: ListVideo, path: '/playlists' },
  { label: 'Revenue', icon: Wallet, path: '/revenue' },
  SETTINGS,
];

const ENTERPRISE_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/workspace' },
  { label: 'Screens', icon: Monitor, path: '/screens' },
  { label: 'Content', icon: FileText, path: '/content' },
  { label: 'Marketplace', icon: Store, path: '/marketplace' },
  { label: 'Team', icon: Users, path: '/team' },
  { label: 'Finance', icon: DollarSign, path: '/finance' },
  SETTINGS,
];

const AGENCY_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/workspace' },
  { label: 'Clients', icon: Users, path: '/clients' },
  { label: 'Campaigns', icon: Megaphone, path: '/campaigns' },
  { label: 'Marketplace', icon: Store, path: '/marketplace' },
  { label: 'Reports', icon: FileBarChart, path: '/reports' },
  SETTINGS,
];

const ADMIN_NAV = [
  { label: 'Overview', icon: LayoutDashboard, path: '/workspace' },
  { label: 'Organizations', icon: Building2, path: '/organizations' },
  { label: 'Users', icon: Users, path: '/users' },
  { label: 'Approvals', icon: ClipboardCheck, path: '/approvals' },
  { label: 'Finance', icon: DollarSign, path: '/finance' },
  { label: 'Network', icon: Network, path: '/network' },
  SETTINGS,
];

const NAV_BY_TYPE = {
  advertiser: ADVERTISER_NAV,
  venue: VENUE_NAV,
  enterprise: ENTERPRISE_NAV,
  agency: AGENCY_NAV,
};

export function getRoleNavItems(user, org) {
  if (!user) return [];
  if (user.role === 'admin') return ADMIN_NAV;
  const type = org?.type || user.account_type;
  return NAV_BY_TYPE[type] || ADVERTISER_NAV;
}