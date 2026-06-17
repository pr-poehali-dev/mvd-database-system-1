import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import * as api from '@/lib/api';

const TABLE_META: Record<string, { label: string; icon: string }> = {
  cases: { label: 'Дело', icon: 'FolderOpen' },
  wanted: { label: 'Розыск', icon: 'UserSearch' },
  citizens: { label: 'Гражданин', icon: 'IdCard' },
  officers: { label: 'Сотрудник', icon: 'Users' },
};

const SearchTab = () => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<api.SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setResults(await api.search(q));
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <h2 className="mb-5 font-display text-2xl text-primary">Поиск по базе</h2>
      <form onSubmit={run} className="mb-6 flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ФИО, статья, паспорт, номер дела..."
          autoFocus
        />
        <button type="submit" className="flex items-center gap-2 bg-primary px-5 font-display text-sm uppercase tracking-wide text-primary-foreground transition hover:opacity-90">
          <Icon name={loading ? 'Loader' : 'Search'} size={16} className={loading ? 'animate-spin' : ''} />
          Найти
        </button>
      </form>

      <div className="grid gap-3">
        {results.map((r) => {
          const meta = TABLE_META[r._table] || { label: r._table, icon: 'File' };
          return (
            <div key={`${r._table}-${r.id}`} className="flex items-center gap-4 border border-border bg-card p-3">
              <div className="h-14 w-12 shrink-0 overflow-hidden bg-muted">
                {r.photo_url ? <img src={r.photo_url} className="h-full w-full object-cover" alt="" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Icon name="User" size={18} /></div>}
              </div>
              <div className="flex-1">
                <div className="font-display text-lg text-primary">{r.name}</div>
                <div className="text-sm text-muted-foreground">{r.sub || r.article || '—'}</div>
              </div>
              <span className="flex items-center gap-1.5 border border-primary/30 bg-secondary px-3 py-1 text-xs text-primary">
                <Icon name={meta.icon} size={14} />
                {meta.label}
              </span>
            </div>
          );
        })}
        {done && results.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">Совпадений не найдено.</p>
        )}
        {!done && (
          <p className="py-12 text-center text-muted-foreground">
            Введите запрос — поиск идёт по делам, розыску, гражданам и сотрудникам.
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchTab;
