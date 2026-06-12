export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatLongDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatViews(views: number): string {
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k`;
  }
  return views.toLocaleString();
}

export function formatFollowers(count: number): string {
  return `${(count / 1000).toFixed(1)}k`;
}
