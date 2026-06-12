import { Eye, FileText, Heart, TrendingUp, Users } from 'lucide-react';

import { MonthlyViewsChart } from '@/components/dashboard/monthly-views-chart';
import { WeeklyViewsChart } from '@/components/dashboard/weekly-views-chart';
import { ARTICLES, DASHBOARD_STATS } from '@/lib/data';
import { formatViews } from '@/lib/format';

const WEEKLY_DATA = DASHBOARD_STATS.weeklyViews.map((views, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  views,
}));

const MONTHLY_DATA = DASHBOARD_STATS.monthlyViews.map((views, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
  views,
}));

const topArticles = [...ARTICLES]
  .filter((a) => a.status === 'published')
  .sort((a, b) => b.views - a.views)
  .slice(0, 5);

export function AnalyticsDashboard() {
  return (
    <div className="max-w-6xl p-6">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Track performance across your articles and audience
        </p>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total views',
            value: formatViews(DASHBOARD_STATS.totalViews),
            change: '+12.4%',
            icon: Eye,
          },
          {
            label: 'Total likes',
            value: DASHBOARD_STATS.totalLikes.toLocaleString(),
            change: '+8.1%',
            icon: Heart,
          },
          {
            label: 'Followers',
            value: DASHBOARD_STATS.totalFollowers.toLocaleString(),
            change: '+5.3%',
            icon: Users,
          },
          {
            label: 'Articles',
            value: String(DASHBOARD_STATS.totalArticles),
            change: '+2',
            icon: FileText,
          },
        ].map(({ label, value, change, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="rounded-lg bg-primary/10 p-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3" /> {change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Weekly views</h3>
          <p className="mb-4 text-xs text-muted-foreground">Last 7 days</p>
          <WeeklyViewsChart data={WEEKLY_DATA} />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Monthly views</h3>
          <p className="mb-4 text-xs text-muted-foreground">Last 6 months</p>
          <MonthlyViewsChart data={MONTHLY_DATA} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">
            Top performing articles
          </h3>
        </div>
        <div className="divide-y divide-border">
          {topArticles.map((article, index) => (
            <div
              key={article.id}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              <span className="w-6 text-sm font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {article.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {article.category.name}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  {formatViews(article.views)}
                </p>
                <p>{article.likes} likes</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
