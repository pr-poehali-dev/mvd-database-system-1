import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import * as api from '@/lib/api';
import CasesTab from '@/components/mvd/CasesTab';
import OfficersTab from '@/components/mvd/OfficersTab';
import MailTab from '@/components/mvd/MailTab';
import WantedTab from '@/components/mvd/WantedTab';
import ReportsTab from '@/components/mvd/ReportsTab';
import CitizensTab from '@/components/mvd/CitizensTab';
import SettingsTab from '@/components/mvd/SettingsTab';

const TABS = [
  { id: 'cases', label: 'Дела', icon: 'FolderOpen' },
  { id: 'officers', label: 'Сотрудники', icon: 'Users' },
  { id: 'mail', label: 'Почта', icon: 'Mail' },
  { id: 'wanted', label: 'Розыск', icon: 'UserSearch' },
  { id: 'reports', label: 'Отчёты', icon: 'FileBarChart' },
  { id: 'citizens', label: 'Личные дела', icon: 'IdCard' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' },
] as const;

const DEFAULT_LOGO = 'https://cdn.poehali.dev/projects/4f49b569-8141-4d0e-a49b-b102488ec312/files/2cea122d-1a4c-496e-a9fa-17cf85b776e2.jpg';

interface SettingsRow { department_name: string; region: string; logo_url: string }

const Index = () => {
  const [tab, setTab] = useState<string>('cases');
  const [settings, setSettings] = useState<SettingsRow | null>(null);

  useEffect(() => {
    api.list<SettingsRow>('settings').then((r) => r[0] && setSettings(r[0]));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print bg-primary text-primary-foreground shadow-md">
        <div className="container flex items-center gap-4 py-4">
          <img src={settings?.logo_url || DEFAULT_LOGO} alt="герб" className="h-14 w-14 rounded-sm object-cover" />
          <div>
            <h1 className="font-display text-xl font-700 uppercase tracking-wide leading-tight">
              {settings?.department_name || 'Министерство внутренних дел'}
            </h1>
            <p className="text-sm text-primary-foreground/70">
              Единая информационная система · {settings?.region || 'Центральный регион'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-primary-foreground/70">
            <Icon name="ShieldCheck" size={18} />
            <span>Защищённый доступ</span>
          </div>
        </div>
      </header>

      <nav className="no-print sticky top-0 z-10 border-b border-border bg-card shadow-sm">
        <div className="container flex flex-wrap gap-1 py-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 font-display text-sm uppercase tracking-wide transition ${
                tab === t.id
                  ? 'border-b-2 border-accent text-primary'
                  : 'border-b-2 border-transparent text-muted-foreground hover:text-primary'
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="container py-8">
        {tab === 'cases' && <CasesTab />}
        {tab === 'officers' && <OfficersTab />}
        {tab === 'mail' && <MailTab />}
        {tab === 'wanted' && <WantedTab />}
        {tab === 'reports' && <ReportsTab />}
        {tab === 'citizens' && <CitizensTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
};

export default Index;
