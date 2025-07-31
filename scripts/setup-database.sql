-- Create sessions table for Replit Auth
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  duration VARCHAR,
  level VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create commissions table
CREATE TABLE IF NOT EXISTS commissions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id VARCHAR NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  code VARCHAR NOT NULL,
  days VARCHAR NOT NULL,
  time VARCHAR NOT NULL,
  instructor VARCHAR NOT NULL,
  max_capacity INTEGER DEFAULT 20,
  current_enrolled INTEGER DEFAULT 0,
  start_date VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id VARCHAR NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  commission_id VARCHAR NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR NOT NULL,
  pronouns VARCHAR,
  email VARCHAR NOT NULL,
  discord_username VARCHAR,
  community_affiliation VARCHAR,
  data_consent BOOLEAN DEFAULT false,
  newsletter BOOLEAN DEFAULT false,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data
INSERT INTO courses (id, name, description, duration, level) VALUES
('course-1', 'Maquetado Web Nivel I', 'Introducción al desarrollo web frontend con HTML, CSS y técnicas de diseño responsive', '8 semanas', 'Principiante')
ON CONFLICT (id) DO NOTHING;

INSERT INTO commissions (id, course_id, code, days, time, instructor, max_capacity, start_date) VALUES
('comm-1', 'course-1', 'A001', 'Lunes y Miércoles', '18:00 - 20:00', 'Prof. Alex García', 20, '2025-02-15'),
('comm-2', 'course-1', 'A002', 'Martes y Jueves', '19:00 - 21:00', 'Prof. Sam López', 20, '2025-02-16'),
('comm-3', 'course-1', 'A003', 'Sábados', '10:00 - 14:00', 'Prof. Jordan Rivera', 15, '2025-02-17')
ON CONFLICT (id) DO NOTHING;