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
import LoginScreen from '@/components/mvd/LoginScreen';
import SearchTab from '@/components/mvd/SearchTab';
import FaceComposer from '@/components/mvd/FaceComposer';

const TABS = [
  { id: 'cases', label: 'Дела', icon: 'FolderOpen' },
  { id: 'search', label: 'Поиск', icon: 'Search' },
  { id: 'wanted', label: 'Розыск', icon: 'UserSearch' },
  { id: 'face', label: 'Фоторобот', icon: 'ScanFace' },
  { id: 'officers', label: 'Сотрудники', icon: 'Users' },
  { id: 'mail', label: 'Почта', icon: 'Mail' },
  { id: 'reports', label: 'Отчёты', icon: 'FileBarChart' },
  { id: 'citizens', label: 'Личные дела', icon: 'IdCard' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' },
] as const;

const DEFAULT_LOGO = 'https://cdn.poehali.dev/projects/4f49b569-8141-4d0e-a49b-b102488ec312/files/2cea122d-1a4c-496e-a9fa-17cf85b776e2.jpg';

interface SettingsRow { department_name: string; region: string; logo_url: string }

const Index = () => {
  const [officer, setOfficer] = useState<api.Officer | null>(() => {
    const saved = localStorage.getItem('mvd_officer');
    return saved ? JSON.parse(saved) : null;
  });
  const [tab, setTab] = useState<string>('cases');
  const [settings, setSettings] = useState<SettingsRow | null>(null);

  useEffect(() => {
    if (officer) api.list<SettingsRow>('settings').then((r) => r[0] && setSettings(r[0]));
  }, [officer]);

  const logout = () => {
    localStorage.removeItem('mvd_officer');
    setOfficer(null);
  };

  if (!officer) return <LoginScreen onLogin={setOfficer} />;

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
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <div className="font-500">{officer.full_name}</div>
              <div className="text-xs text-primary-foreground/60">{officer.rank || officer.position || 'Сотрудник'}</div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 border border-primary-foreground/30 px-3 py-2 text-sm transition hover:bg-primary-foreground/10">
              <Icon name="LogOut" size={16} />
              Выход
            </button>
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
        {tab === 'search' && <SearchTab />}
        {tab === 'wanted' && <WantedTab />}
        {tab === 'face' && <FaceComposer onSaved={() => setTab('wanted')} />}
        {tab === 'officers' && <OfficersTab />}
        {tab === 'mail' && <MailTab />}
        {tab === 'reports' && <ReportsTab />}
        {tab === 'citizens' && <CitizensTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
};

export default Index;