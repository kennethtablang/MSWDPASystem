import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RotateCcw, Building2, SlidersHorizontal } from 'lucide-react';
import api from '../../shared/utils/api';
import { Card, CardHeader, CardBody } from '../../shared/components/ui';
import Button from '../../shared/components/ui/Button';
import FormField, { Input, Textarea } from '../../shared/components/ui/FormField';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

const CATEGORY_ICONS = {
  'Office Identity': Building2,
  'Operational Limits': SlidersHorizontal,
};

/** Renders the right control for a setting's declared data type. */
function SettingControl({ setting, value, onChange }) {
  const common = {
    id: setting.key,
    value: value ?? '',
    onChange: (e) => onChange(setting.key, e.target.value),
  };

  if (setting.dataType === 'MultilineText') return <Textarea rows={2} {...common} />;
  if (setting.dataType === 'List') return <Textarea rows={3} {...common} />;
  if (setting.dataType === 'Integer' || setting.dataType === 'Decimal') {
    return (
      <Input
        type="number"
        step={setting.dataType === 'Decimal' ? '0.01' : '1'}
        min="0"
        className="max-w-48"
        {...common}
      />
    );
  }
  return <Input type="text" {...common} />;
}

export default function SystemParametersPage() {
  const qc = useQueryClient();
  // Holds only the user's unsaved edits, keyed by setting key; saved values
  // come straight from the query so no state seeding is needed.
  const [edits, setEdits] = useState({});

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => api.get('/system-settings').then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: (settings) => api.put('/system-settings', { settings }),
    onSuccess: () => {
      setEdits({});
      qc.invalidateQueries({ queryKey: ['system-settings'] });
      qc.invalidateQueries({ queryKey: ['app-config'] });
      toast.success('System parameters saved.');
    },
    onError: (err) => {
      const data = err.response?.data;
      toast.error(data?.errors?.[0] ?? data?.message ?? 'Could not save system parameters.');
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const handleChange = (key, value) => setEdits((v) => ({ ...v, [key]: value }));

  const allSettings = groups.flatMap((g) => g.settings);
  const effectiveValue = (s) => (edits[s.key] !== undefined ? edits[s.key] : s.value);
  const isDirty = allSettings.some((s) => effectiveValue(s) !== s.value);

  const resetToSaved = () => setEdits({});

  const resetOne = (setting) => handleChange(setting.key, setting.defaultValue);

  const saveAll = () => {
    const settings = {};
    allSettings.forEach((s) => { settings[s.key] = effectiveValue(s); });
    mutation.mutate(settings);
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-gray-900">System Parameters</h3>
          <p className="text-sm text-gray-500">
            Configuration applied across the whole system. Changes take effect immediately.
          </p>
        </div>
        <div className="flex gap-2">
          {isDirty && (
            <Button variant="outline" onClick={resetToSaved}>Discard changes</Button>
          )}
          <Button onClick={saveAll} loading={mutation.isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </div>

      {groups.map((group) => {
        const Icon = CATEGORY_ICONS[group.category];
        return (
          <Card key={group.category}>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  {Icon && <Icon size={16} className="text-gray-400" aria-hidden="true" />}
                  {group.category}
                </span>
              }
            />
            <CardBody className="space-y-5">
              {group.settings.map((s) => {
                const current = effectiveValue(s);
                const changed = current !== s.value;
                const isDefault = current === s.defaultValue;
                return (
                  <FormField
                    key={s.key}
                    label={
                      <span className="inline-flex items-center gap-2">
                        {s.label}
                        {changed && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-gold-700 bg-gold-50 px-1.5 py-0.5 rounded">
                            unsaved
                          </span>
                        )}
                      </span>
                    }
                    htmlFor={s.key}
                    hint={s.description}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <SettingControl setting={s} value={current} onChange={handleChange} />
                      </div>
                      {!isDefault && (
                        <button
                          type="button"
                          onClick={() => resetOne(s)}
                          title="Restore default"
                          aria-label={`Restore default for ${s.label}`}
                          className="mt-1.5 p-1.5 text-gray-400 hover:text-primary-700 transition-colors"
                        >
                          <RotateCcw size={15} />
                        </button>
                      )}
                    </div>
                  </FormField>
                );
              })}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
