import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Header({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 60_000,
  });

  const unread = notifications.filter(n => !n.isRead);

  const markReadMutation = useMutation({
    mutationFn: (ids) => api.post('/notifications/mark-read', { ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleOpen = () => {
    setOpen(v => !v);
  };

  const handleMarkAllRead = () => {
    if (unread.length === 0) return;
    markReadMutation.mutate(null);
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) markReadMutation.mutate([n.id]);
    if (n.relatedEntityType === 'AssistanceRequest' && n.relatedEntityId)
      navigate(`/assistance/${n.relatedEntityId}`);
    else if (n.relatedEntityType === 'Beneficiary' && n.relatedEntityId)
      navigate(`/beneficiaries/${n.relatedEntityId}`);
    setOpen(false);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-4">

        {/* Notification bell */}
        <div className="relative" ref={ref}>
          <button
            onClick={handleOpen}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} />
            {unread.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {unread.length > 9 ? '9+' : unread.length}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">Notifications</p>
                {unread.length > 0 && (
                  <button onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 px-4 py-6 text-center">No notifications.</p>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.isRead && <span className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                        <div className={!n.isRead ? '' : 'ml-4'}>
                          <p className="text-sm font-medium text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.createdAt).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-semibold">
            {user?.fullName?.charAt(0) ?? 'U'}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.fullName}</span>
        </div>
      </div>
    </header>
  );
}
