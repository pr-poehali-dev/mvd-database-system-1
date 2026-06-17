import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import * as api from '@/lib/api';

interface MailRow {
  id: number;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  created_at: string;
}

interface OfficerRow { id: number; full_name: string }

const MailTab = () => {
  const [rows, setRows] = useState<MailRow[]>([]);
  const [officers, setOfficers] = useState<OfficerRow[]>([]);
  const [form, setForm] = useState({ sender: '', recipient: '', subject: '', body: '' });
  const [active, setActive] = useState<MailRow | null>(null);
  const [compose, setCompose] = useState(false);

  const load = async () => {
    setRows(await api.list<MailRow>('mail'));
    setOfficers(await api.list<OfficerRow>('officers'));
  };
  useEffect(() => { load(); }, []);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const send = async () => {
    if (!form.sender || !form.recipient) return;
    await api.create('mail', form);
    setForm({ sender: '', recipient: '', subject: '', body: '' });
    setCompose(false); load();
  };
  const del = async (id: number) => { await api.remove('mail', id); setActive(null); load(); };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>
  );

  const NameSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select className="h-10 w-full border border-input bg-background px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">— выбрать —</option>
      {officers.map((o) => <option key={o.id} value={o.full_name}>{o.full_name}</option>)}
    </select>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl text-primary">Внутренняя почта</h2>
        <Button onClick={() => setCompose((c) => !c)}><Icon name="PenSquare" size={16} className="mr-2" />Написать</Button>
      </div>

      {compose && (
        <div className="mb-6 grid gap-4 border border-border bg-card p-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="От кого"><NameSelect value={form.sender} onChange={(v) => set('sender', v)} /></Field>
            <Field label="Кому"><NameSelect value={form.recipient} onChange={(v) => set('recipient', v)} /></Field>
          </div>
          <Field label="Тема"><Input value={form.subject} onChange={(e) => set('subject', e.target.value)} /></Field>
          <Field label="Сообщение"><Textarea rows={4} value={form.body} onChange={(e) => set('body', e.target.value)} /></Field>
          <div><Button onClick={send}><Icon name="Send" size={16} className="mr-2" />Отправить</Button></div>
        </div>
      )}

      {active ? (
        <div className="border border-border bg-card p-6">
          <button onClick={() => setActive(null)} className="mb-4 text-sm text-primary hover:underline"><Icon name="ArrowLeft" size={14} className="mr-1 inline" />К списку</button>
          <h3 className="font-display text-xl text-primary">{active.subject || '(без темы)'}</h3>
          <div className="mt-1 text-sm text-muted-foreground">От: {active.sender} → Кому: {active.recipient}</div>
          <p className="mt-4 whitespace-pre-wrap border-t border-border pt-4">{active.body}</p>
          <Button variant="destructive" className="mt-6" onClick={() => del(active.id)}><Icon name="Trash2" size={16} className="mr-2" />Удалить</Button>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border bg-card">
          {rows.map((m) => (
            <button key={m.id} onClick={() => setActive(m)} className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/40">
              <Icon name="Mail" size={20} className="text-primary" />
              <div className="flex-1">
                <div className="font-500">{m.subject || '(без темы)'}</div>
                <div className="text-sm text-muted-foreground">{m.sender} → {m.recipient}</div>
              </div>
              <div className="text-xs text-muted-foreground">{(m.created_at || '').slice(0, 16).replace('T', ' ')}</div>
            </button>
          ))}
          {rows.length === 0 && <p className="p-12 text-center text-muted-foreground">Писем пока нет.</p>}
        </div>
      )}
    </div>
  );
};

export default MailTab;
