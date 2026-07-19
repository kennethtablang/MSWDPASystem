import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Home, UserPlus, UserMinus, Search } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/utils/api';
import { Card, CardHeader, CardBody } from '../../shared/components/ui';
import Button from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/FormField';
import StatusBadge from '../../shared/components/StatusBadge';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import Modal from '../../shared/components/Modal';
import ConfirmDialog from '../../shared/components/ConfirmDialog';

export default function HouseholdDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const canManage = user?.role === 'MSWDStaff' || user?.role === 'Admin';

  const [assignOpen, setAssignOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [removeTarget, setRemoveTarget] = useState(null);

  const { data: hh, isLoading } = useQuery({
    queryKey: ['household', id],
    queryFn: () => api.get(`/households/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: searchResults, isFetching } = useQuery({
    queryKey: ['beneficiary-search', search],
    queryFn: () => api.get('/beneficiaries', { params: { search: search || undefined, pageSize: 8 } }).then((r) => r.data.items),
    enabled: assignOpen && search.trim().length >= 2,
  });

  const assignMutation = useMutation({
    mutationFn: (beneficiaryId) => api.put(`/households/${id}/members/${beneficiaryId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['household', id] });
      qc.invalidateQueries({ queryKey: ['households'] });
      toast.success('Beneficiary assigned to household.');
      setAssignOpen(false);
      setSearch('');
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to assign beneficiary.'),
  });

  const removeMutation = useMutation({
    mutationFn: (beneficiaryId) => api.delete(`/households/${id}/members/${beneficiaryId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['household', id] });
      qc.invalidateQueries({ queryKey: ['households'] });
      toast.success('Beneficiary removed from household.');
      setRemoveTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to remove beneficiary.'),
  });

  if (isLoading) return <LoadingSpinner className="py-24" size="lg" />;
  if (!hh) return <p className="text-gray-500 p-8">Household not found.</p>;

  const memberIds = new Set((hh.members ?? []).map((m) => m.id));

  return (
    <div className="max-w-6xl space-y-5">
      <button onClick={() => navigate('/households')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={16} /> Back to Households
      </button>

      {/* Household header */}
      <Card>
        <CardBody className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
              <Home size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-mono">{hh.householdNumber}</h2>
              <p className="text-sm text-gray-600 mt-0.5">{hh.headOfHouseholdName || 'No head of household recorded'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{hh.barangay} · {hh.address}</p>
            </div>
          </div>
          {canManage && (
            <Button variant="primary" onClick={() => setAssignOpen(true)}>
              <UserPlus size={16} /> Assign Member
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader title={`Members (${hh.members?.length ?? 0})`} subtitle="Beneficiaries belonging to this household" />
        <CardBody>
          {hh.members?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {hh.members.map((m) => (
                <div key={m.id} className="py-3 flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <button onClick={() => navigate(`/beneficiaries/${m.id}`)}
                      className="font-medium text-gray-900 hover:text-primary-700 hover:underline">
                      {m.fullName}
                    </button>
                    <p className="text-xs text-gray-400">
                      <span className="font-mono">{m.clientNumber}</span> · {m.barangay}
                    </p>
                  </div>
                  <StatusBadge status={m.status} />
                  {canManage && (
                    <button onClick={() => setRemoveTarget(m)}
                      className="p-1.5 text-gray-400 hover:text-accent-600 transition-colors" title="Remove from household">
                      <UserMinus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No members assigned yet.</p>
          )}
        </CardBody>
      </Card>

      {/* Assign modal */}
      <Modal isOpen={assignOpen} onClose={() => { setAssignOpen(false); setSearch(''); }} title="Assign Beneficiary" size="md">
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input autoFocus placeholder="Search by name or client number…" value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {search.trim().length < 2 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Type at least 2 characters to search.</p>
          ) : isFetching ? (
            <LoadingSpinner className="py-6" />
          ) : searchResults?.length > 0 ? (
            <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {searchResults.map((b) => {
                const already = memberIds.has(b.id);
                return (
                  <li key={b.id} className="py-2.5 flex items-center gap-3 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{b.fullName}</p>
                      <p className="text-xs text-gray-400"><span className="font-mono">{b.clientNumber}</span> · {b.barangay}</p>
                    </div>
                    {already ? (
                      <span className="text-xs text-gray-400">In this household</span>
                    ) : (
                      <Button size="sm" variant="secondary" loading={assignMutation.isPending && assignMutation.variables === b.id}
                        onClick={() => assignMutation.mutate(b.id)}>
                        Assign
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No beneficiaries found.</p>
          )}
        </div>
      </Modal>

      {/* Remove confirm */}
      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => removeMutation.mutate(removeTarget.id)}
        title="Remove from Household"
        message={`Remove "${removeTarget?.fullName}" from this household? Their beneficiary profile is not deleted.`}
        danger
        loading={removeMutation.isPending}
      />
    </div>
  );
}
