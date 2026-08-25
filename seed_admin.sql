-- Aktifkan ekstensi pgcrypto jika belum aktif (digunakan untuk enkripsi password)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Buat User di tabel auth.users bawaan Supabase
-- Pastikan ID menggunakan format UUID yang valid
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  is_super_admin
)
VALUES (
  'a1b48b62-5555-4444-8888-a1b48b625555',
  '00000000-0000-0000-0000-000000000000',
  'admin@sekolah.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now(),
  'authenticated',
  false
);

-- 2. Tambahkan data profil tersebut sebagai ADMIN di tabel profiles kita
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  role
)
VALUES (
  'a1b48b62-5555-4444-8888-a1b48b625555',
  'Administrator Utama',
  'admin@sekolah.com',
  'ADMIN'
);
