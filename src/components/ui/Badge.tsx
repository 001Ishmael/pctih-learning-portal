import { statusBadgeClass } from '../../lib/format';

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${statusBadgeClass(status)}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
