# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## SISTEM ABSENSI SEKOLAH BERBASIS QR CODE

**Version:** 1.0
**Status:** Ready for Development
**Date:** 25 August 2026

---

# 1. PRODUCT OVERVIEW

Sistem Absensi Sekolah Berbasis QR Code adalah aplikasi web yang digunakan untuk mengelola dan mencatat kehadiran siswa secara digital.

Setiap siswa memiliki QR Code unik yang dibuat oleh administrator sekolah. QR Code tersebut dapat dicetak dalam bentuk kartu dan dibagikan kepada siswa.

Saat siswa datang ke sekolah, siswa menunjukkan QR Code miliknya kepada guru atau petugas absensi. Guru membuka halaman scanner melalui smartphone, tablet, atau komputer yang memiliki kamera.

Setelah QR Code berhasil dipindai, sistem akan mengenali siswa, melakukan validasi, mencatat waktu kehadiran, menentukan status kehadiran, dan menampilkan hasil absensi.

Sistem juga menyediakan dashboard administrator dan guru untuk memantau data kehadiran serta membuat laporan.

---

# 2. PROBLEM STATEMENT

Proses absensi sekolah secara manual memiliki beberapa permasalahan:

* Membutuhkan waktu cukup lama.
* Guru harus mencatat siswa secara manual.
* Risiko kesalahan pencatatan.
* Data absensi sulit dikelola.
* Rekap bulanan membutuhkan waktu.
* Sulit memonitor kehadiran secara real-time.
* Risiko terjadinya titip absen.
* Pembuatan laporan masih dilakukan secara manual.

Sistem QR Code dibuat untuk menyederhanakan proses absensi dan mengubah data kehadiran menjadi data digital yang terstruktur.

---

# 3. PRODUCT GOALS

## 3.1 Primary Goals

* Mempercepat proses absensi siswa.
* Mengurangi pencatatan manual.
* Mengurangi kesalahan input.
* Menyimpan data absensi secara terpusat.
* Menyediakan monitoring absensi secara real-time.
* Mempermudah pembuatan laporan.
* Meningkatkan efisiensi kerja guru dan admin.

## 3.2 Secondary Goals

* Menyediakan histori kehadiran siswa.
* Menyediakan statistik kehadiran.
* Mempermudah pencetakan QR siswa.
* Mempermudah export data absensi.
* Menjadi dasar pengembangan sistem akademik sekolah.

---

# 4. TARGET USERS

Sistem memiliki tiga kategori pengguna:

## 4.1 Super Admin

Memiliki akses penuh terhadap sistem.

## 4.2 Admin

Mengelola data sekolah, siswa, guru, kelas, QR, dan laporan.

## 4.3 Guru

Melakukan scan QR dan memantau absensi siswa.

## 4.4 Siswa

Tidak memerlukan akun login pada versi MVP.

Siswa menggunakan QR Code sebagai identitas untuk melakukan absensi.

---

# 5. CORE CONCEPT

Konsep utama sistem:

"SATU SISWA, SATU QR, SATU DATA ABSENSI."

Setiap siswa memiliki QR Code unik.

QR Code dicetak oleh sekolah dan diberikan kepada siswa.

Ketika siswa datang:

Siswa menunjukkan QR → Guru melakukan scan → Sistem memvalidasi → Absensi tercatat.

---

# 6. USER FLOW

## 6.1 Admin Flow

Login
→ Dashboard
→ Kelola Siswa
→ Kelola Kelas
→ Kelola Guru
→ Generate QR
→ Cetak QR
→ Bagikan QR kepada siswa

## 6.2 Teacher Flow

Login
→ Dashboard
→ Pilih Sesi Absensi
→ Buka Scanner
→ Scan QR Siswa
→ Validasi
→ Absensi Berhasil
→ Scanner kembali aktif

## 6.3 Student Flow

Menerima QR
→ QR Dicetak
→ Membawa QR ke sekolah
→ Menunjukkan QR kepada guru
→ Absensi tercatat

---

# 7. AUTHENTICATION

Authentication menggunakan Supabase Auth.

Features:

* Login.
* Logout.
* Session management.
* Password reset.
* Protected routes.
* Role-based access.

Roles:

* SUPER_ADMIN
* ADMIN
* TEACHER

