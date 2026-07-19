import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus, Trash2, AlertTriangle } from 'lucide-react';
import api from '../../shared/utils/api';
import DataTable from '../../shared/components/DataTable';
import Modal from '../../shared/components/Modal';
import StatusBadge from '../../shared/components/StatusBadge';
import Pagination from '../../shared/components/Pagination';
import usePreferences from '../../shared/hooks/usePreferences';

const schema = z.object({
  userName: z.string().min(3, 'Minimum 3 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain a digit')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  role: z.enum(['Admin', 'MSWDStaff', 'HeadCoordinator']),
});

const columns = [
  { key: 'fullName', header: 'Full Name' },
  { key: 'userName', header: 'Username' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', render: v => (
    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700">{v}</span>
  )},
  { key: 'isActive', header: 'Status', render: v => (
    <StatusBadge status={v ? 'Active' : 'Inactive'} />
  )},
  { key: 'lastLoginAt', header: 'Last Login', render: v =>
    v ? new Date(v).toLocaleDateString('en-PH') : 'Never'
  },
];

export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pageSize = usePreferences().defaultPageSize;

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, pageSize],
    queryFn: () => api.get('/users', { params: { page, pageSize, search: search || undefined } }).then(r => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'MSWDStaff' },
  });

  const createMutation = useMutation({
    mutationFn: data => api.post('/users', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully.');
      setModalOpen(false);
      reset();
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Failed to create user.'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/users/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated.');
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Update failed.'),
  });

  // FR-1.4: the server refuses to delete an account that carries system activity
  // and explains why, so the error message is surfaced verbatim.
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User account deleted.');
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Delete failed.', { duration: 8000 }),
  });

  const columnsWithActions = [
    ...columns,
    {
      key: 'id', header: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={e => { e.stopPropagation(); toggleMutation.mutate({ id, fullName: row.fullName, email: row.email, role: row.role, isActive: !row.isActive }); }}
            className={`text-xs font-medium px-2.5 py-1 rounded transition-colors ${
              row.isActive
                ? 'bg-accent-50 text-accent-600 hover:bg-accent-100'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={e => { e.stopPropagation(); setDeleteTarget(row); }}
            aria-label={`Delete ${row.fullName}`}
            title="Delete account"
            className="rounded p-1 text-gray-400 transition-colors hover:bg-accent-50 hover:text-accent-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">System Users</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage staff accounts and role assignments</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white text-sm font-medium rounded-lg hover:bg-primary-800 transition-colors"
        >
          <UserPlus size={16} /> Add User
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, username, or email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-100 rounded-xl border border-gray-200 p-4">
        <DataTable
          columns={columnsWithActions}
          data={data?.items ?? []}
          loading={isLoading}
          keyField="id"
          emptyMessage="No users found."
        />
        <Pagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.totalCount ?? 0}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="Add New User" size="md">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
          <Field label="Full Name" error={errors.fullName?.message}>
            <input {...register('fullName')} className={inputCls} placeholder="Juan Dela Cruz" />
          </Field>
          <Field label="Username" error={errors.userName?.message}>
            <input {...register('userName')} className={inputCls} placeholder="jdelacruz" />
          </Field>
          <Field label="Email Address" error={errors.email?.message}>
            <input {...register('email')} type="email" className={inputCls} placeholder="juan@mswd-caba.gov.ph" />
          </Field>
          <Field label="Password" error={errors.password?.message}>
            <input {...register('password')} type="password" className={inputCls} />
          </Field>
          <Field label="Role" error={errors.role?.message}>
            <select {...register('role')} className={inputCls}>
              <option value="MSWDStaff">MSWD Staff</option>
              <option value="HeadCoordinator">Head Coordinator</option>
              <option value="Admin">Admin</option>
            </select>
          </Field>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setModalOpen(false); reset(); }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || createMutation.isPending}
              className="px-4 py-2 text-sm text-white bg-primary-700 rounded-lg hover:bg-primary-800 disabled:opacity-60">
              {createMutation.isPending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* FR-1.4 confirmation. Deactivation is presented as the preferred action
          because it is what the office actually wants in almost every case. */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete user account"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-3 rounded-lg border border-accent-200 bg-accent-50 p-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-accent-600" />
            <p className="text-sm text-accent-800">
              This permanently removes <strong>{deleteTarget?.fullName}</strong> ({deleteTarget?.userName}).
              It cannot be undone.
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Accounts that have registered beneficiaries, decided requests, sent messages or
            produced audit entries <strong>cannot</strong> be deleted — the audit trail would
            lose its subject. For anyone who has worked in the system, deactivate instead.
          </p>

          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {deleteTarget?.isActive && (
              <button
                onClick={() => {
                  toggleMutation.mutate({
                    id: deleteTarget.id,
                    fullName: deleteTarget.fullName,
                    email: deleteTarget.email,
                    role: deleteTarget.role,
                    isActive: false,
                  });
                  setDeleteTarget(null);
                }}
                className="rounded-lg bg-primary-700 px-4 py-2 text-sm text-white hover:bg-primary-800"
              >
                Deactivate instead
              </button>
            )}
            <button
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
              className="rounded-lg bg-accent-600 px-4 py-2 text-sm text-white hover:bg-accent-700 disabled:opacity-60"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-accent-600">{error}</p>}
    </div>
  );
}
