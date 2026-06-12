import type { LucideIcon } from 'lucide-react';
import {
  BarChart2,
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
  User,
} from 'lucide-react';

import { ROUTES } from '@/lib/constants';

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface DashboardNavSection {
  section: string;
  items: DashboardNavItem[];
}

export const DASHBOARD_NAV: DashboardNavSection[] = [
  {
    section: 'Overview',
    items: [
      {
        href: ROUTES.dashboard,
        label: 'Dashboard',
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    section: 'Content',
    items: [
      { href: ROUTES.articles, label: 'My Articles', icon: FileText },
      { href: ROUTES.newArticle, label: 'New Article', icon: Plus },
    ],
  },
  {
    section: 'Settings',
    items: [
      { href: ROUTES.profile, label: 'Profile', icon: User },
      { href: ROUTES.account, label: 'Account', icon: Settings },
    ],
  },
];
