import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import PhotoInput from './PhotoInput';
import * as api from '@/lib/api';

interface CitizenRow {
  id: number;
  full_name: string;
  birth_date: string;
  passport: string;
  address: string;
  phone: string;
  photo_url: string;
  notes: string;
}

const empty: Partial<CitizenRow> = { full_name: '', birth_date: '', passport: '', address: '', phone: '', photo_url: '', notes: '' };

const CitizensTab = () => {
  const [rows, setRows] = useState<CitizenRow[]>([]);
  const [form, setForm] = useState<Partial<CitizenRow>>(empty);
  const [active, setActive] = useState<CitizenRow | null>(null);
  const [mode, setMode] = useState<'list' | 'edit'>('list');

  const load = async () => setRows(await api.list<CitizenRow>('citizens'));
  useEffect(() => { load(); }, []);
  const set = (k: keyof CitizenRow, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.full_name) return;
    await api.create('citizens', form as api.Row);
    setForm(empty); setMode('list'); load();
  };
  const del = async (id: number) => { await api.remove('citizens', id); setActive(null); load(); };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>
  );

  if (mode === 'edit') {
    return (
      <div className="animate-fade-in mx-auto max-w-4xl">
        <div className="border border-border bg-card p-6">
          <div className="flex gap-6">
            <PhotoInput value={form.photo_url || ''} onChange={(v) => set('photo_url', v)} />
            <div className="grid flex-1 grid-cols-2 gap-4">
              <Field label="ФИО"><Input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} /></Field>
              <Field label="Дата рождения"><Input type="date" value={form.birth_date} onChange={(e) => set('birth_date', e.target.value)} /></Field>
              <Field label="Паспорт"><Input value={form.passport} onChange={(e) => set('passport', e.target.value)} /></Field>
              <Field label="Телефон"><Input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
              <Field label="Адрес"><Input value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
            </div>
          </div>
          <div className="mt-4"><Field label="Примечания"><Textarea rows={4} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></Field></div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={save}><Icon name="Save" size={16} className="mr-2" />Сохранить личное дело</Button>
          <Button variant="outline" onClick={() => { setForm(empty); setMode('list'); }}>Отмена</Button>
        </div>
      </div>
    );
  }

  if (active) {
    const Info = ({ l, v }: { l: string; v: string }) => (
      <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{l}</div><div className="font-500">{v || '—'}</div></div>
    );
    return (
      <div className="animate-fade-in mx-auto max-w-4xl">
        <div className="no-print mb-4 flex gap-3">
          <Button variant="outline" onClick={() => setActive(null)}><Icon name="ArrowLeft" size={16} className="mr-2" />Назад</Button>
          <Button onClick={() => window.print()}><Icon name="Printer" size={16} className="mr-2" />Печать</Button>
          <Button variant="destructive" onClick={() => del(active.id)}><Icon name="Trash2" size={16} className="mr-2" />Удалить</Button>
        </div>
        <div className="print-area border border-border bg-white p-8">
          <div className="mb-6 border-b-2 border-primary pb-4 text-center">
            <div className="font-display text-sm uppercase tracking-widest text-muted-foreground">Личное дело гражданина</div>
            <h1 className="font-display text-2xl font-700 text-primary">{active.full_name}</h1>
          </div>
          <div className="flex gap-6">
            <div className="h-44 w-36 shrink-0 overflow-hidden border border-border bg-muted">
              {active.photo_url ? <img src={active.photo_url} className="h-full w-full object-cover" alt="" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Icon name="User" size={40} /></div>}
            </div>
            <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3">
              <Info l="Дата рождения" v={active.birth_date} />
              <Info l="Паспорт" v={active.passport} />
              <Info l="Телефон" v={active.phone} />
              <Info l="Адрес" v={active.address} />
            </div>
          </div>
          <div className="mt-6">
            <div className="font-display text-xs uppercase tracking-wide text-muted-foreground">Примечания</div>
            <p className="mt-1 whitespace-pre-wrap border-l-2 border-accent pl-3 text-sm leading-relaxed">{active.notes || '—'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl text-primary">Личные дела граждан</h2>
        <Button onClick={() => setMode('edit')}><Icon name="UserPlus" size={16} className="mr-2" />Завести дело</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((c) => (
          <button key={c.id} onClick={() => setActive(c)} className="flex items-center gap-4 border border-border bg-card p-3 text-left transition hover:shadow-md">
            <div className="h-16 w-14 shrink-0 overflow-hidden bg-muted">
              {c.photo_url ? <img src={c.photo_url} className="h-full w-full object-cover" alt="" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Icon name="User" size={20} /></div>}
            </div>
            <div className="flex-1">
              <div className="font-display text-lg text-primary">{c.full_name}</div>
              <div className="text-sm text-muted-foreground">{c.passport || 'паспорт не указан'}</div>
            </div>
          </button>
        ))}
        {rows.length === 0 && <p className="col-span-full py-12 text-center text-muted-foreground">Личных дел пока нет.</p>}
      </div>
    </div>
  );
};

export default CitizensTab;
