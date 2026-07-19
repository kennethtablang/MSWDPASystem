import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell, Palette, Workflow, ShieldCheck, RotateCcw,
} from 'lucide-react';
import api from '../../shared/utils/api';
import notify from '../../shared/utils/notify';
import { Card, CardBody } from '../../shared/components/ui';
import Button from '../../shared/components/ui/Button';
import Tabs from '../../shared/components/ui/Tabs';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import useUnsavedChangesWarning from '../../shared/hooks/useUnsavedChangesWarning';
import {
  applyFontScale, applyTheme, applyDensity,
  FONT_SCALES, THEMES, DENSITIES,
} from '../../shared/utils/appearance';

const TABS = [
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'workflow', label: 'Workflow', icon: Workflow },
  { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
];

const LANDING_PAGES = [
  { value: '/dashboard', label: 'Dashboard', roles: ['Admin', 'MSWDStaff', 'HeadCoordinator'] },
  { value: '/beneficiaries', label: 'Beneficiaries', roles: ['Admin', 'MSWDStaff', 'HeadCoordinator'] },
  { value: '/assistance', label: 'Assistance Requests', roles: ['Admin', 'MSWDStaff', 'HeadCoordinator'] },
  { value: '/verification', label: 'QR Verification', roles: ['Admin', 'MSWDStaff'] },
  { value: '/households', label: 'Households', roles: ['Admin', 'MSWDStaff', 'HeadCoordinator'] },
  { value: '/messages', label: 'Messages', roles: ['Admin', 'MSWDStaff', 'HeadCoordinator'] },
  { value: '/portal', label: 'My Dashboard', roles: ['Citizen'] },
];

const PAGE_SIZES = [10, 20, 50, 100];

