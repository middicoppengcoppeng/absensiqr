# Dokumentasi Teknis - Sistem Absensi QR-Code

Dokumen ini berisi informasi teknis mengenai arsitektur, teknologi, skema database, dan panduan setup untuk proyek Sistem Absensi QR-Code. Sangat berguna sebagai referensi apabila di masa depan aplikasi ini akan dipindahkan ke server atau database lain.

---

## 1. Tech Stack (Teknologi yang Digunakan)

Proyek ini dibangun menggunakan framework dan library modern:

*   **Framework Frontend**: Next.js 16 (App Router)
*   **Library UI**: React 19
*   **Styling**: Tailwind CSS v4
*   **Icons**: Lucide React
*   **Backend & Database**: Supabase (PostgreSQL + Supabase Auth)
*   **QR Scanner Library**: `html5-qrcode`
*   **QR Generator Library**: `qrcode.react`
*   **Bahasa Pemrograman**: TypeScript

---

## 2. Struktur Direktori Utama

*   `src/app/(admin)`: Berisi seluruh halaman dan routing untuk panel Administrator (Dashboard, Data Guru, Data Siswa, Kelas, Sesi, Laporan).
*   `src/app/(teacher)`: Berisi seluruh halaman dan routing untuk panel Guru (Dashboard, Data Siswa, Sesi, Scan Absensi, Laporan).
*   `src/app/api`: Endpoint backend (misalnya `api/admin/create-teacher`) untuk operasi yang memerlukan hak akses *service_role* (bypass RLS).
*   `src/app/login`: Halaman utama dan autentikasi.
*   `src/components`: Komponen UI yang dapat digunakan kembali (Header, Sidebar, ConfirmModal, QrScanner, dll).
*   `src/lib`: Konfigurasi *third-party* (seperti `supabase.ts` untuk inisiasi client Supabase).

---

## 3. Konfigurasi Environment (Variabel Lingkungan)

Untuk menjalankan aplikasi ini, diperlukan file `.env.local` di root direktori dengan konfigurasi sebagai berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
```

*   `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Digunakan oleh client browser untuk mengakses Supabase.
*   `SUPABASE_SERVICE_ROLE_KEY`: Digunakan *hanya di server-side* (API Routes) untuk melakukan operasi administratif seperti membuat user guru baru di Supabase Auth tanpa perlu login sebagai superadmin.

---

## 4. Skema Database (PostgreSQL)

Jika Anda memindahkan database ke instansi Supabase baru, jalankan query SQL berikut di SQL Editor Supabase untuk membangun kembali seluruh tabel dan pengaturan keamanannya:

```sql
-- 1. Profiles (Linked to Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Classes
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  major TEXT,
  homeroom_teacher_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Students
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nis TEXT UNIQUE NOT NULL,
  nisn TEXT UNIQUE,
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('L', 'P')),
  birth_date DATE,
  class_id UUID REFERENCES public.classes(id),
  photo_url TEXT,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. QR Tokens
CREATE TABLE public.qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Attendance Sessions
CREATE TABLE public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id),
  teacher_id UUID REFERENCES public.profiles(id),
  attendance_date DATE NOT NULL,
  start_time TIME NOT NULL,
  late_after TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Attendances
CREATE TABLE public.attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id),
  session_id UUID REFERENCES public.attendance_sessions(id),
  scan_time TIME NOT NULL,
  status TEXT CHECK (status IN ('HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, session_id)
);

-- 7. Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  target_id UUID,
  description TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Settings (Konfigurasi Aplikasi)
CREATE TABLE public.settings (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- PENGATURAN KEAMANAN (Row Level Security)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses (Sementara di-set terbuka untuk yang sudah login)
CREATE POLICY "Allow all actions for authenticated users" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.classes FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.students FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.qr_tokens FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.attendance_sessions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.attendances FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.audit_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.settings FOR ALL TO authenticated USING (true);

-- Khusus tabel settings, izinkan akses baca tanpa login (untuk halaman login)
CREATE POLICY "Allow read for public" ON public.settings FOR SELECT USING (true);

-- ==========================================
-- SEED DATA AWAL (Jalankan setelah tabel dibuat)
-- ==========================================

INSERT INTO public.settings (id, value) VALUES ('school_name', 'SD Negeri 1');
INSERT INTO public.settings (id, value) VALUES ('academic_year', '2025/2026');
```

---

## 5. Cara Membuat Akun Admin Pertama Kali

Jika database kosong, tidak akan ada akun yang bisa login. Anda harus membuat akun Admin melalui dashboard Supabase terlebih dahulu:

1. Buka Dashboard Supabase.
2. Masuk ke menu **Authentication > Users**, klik **Add User** -> **Create New User**.
3. Masukkan Email (`admin@sekolah.com`) dan Password (`admin123`), jangan centang opsi Auto Confirm jika tidak diperlukan, lalu simpan.
4. Salin **User UID** dari akun yang baru dibuat.
5. Pindah ke menu **Table Editor**, buka tabel `profiles`.
6. Insert Row baru:
   * `id`: (Paste User UID tadi)
   * `full_name`: Administrator
   * `email`: admin@sekolah.com
   * `role`: ADMIN ATAU SUPER_ADMIN
7. Selesai. Sekarang Anda bisa login menggunakan email tersebut.

---

## 6. Integrasi Supabase Trigger (Opsional tapi Direkomendasikan)

Untuk menyelaraskan data `auth.users` dengan tabel `public.profiles` secara otomatis setiap kali ada akun baru, Anda dapat menambahkan trigger berikut di SQL Editor Supabase:

```sql
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'role');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 7. Logika Utama Sistem

*   **Autentikasi**: Menggunakan Supabase Auth (Email & Password). Setelah login sukses, sistem membaca tabel `profiles` berdasarkan User ID untuk menentukan ke halaman mana user harus diarahkan (`/admin/dashboard` atau `/teacher/dashboard`).
*   **Isolasi Data Guru**: Di tabel `classes`, terdapat kolom `homeroom_teacher_id` (wali kelas). Guru hanya dapat melihat siswa, sesi, dan laporan dari kelas di mana mereka ditugaskan sebagai wali kelas.
*   **Pembuatan QR Code**: Dihasilkan menggunakan library `qrcode.react` di sisi klien berdasarkan UUID unik yang tersimpan di tabel `qr_tokens`.
*   **Pemindaian (Scan)**: Menggunakan library `html5-qrcode` yang mengakses kamera perangkat. Hasil scan akan membandingkan token di database dan mencatat waktu di tabel `attendances`.
*   **Aturan Unik Kehadiran**: Tabel `attendances` memiliki constraint `UNIQUE(student_id, session_id)`. Artinya 1 siswa hanya bisa memiliki 1 catatan per sesi. Sistem diatur menggunakan logika UPSERT (jika ada konflik, data lama diupdate) sehingga fitur input manual atau scan ulang bisa berfungsi sebagai alat revisi (koreksi data).
