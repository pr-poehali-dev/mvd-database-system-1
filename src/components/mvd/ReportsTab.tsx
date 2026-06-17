import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import * as api from '@/lib/api';

interface ReportRow {
  id: number;
  title: string;
  report_type: string;
  author: string;
  period: string;
  content: string;
  created_at: string;
}

const empty: Partial<ReportRow> = { title: '', report_type: 'Оперативный', author: '', period: '', content: '' };

const ReportsTab = () => {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [form, setForm] = useState<Partial<ReportRow>>(empty);
  const [active, setActive] = useState<ReportRow | null>(null);
  const [mode, setMode] = useState<'list' | 'edit'>('list');

  const load = async () => setRows(await api.list<ReportRow>('reports'));
  useEffect(() => { load(); }, []);
  const set = (k: keyof ReportRow, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title) return;
    await api.create('reports', form as api.Row);
    setForm(empty); setMode('list'); load();
  };
  const del = async (id: number) => { await api.remove('reports', id); setActive(null); load(); };

  const exportExcel = (r: ReportRow) => {
    const rowsData = [
      ['Отчёт', r.title], ['Тип', r.report_type], ['Автор', r.author],
      ['Период', r.period], ['Содержание', r.content],
    ];
    const html = `<table>${rowsData.map((x) => `<tr><td>${x[0]}</td><td>${(x[1] || '').replace(/</g, '&lt;')}</td></tr>`).join('')}</table>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${r.title}.xls`;
    a.click();
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>
  );

  if (mode === 'edit') {
    return (
      <div className="animate-fade-in mx-auto max-w-4xl">
        <div className="grid gap-4 border border-border bg-card p-6">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Наименование"><Input value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
            <Field label="Тип отчёта">
              <select className="h-10 w-full border border-input bg-background px-3 text-sm" value={form.report_type} onChange={(e) => set('report_type', e.target.value)}>
                <option>Оперативный</option><option>Аналитический</option><option>Статистический</option><option>Годовой</option>
              </select>
            </Field>
            <Field label="Период"><Input value={form.period} onChange={(e) => set('period', e.target.value)} placeholder="напр. Q1 2026" /></Field>
          </div>
          <Field label="Составитель"><Input value={form.author} onChange={(e) => set('author', e.target.value)} /></Field>
          <Field label="Содержание отчёта"><Textarea rows={10} value={form.content} onChange={(e) => set('content', e.target.value)} /></Field>
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={save}><Icon name="Save" size={16} className="mr-2" />Сохранить отчёт</Button>
          <Button variant="outline" onClick={() => { setForm(empty); setMode('list'); }}>Отмена</Button>
        </div>
      </div>
    );
  }

  if (active) {
    return (
      <div className="animate-fade-in mx-auto max-w-4xl">
        <div className="no-print mb-4 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setActive(null)}><Icon name="ArrowLeft" size={16} className="mr-2" />Назад</Button>
          <Button onClick={() => window.print()}><Icon name="Printer" size={16} className="mr-2" />Печать / PDF</Button>
          <Button variant="secondary" onClick={() => exportExcel(active)}><Icon name="Sheet" size={16} className="mr-2" />Excel</Button>
          <Button variant="destructive" onClick={() => del(active.id)}><Icon name="Trash2" size={16} className="mr-2" />Удалить</Button>
        </div>
        <div className="print-area border border-border bg-white p-8">
          <div className="mb-6 border-b-2 border-primary pb-4 text-center">
            <div className="font-display text-sm uppercase tracking-widest text-muted-foreground">{active.report_type} отчёт</div>
            <h1 className="font-display text-2xl font-700 text-primary">{active.title}</h1>
            <div className="mt-1 text-sm text-muted-foreground">{active.author} · {active.period}</div>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed">{active.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl text-primary">Отчётность</h2>
        <Button onClick={() => setMode('edit')}><Icon name="FileBarChart" size={16} className="mr-2" />Новый отчёт</Button>
      </div>
      <div className="grid gap-3">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-4 border border-border bg-card p-4">
            <Icon name="FileText" size={24} className="text-primary" />
            <div className="flex-1 cursor-pointer" onClick={() => setActive(r)}>
              <div className="font-display text-lg text-primary">{r.title}</div>
              <div className="text-sm text-muted-foreground">{r.report_type} · {r.period || 'период не указан'} · {r.author}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setActive(r)}>Открыть</Button>
            <Button size="sm" variant="secondary" onClick={() => exportExcel(r)}><Icon name="Sheet" size={14} /></Button>
          </div>
        ))}
        {rows.length === 0 && <p className="py-12 text-center text-muted-foreground">Отчётов пока нет.</p>}
      </div>
    </div>
  );
};

export default ReportsTab;
