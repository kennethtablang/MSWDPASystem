import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

/**
 * Landing-page content: announcements, news, and FAQs.
 *
 * These numeric values mirror the server's ContentType enum and are persisted,
 * so they must not be renumbered.
 */
export const CONTENT_TYPES = {
  announcement: 1,
  news: 2,
  faq: 3,
};

export const CONTENT_STATUS = {
  draft: 1,
  published: 2,
};

export const CONTENT_TYPE_LABELS = {
  1: 'Announcement',
  2: 'News & Events',
  3: 'FAQ',
};

/** Anonymous read. Used by the landing sections and the public archive pages. */
export function usePublicContent(type, { includeExpired = false, page = 1, pageSize = 10 } = {}) {
  return useQuery({
    queryKey: ['public-content', type, includeExpired, page, pageSize],
    queryFn: () =>
      api
        .get('/public/content', { params: { type, includeExpired, page, pageSize } })
        .then((r) => r.data),
    // Landing content changes a few times a month, not a few times a minute.
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

/** Staff read. Includes drafts, scheduled, and expired items. */
export function useContentItems({ type, search, page = 1, pageSize = 20 } = {}) {
  return useQuery({
    queryKey: ['content-items', type ?? null, search ?? '', page, pageSize],
    queryFn: () =>
      api
        .get('/content', { params: { type, search: search || undefined, page, pageSize } })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

/**
 * Invalidates both the staff list and the public cache — a staff member who
 * publishes an item and then opens the landing page in the same session should
 * see it, not a five-minute-old copy.
 */
function useContentInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['content-items'] });
    queryClient.invalidateQueries({ queryKey: ['public-content'] });
  };
}

export function useSaveContentItem() {
  const invalidate = useContentInvalidation();
  return useMutation({
    mutationFn: ({ id, ...body }) =>
      id
        ? api.put(`/content/${id}`, { id, ...body }).then((r) => r.data)
        : api.post('/content', body).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useDeleteContentItem() {
  const invalidate = useContentInvalidation();
  return useMutation({
    mutationFn: (id) => api.delete(`/content/${id}`).then((r) => r.data),
    onSuccess: invalidate,
  });
}
