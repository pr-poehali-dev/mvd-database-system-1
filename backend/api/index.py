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
    'wanted': ['full_name', 'article', 'danger_level', 'photo_url', 'description', 'last_seen'],
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


def handler(event: dict, context) -> dict:
    '''Единое API для системы МВД: дела, сотрудники, почта, розыск, отчёты, граждане, настройки.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
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