Siswa tidak memerlukan akun pada MVP.

---

# 8. ADMIN DASHBOARD

Dashboard admin menampilkan:

* Total siswa.
* Total guru.
* Total kelas.
* Total hadir hari ini.
* Total terlambat.
* Total izin.
* Total sakit.
* Total alpa.

Dashboard juga menyediakan grafik:

* Kehadiran harian.
* Kehadiran mingguan.
* Kehadiran bulanan.

Filter:

* Hari ini.
* Minggu ini.
* Bulan ini.
* Custom date range.

---

# 9. TEACHER DASHBOARD

Dashboard guru menampilkan:

* Sesi absensi aktif.
* Kelas yang sedang diabsen.
* Total siswa.
* Jumlah hadir.
* Jumlah terlambat.
* Jumlah belum hadir.
* Tombol Scan QR.
* Daftar absensi terbaru.

---

# 10. STUDENT MANAGEMENT

Admin dapat:

* Menambah siswa.
* Melihat siswa.
* Mengedit siswa.
* Menonaktifkan siswa.
* Mengaktifkan siswa.
* Menghapus siswa.
* Generate QR.
* Regenerate QR.
* Preview QR.
* Cetak QR.
* Import data siswa.
* Export data siswa.

Student fields:

* ID.
* NIS.
* NISN.
* Nama.
* Jenis kelamin.
* Tanggal lahir.
* Kelas.
* Tahun ajaran.
* Foto.
* QR Token.
* Status.
* Created at.
* Updated at.

---

# 11. CLASS MANAGEMENT

Admin dapat:

* Menambah kelas.
* Mengedit kelas.
* Melihat kelas.
* Menonaktifkan kelas.
* Menghapus kelas.
* Melihat siswa dalam kelas.

Class fields:

* ID.
* Nama kelas.
* Tingkat.
* Jurusan.
* Wali kelas.
* Status.
* Created at.
* Updated at.

Contoh:

* X RPL 1
* X RPL 2
* XI RPL 1
* XI RPL 2
* XII RPL 1

---

# 12. TEACHER MANAGEMENT

Admin dapat:

* Menambah guru.
* Mengedit guru.
* Melihat guru.
* Menonaktifkan guru.
* Mengaktifkan guru.
* Reset password.
* Mengatur hak akses.

Teacher fields:

* ID.
* User ID.
* NIP.
* Nama.
* Email.
* Nomor HP.
* Status.
* Created at.
* Updated at.

---

# 13. QR CODE SYSTEM

Setiap siswa memiliki QR Code unik.

QR Code tidak menyimpan data pribadi siswa secara langsung.

QR hanya menyimpan token unik.

Contoh:

STU-8F92KLA71

Database digunakan untuk menghubungkan token tersebut dengan data siswa.

Contoh data:

QR Token:
STU-8F92KLA71

Database:

Student:
Ahmad Rizky

NIS:
2401001

Class:
XI RPL 1

---

# 14. QR GENERATION

Admin dapat melakukan:

1. Generate QR satu siswa.
2. Generate QR satu kelas.
3. Generate QR seluruh siswa.
4. Regenerate QR siswa.

QR lama harus dapat dinonaktifkan ketika QR baru dibuat.

---

# 15. QR PRINTING

Sistem menyediakan fitur pencetakan QR.

Options:

* Print satu siswa.
* Print beberapa siswa.
* Print satu kelas.
* Print seluruh siswa.
* Download PDF.

Format kartu:

* Logo sekolah.
* Nama sekolah.
* QR Code.
* Nama siswa.
* NIS/NISN.
* Kelas.
* Optional foto siswa.

Contoh:

---

```
       LOGO SEKOLAH

      [ QR CODE ]

      Ahmad Rizky
      NIS: 2401001
      XI RPL 1

      SMA/SMK XYZ
```

---

QR dapat dicetak menggunakan kertas A4.

---

# 16. QR SECURITY

QR Code harus menggunakan token yang sulit ditebak.

QR tidak boleh menyimpan:

* Password.
* Data sensitif.
* Informasi pribadi lengkap.

Backend harus melakukan validasi token.

Validation flow:

QR Valid?
→ Student Exists?
→ Student Active?
→ Session Active?
→ Already Attendance?
→ Record Attendance

