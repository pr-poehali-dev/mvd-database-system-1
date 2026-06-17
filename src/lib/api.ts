const BASE = 'https://functions.poehali.dev/dd65f238-f42e-4e51-8fef-7c9f05bf44ec';

export type Table =
  | 'officers'
  | 'cases'
  | 'citizens'
  | 'wanted'
  | 'mail'
  | 'reports'
  | 'settings';

export type Row = Record<string, unknown>;

export async function list<T = Row>(table: Table): Promise<T[]> {
  const r = await fetch(`${BASE}?table=${table}`);
  return r.json();
}

export async function create<T = Row>(table: Table, data: Row): Promise<T> {
  const r = await fetch(`${BASE}?table=${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function update<T = Row>(table: Table, data: Row): Promise<T> {
  const r = await fetch(`${BASE}?table=${table}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function remove(table: Table, id: number): Promise<void> {
  await fetch(`${BASE}?table=${table}&id=${id}`, { method: 'DELETE' });
}

export interface Officer {
  id: number;
  full_name: string;
  rank: string;
  position: string;
  login: string;
  email: string;
}

export async function auth(login: string, password: string): Promise<{ ok: boolean; officer?: Officer; error?: string }> {
  const r = await fetch(`${BASE}?action=auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });
  return r.json();
}

export interface SearchResult {
  id: number;
  name: string;
  sub: string;
  photo_url: string;
  article: string;
  _table: Table;
}

export async function search(q: string): Promise<SearchResult[]> {
  const r = await fetch(`${BASE}?action=search&q=${encodeURIComponent(q)}`);
  const data = await r.json();
  return data.results || [];
}