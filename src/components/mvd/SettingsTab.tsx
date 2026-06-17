import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import PhotoInput from './PhotoInput';
import * as api from '@/lib/api';

interface SettingsRow {
  id: number;
  department_name: string;
  region: string;
  logo_url: string;
  theme: string;
}

const SettingsTab = () => {
  const [form, setForm] = useState<Partial<SettingsRow>>({});
  const [saved, setSaved] = useState(false);

  const load = async () => {
    const rows = await api.list<SettingsRow>('settings');
    if (rows[0]) setForm(rows[0]);
  };
  useEffect(() => { load(); }, []);
  const set = (k: keyof SettingsRow, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    await api.update('settings', form as api.Row);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>
  );

  return (
    <div className="animate-fade-in mx-auto max-w-2xl">
      <h2 className="mb-5 font-display text-2xl text-primary">Настройки системы</h2>
      <div className="grid gap-5 border border-border bg-card p-6">
        <div className="flex items-center gap-6">
          <PhotoInput value={form.logo_url || ''} onChange={(v) => set('logo_url', v)} className="h-24 w-24" />
          <div className="text-sm text-muted-foreground">Эмблема ведомства — отображается в шапке системы.</div>
        </div>
        <Field label="Наименование ведомства"><Input value={form.department_name || ''} onChange={(e) => set('department_name', e.target.value)} /></Field>
        <Field label="Регион / отдел"><Input value={form.region || ''} onChange={(e) => set('region', e.target.value)} /></Field>
        <div>
          <Button onClick={save}>
            <Icon name={saved ? 'Check' : 'Save'} size={16} className="mr-2" />
            {saved ? 'Сохранено' : 'Сохранить настройки'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