---

# 17. ATTENDANCE SESSION

Absensi menggunakan konsep Attendance Session.

Contoh:

Class:
XI RPL 1

Date:
25 August 2026

Start:
06:30

Late After:
07:15

End:
08:00

Status:
ACTIVE

Session menentukan konteks absensi.

---

# 18. ATTENDANCE SESSION FEATURES

Guru dapat:

* Membuat sesi.
* Memulai sesi.
* Menutup sesi.
* Melihat sesi aktif.
* Melihat histori sesi.

Admin dapat mengelola seluruh sesi.

---

# 19. QR SCANNER

Guru dapat membuka scanner melalui browser.

Scanner menggunakan kamera perangkat.

Perangkat yang didukung:

* Smartphone.
* Tablet.
* Laptop.
* Desktop dengan webcam.

Scanner harus menggunakan HTTPS pada production.

Scanner UI:

SCAN ABSENSI

Kelas:
XI RPL 1

Tanggal:
25 August 2026

[ CAMERA ]

Arahkan QR siswa ke kamera.

---

# 20. ATTENDANCE PROCESS

Flow:

Guru membuka scanner
→ Kamera aktif
→ QR dibaca
→ Token dikirim ke backend
→ Backend melakukan validasi
→ Sistem mencari siswa
→ Sistem mengecek session
→ Sistem mengecek duplicate
→ Sistem menentukan status
→ Attendance disimpan
→ Hasil dikirim ke frontend
→ UI menampilkan hasil
→ Scanner kembali aktif

---

# 21. ATTENDANCE STATUS

## HADIR

Siswa melakukan scan sebelum batas waktu terlambat.

## TERLAMBAT

Siswa melakukan scan setelah batas waktu hadir tetapi masih dalam session.

## IZIN

Status diberikan secara manual.

## SAKIT

Status diberikan secara manual.

## ALPA

Siswa tidak hadir tanpa keterangan.

---

# 22. DUPLICATE ATTENDANCE

Sistem harus mencegah siswa melakukan absensi lebih dari satu kali pada session yang sama.

Contoh:

Siswa melakukan scan:

07:02:21

Ketika siswa melakukan scan lagi:

"Anda sudah melakukan absensi."

Database harus memiliki unique constraint:

student_id + session_id

---

# 23. ATTENDANCE RESULT

Setelah scan berhasil:

ABSEN BERHASIL

Nama:
Ahmad Rizky

NIS:
2401001

Kelas:
XI RPL 1

Jam:
07:02:21

Status:
HADIR

Setelah hasil muncul, scanner kembali aktif secara otomatis.

---

# 24. RECENT ATTENDANCE

Scanner page menampilkan absensi terbaru.

Contoh:

Ahmad Rizky     07:01     HADIR
Budi Santoso    07:03     HADIR
Citra Maharani  07:04     HADIR
Doni            07:22     TERLAMBAT

---

# 25. ATTENDANCE MONITORING

Guru dapat melihat:

Total siswa:
32

Hadir:
28

Terlambat:
2

Belum hadir:
2

Daftar siswa:

Nama | Status | Jam

Ahmad | HADIR | 07:01
Budi | HADIR | 07:03
Citra | TERLAMBAT | 07:22
Doni | BELUM HADIR | -

---

# 26. MANUAL ATTENDANCE

Admin dan guru yang memiliki permission dapat mengubah status absensi.

Contoh:

Student:
Ahmad Rizky

Status:
SAKIT

Notes:
Surat dokter

Perubahan manual harus dicatat dalam Audit Log.

---

# 27. ATTENDANCE HISTORY

Admin dapat melihat seluruh histori absensi.

Filter:

* Tanggal.
* Bulan.
* Tahun.
* Kelas.
* Siswa.
* Guru.
* Status.

Search:

Nama siswa atau NIS/NISN.

---

# 28. REPORTS

Sistem menyediakan:

## Daily Report

Laporan absensi harian.

## Monthly Report

Laporan absensi bulanan.

## Student Report

Riwayat absensi siswa.

## Class Report

Rekap absensi kelas.

## Attendance Summary

Persentase kehadiran.

---

# 29. EXPORT

Sistem mendukung:

