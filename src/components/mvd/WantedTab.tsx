import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import PhotoInput from './PhotoInput';
import * as api from '@/lib/api';

interface WantedRow {
  id: number;
  full_name: string;
  article: string;
  danger_level: string;
  photo_url: string;
  description: string;
  last_seen: string;
}

const empty: Partial<WantedRow> = { full_name: '', article: '', danger_level: 'Средний', photo_url: '', description: '', last_seen: '' };

const dangerColor: Record<string, string> = {
  'Высокий': 'bg-destructive text-destructive-foreground',
  'Средний': 'bg-accent text-accent-foreground',
  'Низкий': 'bg-secondary text-secondary-foreground',
};

const WantedTab = () => {
  const [rows, setRows] = useState<WantedRow[]>([]);
  const [form, setForm] = useState<Partial<WantedRow>>(empty);
  const [show, setShow] = useState(false);

  const load = async () => setRows(await api.list<WantedRow>('wanted'));
  useEffect(() => { load(); }, []);
  const set = (k: keyof WantedRow, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.full_name) return;
    await api.create('wanted', form as api.Row);
    setForm(empty); setShow(false); load();
  };
  const del = async (id: number) => { await api.remove('wanted', id); load(); };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl text-primary">Розыск</h2>
        <Button onClick={() => setShow((s) => !s)}><Icon name="UserSearch" size={16} className="mr-2" />Объявить в розыск</Button>
      </div>

      {show && (
        <div className="mb-6 border border-border bg-card p-6">
          <div className="flex gap-6">
            <PhotoInput value={form.photo_url || ''} onChange={(v) => set('photo_url', v)} />
            <div className="grid flex-1 grid-cols-2 gap-4">
              <Field label="ФИО / приметы"><Input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} /></Field>
              <Field label="Статья УК"><Input value={form.article} onChange={(e) => set('article', e.target.value)} /></Field>
              <Field label="Степень опасности">
                <select className="h-10 w-full border border-input bg-background px-3 text-sm" value={form.danger_level} onChange={(e) => set('danger_level', e.target.value)}>
                  <option>Низкий</option><option>Средний</option><option>Высокий</option>
                </select>
              </Field>
              <Field label="Последнее место"><Input value={form.last_seen} onChange={(e) => set('last_seen', e.target.value)} /></Field>
            </div>
          </div>
          <div className="mt-4"><Field label="Ориентировка"><Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field></div>
          <div className="mt-4"><Button onClick={save}><Icon name="Save" size={16} className="mr-2" />Добавить в розыск</Button></div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((w) => (
          <div key={w.id} className="overflow-hidden border border-border bg-card">
            <div className="relative aspect-square bg-muted">
              {w.photo_url ? <img src={w.photo_url} className="h-full w-full object-cover" alt="" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Icon name="UserX" size={48} /></div>}
              <span className={`absolute left-2 top-2 px-2 py-0.5 text-xs font-500 ${dangerColor[w.danger_level] || 'bg-secondary'}`}>{w.danger_level}</span>
              <button onClick={() => del(w.id)} className="absolute right-2 top-2 bg-destructive p-1.5 text-destructive-foreground hover:opacity-80"><Icon name="Trash2" size={14} /></button>
            </div>
            <div className="p-3">
              <div className="font-display text-lg text-primary">{w.full_name}</div>
              <div className="text-sm text-muted-foreground">{w.article || 'статья не указана'}</div>
              {w.last_seen && <div className="mt-1 text-xs text-muted-foreground"><Icon name="MapPin" size={12} className="mr-1 inline" />{w.last_seen}</div>}
              {w.description && <p className="mt-2 text-sm leading-snug">{w.description}</p>}
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="col-span-full py-12 text-center text-muted-foreground">В розыске никого нет.</p>}
      </div>
    </div>
  );
};

export default WantedTab;
