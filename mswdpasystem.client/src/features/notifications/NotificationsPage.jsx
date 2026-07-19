import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Check, Bell } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../shared/utils/api';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

const TYPE_BADGE = {
  AssistanceStatusChange: 'bg-primary-100 text-primary-700',
  QrScanConfirmation: 'bg-cyan-100 text-cyan-700',
  DuplicateFlag: 'bg-gold-100 text-gold-700',
  SystemAlert: 'bg-accent-100 text-accent-700',
  NewMessage: 'bg-purple-100 text-purple-700',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (ids) => api.post('/notifications/mark-read', { ids }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Marked as read.');
    },
  });

  const unread = notifications.filter(n => !n.isRead);

  const handleClick = (n) => {
    if (!n.isRead) markReadMutation.mutate([n.id]);
    if (n.relatedEntityType === 'AssistanceRequest' && n.relatedEntityId)
      navigate(`/assistance/${n.relatedEntityId}`);
    else if (n.relatedEntityType === 'Beneficiary' && n.relatedEntityId)
      navigate(`/beneficiaries/${n.relatedEntityId}`);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {unread.length > 0 ? `${unread.length} unread` : 'All caught up'}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            onClick={() => markReadMutation.mutate(null)}
            disabled={markReadMutation.isPending}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <Check size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner className="py-16" />
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <Bell size={32} className="opacity-40" />
            <p className="text-sm">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors flex items-start gap-3 ${!n.isRead ? 'bg-primary-50' : ''}`}
              >
                {!n.isRead && <span className="mt-2 w-2 h-2 bg-primary-500 rounded-full shrink-0" />}
                <div className={`flex-1 ${n.isRead ? 'ml-5' : ''}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[n.type] ?? 'bg-gray-100 text-gray-500'}`}>
                      {n.type?.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={e => { e.stopPropagation(); markReadMutation.mutate([n.id]); }}
                    className="shrink-0 text-xs text-primary-600 hover:underline mt-1"
                  >
                    Mark read
                  </button>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
