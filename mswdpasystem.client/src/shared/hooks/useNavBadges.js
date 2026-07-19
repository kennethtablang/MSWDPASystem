import { useQueries } from '@tanstack/react-query';
import api from '../utils/api';

/**
 * Live counters shown beside sidebar items.
 *
 * Each query is gated on the caller's role so a request is never fired for an
 * endpoint the user would get a 403 from — an unauthorised call would show up in
 * the audit trail as a failed access attempt rather than as a badge.
 */
const STAFF = ['Admin', 'MSWDStaff', 'HeadCoordinator'];

export default function useNavBadges(role) {
  const isStaff = STAFF.includes(role);
  const canSeeDuplicates = role === 'Admin' || role === 'HeadCoordinator';

  const results = useQueries({
    queries: [
      {
        queryKey: ['notifications'],
        queryFn: () => api.get('/notifications').then((r) => r.data),
        enabled: !!role,
        refetchInterval: 60_000,
        staleTime: 30_000,
      },
      {
        queryKey: ['messages', 'inbox'],
        queryFn: () => api.get('/messages/inbox').then((r) => r.data),
        enabled: isStaff,
        refetchInterval: 120_000,
        staleTime: 60_000,
      },
      {
        queryKey: ['duplicate-flags', 'Pending'],
        queryFn: () => api.get('/duplicate-flags', { params: { status: 'Pending' } }).then((r) => r.data),
        enabled: canSeeDuplicates,
        refetchInterval: 120_000,
        staleTime: 60_000,
      },
      {
        queryKey: ['assistance-requests', 'Submitted'],
        // Only the count is needed, so ask for the smallest page the API will return.
        queryFn: () => api.get('/assistance', { params: { status: 'Submitted', page: 1, pageSize: 1 } })
          .then((r) => r.data),
        enabled: isStaff,
        refetchInterval: 120_000,
        staleTime: 60_000,
      },
    ],
  });

  const [notifications, messages, duplicates, requests] = results;

  const countUnread = (list) =>
    Array.isArray(list) ? list.filter((x) => !x.isRead).length : 0;

  return {
    unreadNotifications: countUnread(notifications.data),
    unreadMessages: countUnread(messages.data),
    pendingDuplicates: Array.isArray(duplicates.data) ? duplicates.data.length : 0,
    pendingRequests: requests.data?.totalCount ?? 0,
  };
}
