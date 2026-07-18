import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';
import api from '../../shared/utils/api';
import Modal from '../../shared/components/Modal';
import DataTable from '../../shared/components/DataTable';

const programSchema = z.object({
  name: z.string().min(1, 'Required').max(200),
  description: z.string().max(500).optional().or(z.literal('')),
  code: z.string().max(20).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

const typeSchema = z.object({
  name: z.string().min(1, 'Required').max(200),
  description: z.string().max(500).optional().or(z.literal('')),
  welfareProgramId: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

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

export default function AdminPage() {
  const qc = useQueryClient();
  const [programModal, setProgramModal] = useState(false);
  const [typeModal, setTypeModal] = useState(false);
  const [editProgram, setEditProgram] = useState(null);
  const [editType, setEditType] = useState(null);

  const { data: programs = [], isLoading: loadingPrograms } = useQuery({
    queryKey: ['welfare-programs-all'],
    queryFn: () => api.get('/admin/welfare-programs', { params: { activeOnly: false } }).then(r => r.data),
  });

  const { data: types = [], isLoading: loadingTypes } = useQuery({
    queryKey: ['assistance-types-all'],
    queryFn: () => api.get('/admin/assistance-types', { params: { activeOnly: false } }).then(r => r.data),
  });

  // Program form
  const { register: regP, handleSubmit: submitP, reset: resetP, formState: { errors: errP } } = useForm({
    resolver: zodResolver(programSchema),
  });

  // Type form
  const { register: regT, handleSubmit: submitT, reset: resetT, formState: { errors: errT } } = useForm({
    resolver: zodResolver(typeSchema),
  });

  const createProgramMutation = useMutation({
    mutationFn: data => api.post('/admin/welfare-programs', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['welfare-programs-all'] }); qc.invalidateQueries({ queryKey: ['welfare-programs'] }); toast.success('Program added.'); closeProgramModal(); },
    onError: err => toast.error(err.response?.data?.message ?? 'Failed.'),
  });

  const updateProgramMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/admin/welfare-programs/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['welfare-programs-all'] }); qc.invalidateQueries({ queryKey: ['welfare-programs'] }); toast.success('Program updated.'); closeProgramModal(); },
    onError: err => toast.error(err.response?.data?.message ?? 'Failed.'),
  });

  const createTypeMutation = useMutation({
    mutationFn: data => api.post('/admin/assistance-types', { ...data, welfareProgramId: data.welfareProgramId || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistance-types-all'] }); qc.invalidateQueries({ queryKey: ['assistance-types'] }); toast.success('Type added.'); closeTypeModal(); },
    onError: err => toast.error(err.response?.data?.message ?? 'Failed.'),
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/admin/assistance-types/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistance-types-all'] }); qc.invalidateQueries({ queryKey: ['assistance-types'] }); toast.success('Type updated.'); closeTypeModal(); },
    onError: err => toast.error(err.response?.data?.message ?? 'Failed.'),
  });

  const openProgramModal = (program = null) => {
    setEditProgram(program);
    resetP(program ? { name: program.name, description: program.description ?? '', code: program.code ?? '', isActive: program.isActive } : {});
    setProgramModal(true);
  };

  const openTypeModal = (type = null) => {
    setEditType(type);
    resetT(type ? { name: type.name, description: type.description ?? '', welfareProgramId: type.welfareProgramId ?? '', isActive: type.isActive } : {});
    setTypeModal(true);
  };

  const closeProgramModal = () => { setProgramModal(false); setEditProgram(null); resetP(); };
  const closeTypeModal = () => { setTypeModal(false); setEditType(null); resetT(); };

  const onProgramSubmit = (data) => {
    if (editProgram) {
      updateProgramMutation.mutate({ id: editProgram.id, name: data.name, description: data.description || null, code: data.code || null, isActive: data.isActive ?? editProgram.isActive });
    } else {
      createProgramMutation.mutate({ name: data.name, description: data.description || null, code: data.code || null });
    }
  };

  const onTypeSubmit = (data) => {
    if (editType) {
      updateTypeMutation.mutate({ id: editType.id, name: data.name, description: data.description || null, isActive: data.isActive ?? editType.isActive });
    } else {
      createTypeMutation.mutate({ name: data.name, description: data.description || null, welfareProgramId: data.welfareProgramId || null });
    }
  };

  const StatusBadge = ({ active }) => (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );

  const programColumns = [
    { key: 'code', header: 'Code', render: v => v ? <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{v}</span> : '—' },
    { key: 'name', header: 'Program Name' },
    { key: 'description', header: 'Description', render: v => v ?? '—' },
    { key: 'isActive', header: 'Status', render: v => <StatusBadge active={v} /> },
    { key: 'id', header: '', render: (id, row) => (
      <button onClick={e => { e.stopPropagation(); openProgramModal(row); }}
        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
        <Pencil size={14} />
      </button>
    )},
  ];

  const typeColumns = [
    { key: 'name', header: 'Assistance Type' },
    { key: 'description', header: 'Description', render: v => v ?? '—' },
    { key: 'isActive', header: 'Status', render: v => <StatusBadge active={v} /> },
    { key: 'id', header: '', render: (id, row) => (
      <button onClick={e => { e.stopPropagation(); openTypeModal(row); }}
        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
        <Pencil size={14} />
      </button>
    )},
  ];

  const isProgramSaving = createProgramMutation.isPending || updateProgramMutation.isPending;
  const isTypeSaving = createTypeMutation.isPending || updateTypeMutation.isPending;

  return (
    <div className="space-y-8">
      {/* Welfare Programs */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Welfare Programs</h3>
            <p className="text-sm text-gray-500 mt-0.5">Manage the list of welfare programs</p>
          </div>
          <button onClick={() => openProgramModal()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors">
            <Plus size={15} /> Add Program
          </button>
        </div>
        <DataTable columns={programColumns} data={programs} loading={loadingPrograms} keyField="id" emptyMessage="No welfare programs defined." />
      </section>

      {/* Assistance Types */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Assistance Types</h3>
            <p className="text-sm text-gray-500 mt-0.5">Manage categories of assistance provided</p>
          </div>
          <button onClick={() => openTypeModal()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors">
            <Plus size={15} /> Add Type
          </button>
        </div>
        <DataTable columns={typeColumns} data={types} loading={loadingTypes} keyField="id" emptyMessage="No assistance types defined." />
      </section>

      {/* Program Modal */}
      <Modal isOpen={programModal} onClose={closeProgramModal} title={editProgram ? 'Edit Welfare Program' : 'Add Welfare Program'} size="sm">
        <form onSubmit={submitP(onProgramSubmit)} className="space-y-4">
          <Field label="Program Name" error={errP.name?.message}>
            <input {...regP('name')} className={inputCls} />
          </Field>
          <Field label="Code" error={errP.code?.message}>
            <input {...regP('code')} className={inputCls} placeholder="e.g. SOCPEN, PWD" />
          </Field>
          <Field label="Description" error={errP.description?.message}>
            <textarea {...regP('description')} rows={2} className={`${inputCls} resize-none`} />
          </Field>
          {editProgram && (
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...regP('isActive')} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
              Active
            </label>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeProgramModal}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isProgramSaving}
              className="px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60">
              {isProgramSaving ? 'Saving…' : editProgram ? 'Save Changes' : 'Add Program'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Type Modal */}
      <Modal isOpen={typeModal} onClose={closeTypeModal} title={editType ? 'Edit Assistance Type' : 'Add Assistance Type'} size="sm">
        <form onSubmit={submitT(onTypeSubmit)} className="space-y-4">
          <Field label="Type Name" error={errT.name?.message}>
            <input {...regT('name')} className={inputCls} />
          </Field>
          <Field label="Description" error={errT.description?.message}>
            <textarea {...regT('description')} rows={2} className={`${inputCls} resize-none`} />
          </Field>
          {!editType && (
            <Field label="Associated Program (optional)" error={errT.welfareProgramId?.message}>
              <select {...regT('welfareProgramId')} className={inputCls}>
                <option value="">None</option>
                {programs.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
          )}
          {editType && (
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...regT('isActive')} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
              Active
            </label>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeTypeModal}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isTypeSaving}
              className="px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60">
              {isTypeSaving ? 'Saving…' : editType ? 'Save Changes' : 'Add Type'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
