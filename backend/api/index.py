import json
import os
import psycopg2
import psycopg2.extras


def _conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
}

# Конфигурация таблиц: разрешённые поля для вставки/обновления
TABLES = {
    'officers': ['full_name', 'rank', 'position', 'login', 'password', 'email'],
    'cases': ['case_number', 'title', 'status', 'article', 'suspect_name', 'photo_url', 'description', 'investigator', 'opened_date'],
    'citizens': ['full_name', 'birth_date', 'passport', 'address', 'phone', 'photo_url', 'notes'],
    'wanted': ['full_name', 'article', 'danger_level', 'photo_url', 'description', 'last_seen', 'facecomposite'],
    'mail': ['sender', 'recipient', 'subject', 'body', 'is_read'],
    'reports': ['title', 'report_type', 'author', 'period', 'content'],
    'settings': ['department_name', 'region', 'logo_url', 'theme'],
}


def _esc(v):
    if v is None:
        return 'NULL'
    if isinstance(v, bool):
        return 'TRUE' if v else 'FALSE'
    if isinstance(v, (int, float)):
        return str(v)
    s = str(v).replace("'", "''")
    return "'" + s + "'"


def _auth(event):
    body = json.loads(event.get('body') or '{}')
    login = body.get('login', '')
    password = body.get('password', '')
    conn = _conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            f"SELECT id, full_name, rank, position, login, email FROM officers "
            f"WHERE login = {_esc(login)} AND password = {_esc(password)} LIMIT 1"
        )
        row = cur.fetchone()
        if row:
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'officer': row}, default=str)}
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'Неверный логин или пароль'})}
    finally:
        cur.close()
        conn.close()


def _search(q):
    q = (q or '').strip()
    if not q:
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'results': []})}
    like = "'%' || " + _esc(q) + " || '%'"
    queries = {
        'cases': f"SELECT id, title AS name, case_number AS sub, photo_url, article FROM cases WHERE title ILIKE {like} OR suspect_name ILIKE {like} OR article ILIKE {like} OR case_number ILIKE {like}",
        'wanted': f"SELECT id, full_name AS name, danger_level AS sub, photo_url, article FROM wanted WHERE full_name ILIKE {like} OR article ILIKE {like} OR description ILIKE {like}",
        'citizens': f"SELECT id, full_name AS name, passport AS sub, photo_url, '' AS article FROM citizens WHERE full_name ILIKE {like} OR passport ILIKE {like} OR address ILIKE {like}",
        'officers': f"SELECT id, full_name AS name, position AS sub, '' AS photo_url, rank AS article FROM officers WHERE full_name ILIKE {like} OR login ILIKE {like}",
    }
    conn = _conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    results = []
    try:
        for tab, sql in queries.items():
            cur.execute(sql)
            for r in cur.fetchall():
                r['_table'] = tab
                results.append(r)
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'results': results}, default=str)}
    finally:
        cur.close()
        conn.close()


def handler(event: dict, context) -> dict:
    '''Единое API для системы МВД: дела, сотрудники, почта, розыск, отчёты, граждане, настройки.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    if action == 'auth':
        return _auth(event)
    if action == 'search':
        return _search(params.get('q', ''))

    table = params.get('table', '')
    if table not in TABLES:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'unknown table'})}

    cols = TABLES[table]
    conn = _conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        if method == 'GET':
            cur.execute(f'SELECT * FROM {table} ORDER BY id DESC')
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(rows, default=str)}

        body = json.loads(event.get('body') or '{}')

        if method == 'POST':
            keys = [k for k in cols if k in body]
            vals = ', '.join(_esc(body[k]) for k in keys)
            cur.execute(f'INSERT INTO {table} ({", ".join(keys)}) VALUES ({vals}) RETURNING *')
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(row, default=str)}

        if method == 'PUT':
            rid = int(body.get('id'))
            sets = ', '.join(f'{k} = {_esc(body[k])}' for k in cols if k in body)
            cur.execute(f'UPDATE {table} SET {sets} WHERE id = {rid} RETURNING *')
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(row, default=str)}

        if method == 'DELETE':
            rid = int(params.get('id', 0))
            cur.execute(f'DELETE FROM {table} WHERE id = {rid}')
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'deleted': rid})}

        return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method not allowed'})}
    finally:
        cur.close()
        conn.close()