## Excel

Format:
.xlsx

Digunakan untuk pengolahan data.

## PDF

Digunakan untuk:

* Cetak.
* Arsip.
* Administrasi sekolah.

---

# 30. IMPORT STUDENTS

Admin dapat melakukan import data siswa menggunakan Excel.

Template:

NIS | NISN | Nama | Kelas

Sistem harus melakukan:

Upload
→ Validate
→ Check duplicate
→ Insert
→ Generate QR

Jika terdapat error, sistem harus menampilkan baris yang bermasalah.

---

# 31. SEARCH AND FILTER

Data utama harus memiliki:

* Search.
* Pagination.
* Sorting.
* Filter.
* Date range.

Data yang menggunakan fitur tersebut:

* Siswa.
* Guru.
* Kelas.
* Absensi.
* Sesi.

---

# 32. NOTIFICATION

Sistem menggunakan toast notification.

Success:

"Absensi Ahmad Rizky berhasil dicatat."

Error:

"QR Code tidak valid."

Warning:

"Siswa sudah melakukan absensi."

Info:

"Sesi absensi telah ditutup."

---

# 33. AUDIT LOG

Sistem mencatat aktivitas penting.

Fields:

* ID.
* User ID.
* Action.
* Module.
* Target ID.
* Description.
* IP Address.
* Created At.

Contoh:

Admin
→ UPDATE ATTENDANCE
→ Ahmad Rizky
→ Status: Sakit
→ 25/08/2026 10:31

---

# 34. ANTI TITIP ABSEN

Sistem MVP menggunakan QR sebagai identitas siswa.

Potensi risiko:

QR dapat difoto atau diberikan kepada siswa lain.

Mitigasi MVP:

Setelah scan, guru melihat:

* Nama siswa.
* NIS.
* Kelas.
* Foto siswa jika tersedia.

Guru dapat melakukan verifikasi visual.

Fitur lanjutan:

QR + Face Verification.

---

# 35. QR REGENERATION

Jika QR siswa:

* Hilang.
* Rusak.
* Dicuri.
* Disalahgunakan.

Admin dapat melakukan regenerate QR.

QR lama:

REVOKED

QR baru:

ACTIVE

---

# 36. ERROR HANDLING

## Invalid QR

"QR Code tidak valid."

## Student Not Found

"Data siswa tidak ditemukan."

## Student Inactive

"Siswa tidak aktif."

## Duplicate Attendance

"Siswa sudah melakukan absensi."

## Session Closed

"Sesi absensi sudah ditutup."

## Camera Permission

"Akses kamera diperlukan."

## Network Error

"Koneksi bermasalah. Silakan coba kembali."

---

# 37. SECURITY REQUIREMENTS

Sistem harus menerapkan:

* Supabase Authentication.
* Role-based authorization.
* Supabase Row Level Security.
* Backend validation.
* Input validation.
* Token validation.
* HTTPS.
* Password hashing melalui Supabase Auth.
* Secure session handling.
* Environment variables.
* Audit log.

Supabase Service Role Key hanya boleh digunakan pada backend.

Tidak boleh dimasukkan ke frontend.

---

# 38. DATABASE

Database menggunakan:

SUPABASE POSTGRESQL

Tables:

* profiles
* students
* classes
* teachers
* academic_years
* qr_tokens
* attendance_sessions
* attendances
* audit_logs

---

# 39. DATABASE SCHEMA

## profiles

* id UUID PK
* full_name
* email
* role
* avatar_url
* created_at
* updated_at

## classes

* id UUID PK
* name
* grade_level
* major
* homeroom_teacher_id
* status
* created_at
* updated_at

## students

* id UUID PK
* nis
* nisn
* full_name
* gender
* birth_date
* class_id FK
* photo_url
* status
* created_at
* updated_at

## qr_tokens

* id UUID PK
* student_id FK
* token
* status
* created_at
* updated_at

## attendance_sessions

* id UUID PK
* class_id FK
* teacher_id FK
* attendance_date
* start_time
* late_after
* end_time
* status
* created_at
* updated_at

## attendances

* id UUID PK
* student_id FK
* session_id FK
* scan_time
* status
* notes
* created_at
* updated_at

Unique constraint:

student_id + session_id

## audit_logs

