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