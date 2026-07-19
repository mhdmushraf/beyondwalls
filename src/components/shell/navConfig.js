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
  { label: 'Bookings', icon: CalendarCheck, path: '/bookings' },
  { label: 'Media', icon: ImageIcon, path: '/media' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  SETTINGS,
];

const VENUE_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/workspace' },
  { label: 'My Screens', icon: MonitorPlay, path: '/my-screens' },
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
  { label: 'Bookings', icon: CalendarCheck, path: '/bookings' },
  { label: 'Marketplace', icon: Store, path: '/marketplace' },
  { label: 'Reports', icon: FileBarChart, path: '/reports' },
  SETTINGS,
];

const ADMIN_NAV = [
  { label: 'Organizations', icon: Building2, path: '/organizations' },
  { label: 'Users', icon: Users, path: '/users' },
  { label: 'Approvals', icon: ClipboardCheck, path: '/approvals' },
  { label: 'Finance', icon: DollarSign, path: '/finance' },
  { label: 'Network', icon: Network, path: '/network' },
];

const NAV_BY_TYPE = {
  advertiser: ADVERTISER_NAV,
  venue: VENUE_NAV,
  enterprise: ENTERPRISE_NAV,
  agency: AGENCY_NAV,
};

export function getRoleNavItems(user, org) {
  if (!user) return [];
  const isAdmin = user.role === 'admin' || user.user_role === 'admin';
  const type = org?.type || user.account_type;
  const base = NAV_BY_TYPE[type] || ADVERTISER_NAV;
  if (!isAdmin) return base;
  // Admin: segment nav, then admin tools, with Settings kept last.
  const withoutSettings = base.filter(i => i.path !== '/settings');
  return [...withoutSettings, { type: 'divider', label: 'Admin' }, ...ADMIN_NAV, SETTINGS];
}