* id UUID PK
* user_id FK
* action
* module
* target_id
* description
* ip_address
* created_at

---

# 40. TECHNOLOGY STACK

## Frontend

React.js

Tailwind CSS

React Router

Axios / Fetch

React Hooks

Context API jika diperlukan

Recharts

QR Code Scanner Library

QR Code Generator Library

## Backend

Node.js

Express.js

Supabase JS Client

REST API

Middleware Authentication

Middleware Authorization

Validation Library

## Backend Service

Supabase

PostgreSQL

Supabase Auth

Supabase Storage

Supabase Row Level Security

## Export

XLSX

PDF Generator

## Deployment

Frontend:
Vercel

Backend:
Railway / Render / VPS

Database:
Supabase

Version Control:
Git + GitHub

---

# 41. FRONTEND STRUCTURE

frontend/

src/

components/

* ui/
* forms/
* tables/
* scanner/
* dashboard/

layouts/

* AdminLayout.jsx
* TeacherLayout.jsx

pages/

* Login.jsx

admin/

* Dashboard.jsx
* Students.jsx
* StudentDetail.jsx
* Teachers.jsx
* Classes.jsx
* QRManagement.jsx
* Attendance.jsx
* Reports.jsx
* Settings.jsx

teacher/

* Dashboard.jsx
* Scanner.jsx
* AttendanceToday.jsx
* History.jsx

services/

* api.js
* auth.js

hooks/

utils/

routes/

App.jsx

---

# 42. BACKEND STRUCTURE

backend/

src/

config/

* supabase.js

controllers/

* auth.controller.js
* student.controller.js
* teacher.controller.js
* class.controller.js
* qr.controller.js
* attendance.controller.js
* session.controller.js
* report.controller.js

routes/

* auth.routes.js
* students.routes.js
* teachers.routes.js
* classes.routes.js
* qr.routes.js
* attendance.routes.js
* sessions.routes.js
* reports.routes.js

middleware/

* auth.js
* role.js
* validation.js
* error.js

services/

* qr.service.js
* attendance.service.js
* report.service.js

utils/

server.js

---

# 43. API ENDPOINTS

## Auth

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/me

## Students

GET /api/students

GET /api/students/:id

POST /api/students

PUT /api/students/:id

DELETE /api/students/:id

POST /api/students/:id/generate-qr

POST /api/students/import

GET /api/students/export

## Classes

GET /api/classes

GET /api/classes/:id

POST /api/classes

PUT /api/classes/:id

DELETE /api/classes/:id

## Teachers

GET /api/teachers

GET /api/teachers/:id

POST /api/teachers

PUT /api/teachers/:id

DELETE /api/teachers/:id

## QR

GET /api/qr/:studentId

POST /api/qr/:studentId/generate

POST /api/qr/:studentId/regenerate

POST /api/qr/bulk-generate

## Attendance

POST /api/attendance/scan

GET /api/attendance/today

GET /api/attendance/history

GET /api/attendance/:id

PUT /api/attendance/:id

## Sessions

GET /api/sessions

GET /api/sessions/:id

POST /api/sessions

PUT /api/sessions/:id

POST /api/sessions/:id/start

POST /api/sessions/:id/close

## Reports

GET /api/reports/daily

GET /api/reports/monthly

GET /api/reports/student/:id

GET /api/reports/class/:id

---

# 44. SCAN API

Endpoint:

POST /api/attendance/scan

Request:

{
"qr_token": "STU-8F92KLA71",
"session_id": "uuid-session"
}

Backend process:

Receive Token
→ Validate Auth
→ Validate Session
→ Find QR
→ Find Student
→ Check Student Status
→ Check Duplicate
→ Determine Status
→ Insert Attendance
→ Return Result

Response:

{
"success": true,
"message": "Attendance recorded",
"data": {
"student_name": "Ahmad Rizky",
"nis": "2401001",
"class": "XI RPL 1",
"time": "07:02:21",
"status": "HADIR"
}
}

---

# 45. PERFORMANCE REQUIREMENTS

Target:

* Initial page load <= 3 seconds on normal connection.
* Attendance API response <= 1 second under normal conditions.
* QR scanner response within a few seconds.
* Dashboard queries must be optimized.
* Tables must use pagination.
* Images must be optimized.
* API must avoid unnecessary queries.

