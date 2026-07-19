import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send, Inbox, Mail } from 'lucide-react';
import api from '../../shared/utils/api';
import Modal from '../../shared/components/Modal';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

const schema = z.object({
  recipientId: z.string().min(1, 'Select a recipient'),
  subject: z.string().min(1, 'Subject is required').max(200),
  body: z.string().min(1, 'Message body is required'),
});

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

export default function MessagesPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('inbox');
  const [selected, setSelected] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const { data: inbox = [], isLoading: loadingInbox } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: () => api.get('/messages/inbox').then(r => r.data),
    enabled: tab === 'inbox',
  });

  const { data: sent = [], isLoading: loadingSent } = useQuery({
    queryKey: ['messages', 'sent'],
    queryFn: () => api.get('/messages/sent').then(r => r.data),
    enabled: tab === 'sent',
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-all'],
    queryFn: () => api.get('/users', { params: { pageSize: 100 } }).then(r => r.data.items),
    enabled: composeOpen,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const sendMutation = useMutation({
    mutationFn: (data) => api.post('/messages', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', 'sent'] });
      toast.success('Message sent.');
      setComposeOpen(false);
      reset();
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Failed to send.'),
  });

  const messages = tab === 'inbox' ? inbox : sent;
  const isLoading = tab === 'inbox' ? loadingInbox : loadingSent;
  const unreadCount = inbox.filter(m => !m.isRead).length;

  return (
    <div className="flex h-full gap-4" style={{ minHeight: '600px' }}>
      {/* Left panel */}
      <div className="w-72 shrink-0 flex flex-col bg-white dark:bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex gap-1">
            <button onClick={() => { setTab('inbox'); setSelected(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === 'inbox' ? 'bg-primary-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Inbox size={13} /> Inbox
              {unreadCount > 0 && tab !== 'inbox' && (
                <span className="ml-1 bg-accent-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">{unreadCount}</span>
              )}
            </button>
            <button onClick={() => { setTab('sent'); setSelected(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === 'sent' ? 'bg-primary-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Send size={13} /> Sent
            </button>
          </div>
          <button onClick={() => setComposeOpen(true)}
            className="p-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors" title="Compose">
            <Mail size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? <LoadingSpinner className="py-12" /> : messages.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No messages.</p>
          ) : (
            messages.map(m => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  selected?.id === m.id ? 'bg-primary-50' : ''
                } ${tab === 'inbox' && !m.isRead ? 'bg-primary-50' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {tab === 'inbox' && !m.isRead && (
                    <span className="mt-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0" />
                  )}
                  <div className={`min-w-0 ${tab === 'inbox' && !m.isRead ? '' : 'ml-3.5'}`}>
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {tab === 'inbox' ? m.senderName : `To: ${m.recipientName}`}
                    </p>
                    <p className="text-xs text-gray-600 truncate mt-0.5">{m.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(m.createdAt).toLocaleDateString('en-PH')}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white dark:bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
        {selected ? (
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">{selected.subject}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {tab === 'inbox' ? `From: ${selected.senderName}` : `To: ${selected.recipientName}`}
                <span className="ml-3 text-xs text-gray-400">
                  {new Date(selected.createdAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.body}</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
            <Mail size={36} className="opacity-30" />
            <p className="text-sm">Select a message to read</p>
            <button onClick={() => setComposeOpen(true)}
              className="mt-2 flex items-center gap-2 px-4 py-2 text-sm text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
              <Send size={15} /> Compose Message
            </button>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <Modal isOpen={composeOpen} onClose={() => { setComposeOpen(false); reset(); }} title="New Message" size="md">
        <form onSubmit={handleSubmit(d => sendMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To <span className="text-accent-500">*</span></label>
            <select {...register('recipientId')} className={inputCls}>
              <option value="">Select recipient…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>)}
            </select>
            {errors.recipientId && <p className="mt-1 text-xs text-accent-600">{errors.recipientId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-accent-500">*</span></label>
            <input {...register('subject')} className={inputCls} />
            {errors.subject && <p className="mt-1 text-xs text-accent-600">{errors.subject.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-accent-500">*</span></label>
            <textarea {...register('body')} rows={5} className={`${inputCls} resize-none`} />
            {errors.body && <p className="mt-1 text-xs text-accent-600">{errors.body.message}</p>}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setComposeOpen(false); reset(); }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={sendMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-primary-700 rounded-lg hover:bg-primary-800 disabled:opacity-60">
              <Send size={14} /> {sendMutation.isPending ? 'Sending…' : 'Send Message'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
