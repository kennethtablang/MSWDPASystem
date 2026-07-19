import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, HelpCircle, Info, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/utils/api';
import { Card, CardBody } from '../../shared/components/ui';
import Tabs from '../../shared/components/ui/Tabs';
import Accordion from '../../shared/components/ui/Accordion';
import { GUIDES, FAQS, ABOUT } from './helpContent';

const TABS = [
  { id: 'guide', label: 'User guide', icon: BookOpen },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'about', label: 'About', icon: Info },
];

function GuideTab({ role }) {
  const guides = GUIDES.filter((g) => g.roles.includes(role));

  const items = guides.map((g) => ({
    id: g.id,
    title: g.title,
    content: (
      <ol className="list-decimal space-y-2 pl-5 marker:text-gray-400">
        {g.steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    ),
  }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Step-by-step walkthroughs for the tasks available to your role
        {role ? <> (<span className="font-medium text-gray-800">{role}</span>)</> : null}.
      </p>
      {items.length > 0
        ? <Accordion items={items} defaultOpenId={items[0].id} />
        : <p className="text-sm text-gray-400">No walkthroughs are available for your role yet.</p>}
    </div>
  );
}

function FaqTab() {
  return (
    <Accordion
      items={FAQS.map((f, i) => ({ id: `faq-${i}`, title: f.q, content: f.a }))}
    />
  );
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-gray-400 sm:w-56 shrink-0 pt-0.5">{label}</dt>
      <dd className="text-sm text-gray-800">{value}</dd>
    </div>
  );
}

function AboutTab({ config }) {
  return (
    <div className="space-y-8">
      <section>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">System</h4>
        <dl>
          <Row label="System name" value={ABOUT.systemName} />
          <Row label="Version" value={ABOUT.version} />
          <Row label="Deployed for" value={`${ABOUT.office} — ${ABOUT.location}`} />
        </dl>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Office</h4>
        <dl>
          <Row label="Office" value={config?.officeName ?? ABOUT.office} />
          <Row
            label="Address"
            value={
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" aria-hidden="true" />
                {config?.officeAddress ?? ABOUT.location}
              </span>
            }
          />
          <Row
            label="Contact"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Phone size={14} className="text-gray-400" aria-hidden="true" />
                {config?.officeContactNumber ?? '—'}
              </span>
            }
          />
          <Row
            label="Email"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" aria-hidden="true" />
                {config?.officeEmail ?? '—'}
              </span>
            }
          />
        </dl>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Research</h4>
        <dl>
          <Row label="Researcher / Developer" value={ABOUT.researcher} />
          <Row label="Institution" value={ABOUT.institution} />
          <Row label="Program" value={ABOUT.program} />
          <Row label="Development methodology" value={ABOUT.methodology} />
          <Row label="Quality framework" value={ABOUT.qualityFramework} />
        </dl>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Legal and regulatory basis</h4>
        <ul className="space-y-2">
          {ABOUT.legalAnchors.map((l) => (
            <li key={l.code} className="flex gap-3 text-sm">
              <span className="shrink-0 font-semibold text-primary-800 dark:text-primary-300 w-20">{l.code}</span>
              <span className="text-gray-600">{l.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
        This system processes personal data and is operated in accordance with the Data Privacy
        Act of 2012 (RA 10173). Access is logged and restricted to authorised personnel.
      </p>
    </div>
  );
}

export default function HelpPage() {
  const [tab, setTab] = useState('guide');
  const { user } = useAuth();

  const { data: config } = useQuery({
    queryKey: ['app-config'],
    queryFn: () => api.get('/system-settings/app-config').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Help &amp; About</h3>
        <p className="text-sm text-gray-500">
          Guides for everyday tasks, answers to common questions, and information about this system.
        </p>
      </div>

      <Card>
        <Tabs tabs={TABS} active={tab} onChange={setTab} className="px-3 pt-1" />
        <CardBody>
          {tab === 'guide' && <GuideTab role={user?.role} />}
          {tab === 'faq' && <FaqTab />}
          {tab === 'about' && <AboutTab config={config} />}
        </CardBody>
      </Card>
    </div>
  );
}