---

# 46. RESPONSIVE DESIGN

Website harus mendukung:

* Desktop.
* Laptop.
* Tablet.
* Smartphone.

Scanner harus dioptimalkan untuk smartphone.

Dashboard admin dapat lebih optimal pada desktop.

Dashboard guru harus tetap nyaman digunakan melalui smartphone.

---

# 47. MVP FEATURES

Fitur wajib:

* Authentication.
* Admin dashboard.
* Teacher dashboard.
* Student management.
* Teacher management.
* Class management.
* QR generation.
* QR printing.
* QR regeneration.
* Attendance session.
* QR scanner.
* Attendance recording.
* Duplicate prevention.
* Hadir status.
* Terlambat status.
* Manual attendance.
* Attendance history.
* Dashboard statistics.
* Search.
* Filter.
* Excel export.
* PDF export.
* Audit log.
* Responsive design.

---

# 48. OUT OF MVP SCOPE

Tidak termasuk pada MVP:

* Face recognition.
* WhatsApp notification.
* Parent dashboard.
* Parent mobile application.
* GPS verification.
* Native Android application.
* Native iOS application.
* Multi-school.
* Multi-branch.
* SIAKAD integration.
* Advanced AI analytics.

---

# 49. PHASE 2

Fitur yang dapat dikembangkan setelah MVP:

* Face verification.
* WhatsApp notification.
* Parent dashboard.
* PWA.
* Push notification.
* GPS verification.
* Student attendance history portal.
* Parent notification.
* Advanced attendance analytics.

---

# 50. PHASE 3

Enterprise features:

* Multi-school.
* Multi-branch.
* Multi-tenant architecture.
* SIAKAD integration.
* Public API.
* Mobile application.
* Advanced analytics.
* AI attendance analysis.
* Automated reports.
* Parent mobile application.

---

# 51. ACCEPTANCE CRITERIA

## Authentication

* Admin dapat login.
* Guru dapat login.
* Role dapat membatasi akses.
* User dapat logout.
* Protected routes berjalan.

## Student

* Admin dapat menambahkan siswa.
* Admin dapat mengedit siswa.
* Admin dapat menonaktifkan siswa.
* QR dapat dibuat.
* QR dapat dicetak.

## Scanner

* Guru dapat membuka scanner.
* Kamera dapat digunakan.
* QR valid dapat dibaca.
* QR invalid ditolak.
* Hasil scan muncul.

## Attendance

* Attendance tercatat.
* Waktu scan tersimpan.
* Status ditentukan otomatis.
* Duplicate attendance ditolak.
* Session closed menolak scan.

## Dashboard

* Statistik tampil.
* Data dapat dicari.
* Data dapat difilter.
* Data diperbarui.

## Reports

* Daily report tersedia.
* Monthly report tersedia.
* Student report tersedia.
* Class report tersedia.
* Excel export tersedia.
* PDF export tersedia.

---

# 52. DEFINITION OF DONE

Fitur dianggap selesai apabila:

1. Frontend selesai.
2. Backend selesai.
3. Database selesai.
4. API terhubung.
5. Validation selesai.
6. Authorization selesai.
7. Error handling selesai.
8. Responsive.
9. Berhasil diuji.
10. Tidak terdapat critical bug.
11. Berfungsi di desktop.
12. Berfungsi di smartphone.

---

# 53. DEVELOPMENT ROADMAP

## Phase 1 — Project Setup

* Setup React.
* Setup Tailwind.
* Setup Node.js.
* Setup Express.
* Setup Supabase.
* Setup Git.
* Setup GitHub.
* Setup environment variables.

## Phase 2 — Database

* Create tables.
* Create relationships.
* Create indexes.
* Setup RLS.
* Setup constraints.

## Phase 3 — Authentication

* Login.
* Logout.
* Session.
* Roles.
* Protected routes.

## Phase 4 — Admin

* Dashboard.
* Student CRUD.
* Teacher CRUD.
* Class CRUD.

## Phase 5 — QR

* Generate QR.
* Preview QR.
* Regenerate QR.
* Bulk QR.
* Print QR.
* PDF QR.

## Phase 6 — Attendance

