import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import api from '../../shared/utils/api';
import DataTable from '../../shared/components/DataTable';
import Modal from '../../shared/components/Modal';
import StatusBadge from '../../shared/components/StatusBadge';
import Pagination from '../../shared/components/Pagination';

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
    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">{v}</span>
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

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => api.get('/users', { params: { page, pageSize: 20, search: search || undefined } }).then(r => r.data),
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

  const columnsWithActions = [
    ...columns,
    {
      key: 'id', header: 'Actions',
      render: (id, row) => (
        <button
          onClick={e => { e.stopPropagation(); toggleMutation.mutate({ id, fullName: row.fullName, email: row.email, role: row.role, isActive: !row.isActive }); }}
          className={`text-xs font-medium px-2.5 py-1 rounded transition-colors ${
            row.isActive
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          {row.isActive ? 'Deactivate' : 'Activate'}
        </button>
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
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
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
          className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
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
          pageSize={20}
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
              className="px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60">
              {createMutation.isPending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
