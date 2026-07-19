import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, KeyRound } from 'lucide-react';
import api from '../../shared/utils/api';
import { Card, CardBody } from '../../shared/components/ui';
import Tabs from '../../shared/components/ui/Tabs';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { ProfileTab, PasswordTab } from './accountSections';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: KeyRound },
];

/** Who you are: identity and credentials. Behaviour lives in Settings. */
export default function MyAccountPage() {
  const [tab, setTab] = useState('profile');

  const { data: account, isLoading } = useQuery({
    queryKey: ['my-account'],
    queryFn: () => api.get('/account').then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!account) return null;

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900">My Account</h3>
        <p className="text-sm text-gray-500">
          Your personal details and sign-in credentials.
        </p>
      </div>

      <Card>
        <Tabs tabs={TABS} active={tab} onChange={setTab} className="px-3 pt-1" />
        <CardBody>
          {tab === 'profile' && <ProfileTab account={account} />}
          {tab === 'password' && <PasswordTab />}
        </CardBody>
      </Card>
    </div>
  );
}
