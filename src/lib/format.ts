export function formatMoney(amount: number) {
  return `SLE ${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

export function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    pending_payment: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-200 text-gray-700',
    upcoming: 'bg-blue-100 text-blue-800',
    draft: 'bg-gray-200 text-gray-700',
    published: 'bg-green-100 text-green-800',
    unpublished: 'bg-gray-200 text-gray-700',
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-amber-100 text-amber-800',
    interested: 'bg-purple-100 text-purple-800',
    converted: 'bg-green-100 text-green-800',
    not_interested: 'bg-gray-200 text-gray-700',
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-amber-100 text-amber-800',
  };
  return map[status] ?? 'bg-gray-200 text-gray-700';
}

export function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export function generateCertificateId() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PCTIH-${year}-${rand}`;
}

export function generateReceiptNumber() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `RCT-${rand}`;
}