* Attendance session.
* Scanner.
* QR validation.
* Attendance recording.
* Duplicate prevention.
* Attendance status.

## Phase 7 — Monitoring

* Teacher dashboard.
* Attendance monitoring.
* Recent attendance.
* Attendance history.

## Phase 8 — Reports

* Daily report.
* Monthly report.
* Student report.
* Class report.
* Excel export.
* PDF export.

## Phase 9 — Security

* RLS.
* API validation.
* Authorization.
* Audit log.
* Token security.

## Phase 10 — Testing

* Unit testing.
* API testing.
* UI testing.
* Scanner testing.
* Mobile testing.
* Security testing.

## Phase 11 — Deployment

Frontend
→ Vercel

Backend
→ Railway / Render / VPS

Database
→ Supabase

---

# 54. PRODUCT SUCCESS METRICS

Target MVP:

* Average scan process <= 3 seconds.
* Attendance recording success rate >= 99%.
* Duplicate attendance prevention = 100%.
* QR recognition success rate >= 98% under normal lighting.
* System uptime target >= 99%.
* Critical attendance errors = 0.

---

# 55. FUTURE SECURITY IMPROVEMENT

Karena QR siswa bersifat fisik dan dapat difoto, versi berikutnya direkomendasikan menggunakan:

QR Code
+
Student Photo Verification
+
Optional Face Verification

Flow:

QR Scan
→ Find Student
→ Show Student Photo
→ Teacher Verification
→ Attendance

Advanced:

QR Scan
→ Face Verification
→ Attendance

---

# 56. PRODUCT PRINCIPLE

Sistem harus mengikuti tiga prinsip utama:

1. Simple for Students.
2. Fast for Teachers.
3. Powerful for Administrators.

Siswa hanya perlu membawa QR.

Guru hanya perlu melakukan scan.

Admin mendapatkan seluruh data absensi secara terstruktur.

---

# 57. FINAL CORE FLOW

STUDENT QR
↓
TEACHER SCAN
↓
REACT SCANNER
↓
NODE.JS API
↓
QR VALIDATION
↓
STUDENT VALIDATION
↓
SESSION VALIDATION
↓
DUPLICATE CHECK
↓
ATTENDANCE RECORD
↓
SUPABASE POSTGRESQL
↓
RESULT
↓
TEACHER DASHBOARD
↓
ADMIN DASHBOARD
↓
REPORT

---

# 58. FINAL TECHNOLOGY STACK

Frontend:
React.js

Styling:
Tailwind CSS

Routing:
React Router

HTTP:
Axios / Fetch

Scanner:
QR Scanner Library + Browser Camera API

QR Generator:
QR Code Library

Charts:
Recharts

Backend:
Node.js

API:
Express.js

Database:
Supabase PostgreSQL

Authentication:
Supabase Auth

Storage:
Supabase Storage

Security:
Supabase RLS + Node.js Validation

Excel:
XLSX

PDF:
PDF Generation Library

Frontend Deployment:
Vercel

Backend Deployment:
Railway / Render / VPS

Version Control:
Git + GitHub

---

# 59. PRODUCT STATEMENT

"Sistem Absensi Sekolah Berbasis QR Code merupakan platform absensi digital yang memungkinkan sekolah memberikan QR Code unik kepada setiap siswa. Guru melakukan scanning QR saat siswa datang, kemudian sistem secara otomatis memvalidasi identitas, mencatat waktu kehadiran, menentukan status absensi, dan menyimpan data ke dalam database. Admin dapat mengelola data siswa, guru, kelas, QR Code, sesi absensi, serta membuat laporan kehadiran secara terstruktur."

---

# 60. FINAL MVP FLOW

ADMIN:

Login
→ Tambah Kelas
→ Tambah Guru
→ Tambah Siswa
→ Generate QR
→ Cetak QR
→ Bagikan QR kepada Siswa

GURU:

Login
→ Pilih Kelas
→ Start Attendance
→ Buka Scanner
→ Scan QR Siswa
→ Sistem Validasi
→ Attendance Berhasil
→ Scanner Siap Scan Berikutnya
→ Close Attendance

ADMIN:

Dashboard
→ Monitor Absensi
→ Filter
→ Rekap
→ Export Excel/PDF

END.
