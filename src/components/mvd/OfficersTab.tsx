import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import * as api from '@/lib/api';

interface OfficerRow {
  id: number;
  full_name: string;
  rank: string;
  position: string;
  login: string;
  password: string;
  email: string;
}

const empty: Partial<OfficerRow> = { full_name: '', rank: '', position: '', login: '', password: '', email: '' };

const OfficersTab = () => {
  const [rows, setRows] = useState<OfficerRow[]>([]);
  const [form, setForm] = useState<Partial<OfficerRow>>(empty);
  const [show, setShow] = useState(false);

  const load = async () => setRows(await api.list<OfficerRow>('officers'));
  useEffect(() => { load(); }, []);
  const set = (k: keyof OfficerRow, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.full_name || !form.login) return;
    await api.create('officers', form as api.Row);
    setForm(empty); setShow(false); load();
  };
  const del = async (id: number) => { await api.remove('officers', id); load(); };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl text-primary">Личный состав</h2>
        <Button onClick={() => setShow((s) => !s)}><Icon name="UserPlus" size={16} className="mr-2" />Добавить сотрудника</Button>
      </div>

      {show && (
        <div className="mb-6 grid grid-cols-3 gap-4 border border-border bg-card p-6">
          <Field label="ФИО"><Input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} /></Field>
          <Field label="Звание"><Input value={form.rank} onChange={(e) => set('rank', e.target.value)} /></Field>
          <Field label="Должность"><Input value={form.position} onChange={(e) => set('position', e.target.value)} /></Field>
          <Field label="Логин"><Input value={form.login} onChange={(e) => set('login', e.target.value)} /></Field>
          <Field label="Пароль"><Input value={form.password} onChange={(e) => set('password', e.target.value)} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
          <div className="col-span-3"><Button onClick={save}><Icon name="Save" size={16} className="mr-2" />Создать учётную запись</Button></div>
        </div>
      )}

      <div className="overflow-hidden border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-primary text-primary-foreground">
            <tr className="text-left font-display uppercase tracking-wide">
              <th className="p-3">ФИО</th><th className="p-3">Звание</th><th className="p-3">Должность</th>
              <th className="p-3">Логин</th><th className="p-3">Email</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-border hover:bg-muted/40">
                <td className="p-3 font-500">{o.full_name}</td>
                <td className="p-3">{o.rank || '—'}</td>
                <td className="p-3">{o.position || '—'}</td>
                <td className="p-3 font-mono text-xs">{o.login}</td>
                <td className="p-3">{o.email || '—'}</td>
                <td className="p-3 text-right"><button onClick={() => del(o.id)} className="text-destructive hover:opacity-70"><Icon name="Trash2" size={16} /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Сотрудников пока нет.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfficersTab;
