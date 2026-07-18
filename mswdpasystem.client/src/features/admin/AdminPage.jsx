import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';
import api from '../../shared/utils/api';
import { Card, CardHeader, CardBody } from '../../shared/components/ui';
import Button from '../../shared/components/ui/Button';
import FormField, { Input, Select, Textarea } from '../../shared/components/ui/FormField';
import Modal from '../../shared/components/Modal';
import DataTable from '../../shared/components/DataTable';
import SystemMonitoring from './SystemMonitoring';

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

function StatusBadge({ active }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
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

  const { register: regP, handleSubmit: submitP, reset: resetP, formState: { errors: errP } } = useForm({
    resolver: zodResolver(programSchema),
  });

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

  const editBtn = (open, row) => (
    <button onClick={e => { e.stopPropagation(); open(row); }}
      className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors" aria-label="Edit">
      <Pencil size={14} />
    </button>
  );

  const programColumns = [
    { key: 'code', header: 'Code', render: v => v ? <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{v}</span> : '—' },
    { key: 'name', header: 'Program Name' },
    { key: 'description', header: 'Description', render: v => v ?? '—' },
    { key: 'isActive', header: 'Status', render: v => <StatusBadge active={v} /> },
    { key: 'id', header: '', render: (id, row) => editBtn(openProgramModal, row) },
  ];

  const typeColumns = [
    { key: 'name', header: 'Assistance Type' },
    { key: 'description', header: 'Description', render: v => v ?? '—' },
    { key: 'isActive', header: 'Status', render: v => <StatusBadge active={v} /> },
    { key: 'id', header: '', render: (id, row) => editBtn(openTypeModal, row) },
  ];

  const isProgramSaving = createProgramMutation.isPending || updateProgramMutation.isPending;
  const isTypeSaving = createTypeMutation.isPending || updateTypeMutation.isPending;

  return (
    <div className="space-y-8">
      {/* System Monitoring (FR-8.3 / FR-8.4) */}
      <SystemMonitoring />

      {/* Welfare Programs */}
      <Card>
        <CardHeader
          title="Welfare Programs"
          subtitle="Manage the list of welfare programs"
          actions={
            <Button size="sm" variant="primary" onClick={() => openProgramModal()}>
              <Plus size={15} /> Add Program
            </Button>
          }
        />
        <CardBody>
          <DataTable columns={programColumns} data={programs} loading={loadingPrograms} keyField="id" emptyMessage="No welfare programs defined." />
        </CardBody>
      </Card>

      {/* Assistance Types */}
      <Card>
        <CardHeader
          title="Assistance Types"
          subtitle="Manage categories of assistance provided"
          actions={
            <Button size="sm" variant="primary" onClick={() => openTypeModal()}>
              <Plus size={15} /> Add Type
            </Button>
          }
        />
        <CardBody>
          <DataTable columns={typeColumns} data={types} loading={loadingTypes} keyField="id" emptyMessage="No assistance types defined." />
        </CardBody>
      </Card>

      {/* Program Modal */}
      <Modal isOpen={programModal} onClose={closeProgramModal} title={editProgram ? 'Edit Welfare Program' : 'Add Welfare Program'} size="sm">
        <form onSubmit={submitP(onProgramSubmit)} className="space-y-4">
          <FormField label="Program Name" required error={errP.name?.message}>
            <Input {...regP('name')} error={errP.name?.message} />
          </FormField>
          <FormField label="Code" error={errP.code?.message}>
            <Input {...regP('code')} placeholder="e.g. SOCPEN, PWD" error={errP.code?.message} />
          </FormField>
          <FormField label="Description" error={errP.description?.message}>
            <Textarea {...regP('description')} rows={2} className="resize-none" error={errP.description?.message} />
          </FormField>
          {editProgram && (
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...regP('isActive')} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
              Active
            </label>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={closeProgramModal}>Cancel</Button>
            <Button type="submit" variant="primary" loading={isProgramSaving}>
              {isProgramSaving ? 'Saving…' : editProgram ? 'Save Changes' : 'Add Program'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Type Modal */}
      <Modal isOpen={typeModal} onClose={closeTypeModal} title={editType ? 'Edit Assistance Type' : 'Add Assistance Type'} size="sm">
        <form onSubmit={submitT(onTypeSubmit)} className="space-y-4">
          <FormField label="Type Name" required error={errT.name?.message}>
            <Input {...regT('name')} error={errT.name?.message} />
          </FormField>
          <FormField label="Description" error={errT.description?.message}>
            <Textarea {...regT('description')} rows={2} className="resize-none" error={errT.description?.message} />
          </FormField>
          {!editType && (
            <FormField label="Associated Program (optional)" error={errT.welfareProgramId?.message}>
              <Select {...regT('welfareProgramId')} error={errT.welfareProgramId?.message}>
                <option value="">None</option>
                {programs.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </FormField>
          )}
          {editType && (
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...regT('isActive')} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
              Active
            </label>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={closeTypeModal}>Cancel</Button>
            <Button type="submit" variant="primary" loading={isTypeSaving}>
              {isTypeSaving ? 'Saving…' : editType ? 'Save Changes' : 'Add Type'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
