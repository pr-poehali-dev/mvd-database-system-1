CREATE TABLE IF NOT EXISTS officers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    rank VARCHAR(120),
    position VARCHAR(160),
    login VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(160),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(120),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(80) DEFAULT 'Открыто',
    article VARCHAR(160),
    suspect_name VARCHAR(255),
    photo_url TEXT,
    description TEXT,
    investigator VARCHAR(255),
    opened_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citizens (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE,
    passport VARCHAR(120),
    address TEXT,
    phone VARCHAR(80),
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wanted (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    article VARCHAR(160),
    danger_level VARCHAR(80) DEFAULT 'Средний',
    photo_url TEXT,
    description TEXT,
    last_seen TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mail (
    id SERIAL PRIMARY KEY,
    sender VARCHAR(255) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(160),
    author VARCHAR(255),
    period VARCHAR(120),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(255) DEFAULT 'Министерство внутренних дел',
    region VARCHAR(255),
    logo_url TEXT,
    theme VARCHAR(80) DEFAULT 'classic',
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO settings (department_name, region) VALUES ('Министерство внутренних дел', 'Центральный регион');