/** How the application behaves for you. Identity lives in My Account. */
export default function SettingsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('notifications');
  // null until the user edits something; the saved copy shows through until then,
  // so no effect is needed to seed this from the server response.
  const [draft, setDraft] = useState(null);

  const { data: account, isLoading } = useQuery({
    queryKey: ['my-account'],
    queryFn: () => api.get('/account').then((r) => r.data),
  });

  const { data: config } = useQuery({
    queryKey: ['app-config'],
    queryFn: () => api.get('/system-settings/app-config').then((r) => r.data),
  });

  const prefs = draft ?? account?.preferences ?? null;

  const mutation = useMutation({
    mutationFn: (data) => api.put('/account/preferences', data).then((r) => r.data),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['my-account'] });
      // Applied from the server's response rather than the local draft, so a value
      // the server rejected and replaced is what actually takes effect.
      applyFontScale(saved.fontScale);
      applyTheme(saved.theme);
      applyDensity(saved.density);
      setDraft(null);   // saved copy is now the source of truth again
      notify.success('Settings saved.');
    },
    onError: (err) => notify.error(err, 'Could not save your settings'),
  });

  const dirty = !!prefs && !!account
    && JSON.stringify(prefs) !== JSON.stringify(account.preferences);

  // The settings page is itself a form worth protecting — and it is where this
  // behaviour is switched on, so it doubles as a demonstration of it.
  useUnsavedChangesWarning(dirty);

  if (isLoading || !prefs) return <LoadingSpinner />;

  const set = (patch) => setDraft({ ...prefs, ...patch });

  // Previewed live so the effect is visible before committing.
  const setTheme = (v) => { set({ theme: v }); applyTheme(v); };
  const setFont = (v) => { set({ fontScale: v }); applyFontScale(v); };
  const setDensity = (v) => { set({ density: v }); applyDensity(v); };

  const revert = () => {
    setDraft(null);
    applyTheme(account.preferences.theme);
    applyFontScale(account.preferences.fontScale);
    applyDensity(account.preferences.density);
  };

  const landingOptions = LANDING_PAGES.filter((p) => p.roles.includes(account.role));

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Settings</h3>
        <p className="text-sm text-gray-500">
          How the system behaves for you. These apply to your account only and follow you between devices.
        </p>
      </div>

      <Card>
        <Tabs tabs={TABS} active={tab} onChange={setTab} className="px-3 pt-1" />
        <CardBody>
          {tab === 'notifications' && (
            <Section title="What you are told about">
              <Toggle
                checked={prefs.notifyOnAssistanceStatus}
                onChange={(v) => set({ notifyOnAssistanceStatus: v })}
                label="Assistance status updates"
                description="When a request you filed or reviewed changes status."
              />
              <Toggle
                checked={prefs.notifyOnNewMessage}
                onChange={(v) => set({ notifyOnNewMessage: v })}
                label="New messages"
                description="When another staff member sends you an internal message."
              />
              <Toggle
                checked={prefs.notifyOnDuplicateFlag}
                onChange={(v) => set({ notifyOnDuplicateFlag: v })}
                label="Duplicate flags"
                description="When the system flags a possible duplicate registration for review."
              />
              <Toggle
                checked={prefs.showToastNotifications}
                onChange={(v) => set({ showToastNotifications: v })}
                label="Pop-up alerts"
                description="Show a message in the corner as notifications arrive. Turn off to rely on the bell alone — useful during busy distribution days."
              />
            </Section>
          )}

          {tab === 'appearance' && (
            <div className="space-y-6">
              <Section title="Theme" hint="Applied immediately so you can see the effect.">
                <Choices
                  value={prefs.theme}
                  onChange={setTheme}
                  options={THEMES.map((t) => ({ value: t.value, label: t.label }))}
                />
              </Section>

              <Section title="Text size" hint="Increases the size of all text in the system.">
                <Choices
                  value={prefs.fontScale}
                  onChange={setFont}
                  options={FONT_SCALES.map((s) => ({
                    value: s.value,
                    label: s.label,
                    preview: <span className={s.previewClass}>A</span>,
                  }))}
                />
              </Section>

              <Section title="Row spacing" hint="How much vertical space each row in a list takes.">
                <Choices
                  value={prefs.density}
                  onChange={setDensity}
                  options={DENSITIES.map((d) => ({ value: d.value, label: d.label }))}
                />
              </Section>

              <Section title="Sidebar">
                <Toggle
                  checked={prefs.sidebarCollapsedByDefault}
                  onChange={(v) => set({ sidebarCollapsedByDefault: v })}
                  label="Start with the sidebar collapsed"
                  description="Shows icons only when you sign in. Useful on smaller office monitors."
                />
              </Section>
            </div>
          )}

          {tab === 'workflow' && (
            <div className="space-y-6">
              <Section title="Where to start" hint="The page opened straight after you sign in.">
                <select
                  value={prefs.landingPage}
                  onChange={(e) => set({ landingPage: e.target.value })}
                  className={selectCls}
                >
                  {landingOptions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </Section>

              <Section title="Rows per page" hint="How many records each list shows before paging.">
                <Choices
                  value={prefs.defaultPageSize}
                  onChange={(v) => set({ defaultPageSize: Number(v) })}
                  options={PAGE_SIZES.map((n) => ({ value: n, label: String(n) }))}
                />
              </Section>

              <Section
                title="Default barangay"
                hint="Pre-applies this barangay filter on lists and reports. For staff assigned to a single barangay."
              >
                <select
                  value={prefs.defaultBarangay ?? ''}
                  onChange={(e) => set({ defaultBarangay: e.target.value || null })}
                  className={selectCls}
                >
                  <option value="">All barangays</option>
                  {(config?.barangays ?? []).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </Section>

              <Section title="QR verification">
                <Toggle
                  checked={prefs.autoStartQrCamera}
                  onChange={(v) => set({ autoStartQrCamera: v })}
                  label="Start the camera automatically"
                  description="Opens the camera as soon as the verification page loads, so there is no button to press between clients. Only worth enabling on a machine with a working camera."
                />
              </Section>
            </div>
          )}

          {tab === 'privacy' && (
            <Section title="Protecting what is on your screen">
              <Toggle
                checked={prefs.maskSensitiveData}
                onChange={(v) => set({ maskSensitiveData: v })}
                label="Hide contact numbers and income until revealed"
                description="Front desks are overlooked by the queue. This data is protected under RA 10173, and hiding it by default keeps it off a screen a stranger can read over your shoulder."
              />
              <Toggle
                checked={prefs.confirmBeforeLeaving}
                onChange={(v) => set({ confirmBeforeLeaving: v })}
                label="Warn me about unsaved changes"
                description="Asks for confirmation before leaving a form with edits you have not saved."
              />
            </Section>
          )}
        </CardBody>

        <div className="flex items-center gap-3 border-t border-gray-100 px-5 py-3.5">
          {dirty && <p className="text-xs text-gold-700">You have unsaved changes.</p>}
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={revert} disabled={!dirty || mutation.isPending}>
              <RotateCcw size={14} className="mr-1.5" /> Revert
            </Button>
            <Button onClick={() => mutation.mutate(prefs)} loading={mutation.isPending} disabled={!dirty}>
              Save settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

const selectCls =
  'w-full max-w-sm rounded-lg border border-gray-300 bg-white dark:bg-gray-100 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500';

function Section({ title, hint, children }) {
  return (
    <div>
      <h4 className="mb-1 text-sm font-semibold text-gray-800">{title}</h4>
      {hint && <p className="mb-3 text-xs text-gray-500">{hint}</p>}
      <div>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border-b border-gray-100 py-3 last:border-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
      />
      <span>
        <span className="block text-sm font-medium text-gray-800">{label}</span>
        <span className="block text-xs text-gray-500">{description}</span>
      </span>
    </label>
  );
}

function Choices({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'border-primary-600 bg-primary-50 text-primary-800 dark:text-primary-300'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {o.preview && <span className="mr-2">{o.preview}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
