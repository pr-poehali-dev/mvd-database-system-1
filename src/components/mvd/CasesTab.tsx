import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import PhotoInput from './PhotoInput';
import * as api from '@/lib/api';

interface CaseRow {
  id: number;
  case_number: string;
  title: string;
  status: string;
  article: string;
  suspect_name: string;
  photo_url: string;
  description: string;
  investigator: string;
  opened_date: string;
}

const empty: Partial<CaseRow> = {
  case_number: '', title: '', status: 'Открыто', article: '',
  suspect_name: '', photo_url: '', description: '', investigator: '', opened_date: '',
};

const CasesTab = () => {
  const [rows, setRows] = useState<CaseRow[]>([]);
  const [form, setForm] = useState<Partial<CaseRow>>(empty);
  const [active, setActive] = useState<CaseRow | null>(null);
  const [mode, setMode] = useState<'list' | 'edit'>('list');

  const load = async () => setRows(await api.list<CaseRow>('cases'));
  useEffect(() => { load(); }, []);

  const set = (k: keyof CaseRow, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title) return;
    await api.create('cases', form as api.Row);
    setForm(empty);
    setMode('list');
    load();
  };

  const del = async (id: number) => {
    await api.remove('cases', id);
    setActive(null);
    load();
  };

  if (mode === 'edit') {
    return (
      <div className="animate-fade-in mx-auto max-w-4xl">
        <FormSheet form={form} set={set} />
        <div className="mt-6 flex gap-3">
          <Button onClick={save}><Icon name="Save" size={16} className="mr-2" />Зарегистрировать дело</Button>
          <Button variant="outline" onClick={() => { setForm(empty); setMode('list'); }}>Отмена</Button>
        </div>
      </div>
    );
  }

  if (active) {
    return (
      <div className="animate-fade-in mx-auto max-w-4xl">
        <div className="no-print mb-4 flex gap-3">
          <Button variant="outline" onClick={() => setActive(null)}><Icon name="ArrowLeft" size={16} className="mr-2" />Назад</Button>
          <Button onClick={() => window.print()}><Icon name="Printer" size={16} className="mr-2" />Печать</Button>
          <Button variant="destructive" onClick={() => del(active.id)}><Icon name="Trash2" size={16} className="mr-2" />Удалить</Button>
        </div>
        <CaseSheet c={active} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl font-600 text-primary">Реестр дел</h2>
        <Button onClick={() => setMode('edit')}><Icon name="FilePlus" size={16} className="mr-2" />Оформить дело</Button>
      </div>
      <div className="grid gap-3">
        {rows.map((c) => (
          <button key={c.id} onClick={() => setActive(c)} className="flex items-center gap-4 border border-border bg-card p-3 text-left transition hover:shadow-md">
            <div className="h-16 w-14 shrink-0 overflow-hidden bg-muted">
              {c.photo_url ? <img src={c.photo_url} className="h-full w-full object-cover" alt="" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Icon name="User" size={20} /></div>}
            </div>
            <div className="flex-1">
              <div className="font-display text-lg text-primary">{c.title}</div>
              <div className="text-sm text-muted-foreground">№ {c.case_number || '—'} · {c.article || 'статья не указана'}</div>
            </div>
            <span className="border border-primary/30 bg-secondary px-3 py-1 text-xs text-primary">{c.status}</span>
          </button>
        ))}
        {rows.length === 0 && <p className="py-12 text-center text-muted-foreground">Дел пока нет. Нажмите «Оформить дело».</p>}
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>
);

const FormSheet = ({ form, set }: { form: Partial<CaseRow>; set: (k: keyof CaseRow, v: string) => void }) => (
  <div className="border border-border bg-card p-6">
    <div className="flex gap-6">
      <PhotoInput value={form.photo_url || ''} onChange={(v) => set('photo_url', v)} />
      <div className="grid flex-1 grid-cols-2 gap-4">
        <Field label="Номер дела"><Input value={form.case_number} onChange={(e) => set('case_number', e.target.value)} /></Field>
        <Field label="Статус"><Input value={form.status} onChange={(e) => set('status', e.target.value)} /></Field>
        <Field label="Наименование дела"><Input value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Статья УК"><Input value={form.article} onChange={(e) => set('article', e.target.value)} /></Field>
        <Field label="Подозреваемый"><Input value={form.suspect_name} onChange={(e) => set('suspect_name', e.target.value)} /></Field>
        <Field label="Следователь"><Input value={form.investigator} onChange={(e) => set('investigator', e.target.value)} /></Field>
        <Field label="Дата возбуждения"><Input type="date" value={form.opened_date} onChange={(e) => set('opened_date', e.target.value)} /></Field>
      </div>
    </div>
    <div className="mt-4"><Field label="Описание / фабула дела"><Textarea rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field></div>
  </div>
);

export const CaseSheet = ({ c }: { c: CaseRow }) => (
  <div className="print-area border border-border bg-white p-8 shadow-sm">
    <div className="mb-6 border-b-2 border-primary pb-4 text-center">
      <div className="font-display text-sm uppercase tracking-widest text-muted-foreground">Министерство внутренних дел</div>
      <h1 className="font-display text-2xl font-700 text-primary">Уголовное дело № {c.case_number || '—'}</h1>
    </div>
    <div className="flex gap-6">
      <div className="h-44 w-36 shrink-0 overflow-hidden border border-border bg-muted">
        {c.photo_url ? <img src={c.photo_url} className="h-full w-full object-cover" alt="" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Icon name="User" size={40} /></div>}
      </div>
      <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3">
        <Info l="Наименование" v={c.title} />
        <Info l="Статус" v={c.status} />
        <Info l="Статья УК" v={c.article} />
        <Info l="Подозреваемый" v={c.suspect_name} />
        <Info l="Следователь" v={c.investigator} />
        <Info l="Дата возбуждения" v={c.opened_date} />
      </div>
    </div>
    <div className="mt-6">
      <div className="font-display text-xs uppercase tracking-wide text-muted-foreground">Фабула дела</div>
      <p className="mt-1 whitespace-pre-wrap border-l-2 border-accent pl-3 text-sm leading-relaxed">{c.description || '—'}</p>
    </div>
  </div>
);

const Info = ({ l, v }: { l: string; v: string }) => (
  <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{l}</div><div className="font-500 text-foreground">{v || '—'}</div></div>
);

export default CasesTab;
