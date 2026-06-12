import type { Metadata } from 'next';

import { ArticlesManagement } from '@/components/dashboard/articles-management';

export const metadata: Metadata = {
  title: 'My Articles',
};

export default function ArticlesManagementPage() {
  return <ArticlesManagement />;
}
