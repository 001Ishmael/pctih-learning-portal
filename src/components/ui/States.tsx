import { Loader2, Inbox, AlertCircle } from 'lucide-react';

export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500">
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-gray-500">
      <Inbox className="h-10 w-10 text-gray-300" />
      <p className="font-medium text-gray-700">{title}</p>
      {description && <p className="text-sm max-w-sm">{description}</p>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-red-600">
      <AlertCircle className="h-8 w-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
