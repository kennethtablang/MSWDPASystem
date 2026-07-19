import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../../shared/components/Modal';
import { Button, Badge, EmptyState, Tabs, SkeletonTable } from '../../shared/components/ui';
import {
  CONTENT_STATUS,
  CONTENT_TYPES,
  useContentItems,
  useDeleteContentItem,
} from '../../shared/hooks/useContent';
import ContentItemForm from './ContentItemForm';

const dateFmt = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const TABS = [
  { id: 'announcement', label: 'Announcements', type: CONTENT_TYPES.announcement, archive: '/announcements' },
  { id: 'news', label: 'News & Events', type: CONTENT_TYPES.news, archive: '/news' },
  { id: 'faq', label: 'FAQs', type: CONTENT_TYPES.faq, archive: '/faqs' },
];

/**
 * Shows where an item actually stands, which the raw status alone does not:
 * a Published item can still be scheduled for the future or already expired.
 */
function StatusBadge({ item }) {
  if (item.status === CONTENT_STATUS.draft) return <Badge tone="gray">Draft</Badge>;
  if (item.isLive) return <Badge tone="emerald">Live</Badge>;

  const publishAt = item.publishAt ? new Date(item.publishAt) : null;
  if (publishAt && publishAt > new Date()) return <Badge tone="gold">Scheduled</Badge>;
  return <Badge tone="outline">Expired</Badge>;
}

export default function ContentManagementPage() {
  const [tabId, setTabId] = useState('announcement');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // item object, or {} for a new one
  const [confirmDelete, setConfirmDelete] = useState(null);

  const tab = TABS.find((t) => t.id === tabId) ?? TABS[0];
  const { data, isPending } = useContentItems({ type: tab.type, search, pageSize: 50 });
  const deleteItem = useDeleteContentItem();

  const items = data?.items ?? [];
  const isFaq = tab.type === CONTENT_TYPES.faq;

  const onDelete = async () => {
    try {
      await deleteItem.mutateAsync(confirmDelete.id);
      toast.success('Removed from the public site.');
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Could not remove the item.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Page Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            Announcements, news, and FAQs shown on the public website. Drafts are never visible to
            the public.
          </p>
        </div>
        <Button onClick={() => setEditing({})}>
          <Plus size={16} aria-hidden="true" />
          New {isFaq ? 'FAQ' : tab.label.replace(' & Events', '')}
        </Button>
      </div>

      <Tabs
        tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
        active={tabId}
        onChange={setTabId}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-56 max-w-sm">
          <Search
            size={16}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or body"
            aria-label={`Search ${tab.label}`}
            className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-100 pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <Link
          to={tab.archive}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
        >
          View public page
          <ExternalLink size={14} aria-hidden="true" />
        </Link>
      </div>

      {isPending ? (
        <SkeletonTable rows={5} />
      ) : items.length === 0 ? (
        <EmptyState
          title={search ? 'No matching items' : `No ${tab.label.toLowerCase()} yet`}
          description={
            search
              ? 'Try a different search term.'
              : 'Create the first item — it stays a draft until you publish it.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-100 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  {isFaq && <th scope="col" className="px-4 py-3 w-16">Order</th>}
                  <th scope="col" className="px-4 py-3">{isFaq ? 'Question' : 'Title'}</th>
                  <th scope="col" className="px-4 py-3 w-32">Status</th>
                  {!isFaq && <th scope="col" className="px-4 py-3 w-36">Published</th>}
                  <th scope="col" className="px-4 py-3 w-36">Expires</th>
                  <th scope="col" className="px-4 py-3 w-40">Last edited by</th>
                  <th scope="col" className="px-4 py-3 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    {isFaq && (
                      <td className="px-4 py-3 tabular-nums text-gray-500">{item.sortOrder}</td>
                    )}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{item.body}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge item={item} /></td>
                    {!isFaq && (
                      <td className="px-4 py-3 text-gray-600">
                        {item.publishAt ? dateFmt.format(new Date(item.publishAt)) : '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-600">
                      {item.expiresAt ? dateFmt.format(new Date(item.expiresAt)) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {item.updatedByName ?? item.createdByName ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(item)}
                          aria-label={`Edit ${item.title}`}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary-700 transition-colors"
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(item)}
                          aria-label={`Remove ${item.title}`}
                          className="rounded-lg p-2 text-gray-500 hover:bg-accent-50 hover:text-accent-700 transition-colors"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        size="lg"
        title={editing?.id ? 'Edit item' : `New ${tab.label.replace(' & Events', '')}`}
      >
        {editing && (
          <ContentItemForm
            item={editing}
            type={tab.type}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        size="sm"
        title="Remove from the public site?"
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          &ldquo;{confirmDelete?.title}&rdquo; will stop appearing on the website immediately. The
          record is kept in the audit trail and can be restored by an administrator.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleteItem.isPending} onClick={onDelete}>
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}
