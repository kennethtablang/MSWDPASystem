import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KeyRound, RotateCcw, Check } from 'lucide-react';
import api from '../../shared/utils/api';
import { Card, CardHeader, CardBody } from '../../shared/components/ui';
import Button from '../../shared/components/ui/Button';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import EmptyState from '../../shared/components/ui/EmptyState';

export default function StaffPermissionsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['staff-permissions'],
    queryFn: () => api.get('/staff-permissions').then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, modules, useDefault }) =>
      api.put(`/staff-permissions/${id}`, { modules, useDefault }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff-permissions'] });
      toast.success('Permissions updated.');
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to update permissions.'),
  });

  const toggle = (staff, moduleKey) => {
    const has = staff.allowedModules.includes(moduleKey);
    const next = has
      ? staff.allowedModules.filter((m) => m !== moduleKey)
      : [...staff.allowedModules, moduleKey];
    updateMutation.mutate({ id: staff.id, modules: next, useDefault: false });
  };

  if (isLoading) return <LoadingSpinner className="py-24" size="lg" />;

  const modules = data?.modules ?? [];
  const staff = data?.staff ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
          <KeyRound size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Staff Data-Access Permissions</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Grant or revoke module access for each MSWD Staff member based on their responsibilities.
            Restrictions are enforced across the system, not just hidden from view.
          </p>
        </div>
      </div>

      {staff.length === 0 ? (
        <EmptyState title="No staff accounts" description="There are no MSWD Staff accounts to configure yet." />
      ) : (
        staff.map((s) => {
          const busy = updateMutation.isPending && updateMutation.variables?.id === s.id;
          return (
            <Card key={s.id}>
              <CardHeader
                title={s.fullName}
                subtitle={`@${s.userName}${s.isDefault ? ' · full default access' : ' · custom access'}`}
                actions={
                  <>
                    {!s.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">Inactive</span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={busy && updateMutation.variables?.useDefault}
                      disabled={s.isDefault}
                      onClick={() => updateMutation.mutate({ id: s.id, useDefault: true })}
                    >
                      <RotateCcw size={14} /> Reset to default
                    </Button>
                  </>
                }
              />
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {modules.map((m) => {
                    const active = s.allowedModules.includes(m.key);
                    return (
                      <button
                        key={m.key}
                        onClick={() => toggle(s, m.key)}
                        disabled={busy}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-60 ${
                          active
                            ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                            : 'bg-white dark:bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                        aria-pressed={active}
                      >
                        {active && <Check size={14} />}
                        {m.label}
                      </button>
                    );
                  })}
                </div>
                {s.allowedModules.length === 0 && (
                  <p className="mt-3 text-xs text-accent-700">
                    This staff member currently has no module access and can only see their dashboard.
                  </p>
                )}
              </CardBody>
            </Card>
          );
        })
      )}
    </div>
  );
}
