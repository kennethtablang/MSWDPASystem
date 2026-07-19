import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      <div className="h-12 w-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
        <Icon size={24} aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
