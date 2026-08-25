# Design System — Sistem Absensi Sekolah

## 1. Overview

Web application untuk administrasi absensi sekolah berbasis QR Code.

Pengguna utama:

* Admin
* Guru

Siswa tidak menggunakan dashboard. Siswa hanya memiliki QR Code yang dicetak dan digunakan saat absensi.

Prioritas desain:

1. Scan QR secepat mungkin.
2. Informasi absensi mudah dibaca.
3. Dashboard admin padat informasi tetapi tidak ramai.
4. Tampilan konsisten di seluruh halaman.
5. Responsive untuk desktop dan mobile.
6. Feedback hasil scan harus terlihat jelas tanpa mengganggu alur scan berikutnya.

---

# 2. Design Direction

## Visual Style

Gunakan gaya:

* Clean
* Professional
* Minimal
* Dense but readable
* Neutral UI
* Subtle borders
* Small border radius
* Limited shadows

Hindari:

* Gradient berlebihan
* Glassmorphism
* Excessive rounded cards
* Neon colors
* Decorative blobs
* Animasi yang tidak diperlukan
* Dashboard dengan terlalu banyak card
* Font display/dekoratif

UI harus terasa seperti software administrasi sekolah, bukan landing page startup.

---

# 3. Color System

Gunakan warna dasar netral dengan satu warna primary.

## Primary

```text
Primary 600: #2563EB
Primary 700: #1D4ED8
Primary 500: #3B82F6
```

Digunakan untuk:

* Primary button
* Active navigation
* Links
* Focus state
* Selected state
* QR scanner action

## Neutral

```text
White:       #FFFFFF
Gray 50:     #F8FAFC
Gray 100:    #F1F5F9
Gray 200:    #E2E8F0
Gray 300:    #CBD5E1
Gray 400:    #94A3B8
Gray 500:    #64748B
Gray 600:    #475569
Gray 700:    #334155
Gray 800:    #1E293B
Gray 900:    #0F172A
```

## Semantic

### Success

```text
Green 600: #16A34A
Green 50:  #F0FDF4
```

### Warning

```text
Amber 600: #D97706
Amber 50:  #FFFBEB
```

### Error

```text
Red 600: #DC2626
Red 50:  #FEF2F2
```

### Info

```text
Blue 600: #2563EB
Blue 50:  #EFF6FF
```

---

# 4. Typography

Gunakan:

```text
Inter
```

Fallback:

```text
ui-sans-serif, system-ui, sans-serif
```

## Scale

### Page Title

```text
font-size: 24px
font-weight: 600
line-height: 32px
```

### Section Title

```text
font-size: 18px
font-weight: 600
line-height: 28px
```

### Body

```text
font-size: 14px
font-weight: 400
line-height: 20px
```

### Small

```text
font-size: 13px
line-height: 18px
```

### Caption

```text
font-size: 12px
line-height: 16px
```

### Large Number

Untuk statistik dashboard:

```text
font-size: 24px
font-weight: 600
line-height: 32px
```

Hindari penggunaan heading besar lebih dari 32px pada dashboard.

---

# 5. Spacing

Gunakan basis spacing 4px.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Default:

```text
Card padding: 20px
Page padding desktop: 32px
Page padding mobile: 16px
Section gap: 24px
Form field gap: 16px
Button gap: 8px
```

---

# 6. Border Radius

Gunakan radius kecil sampai sedang.

```text
sm: 4px
md: 6px
lg: 8px
xl: 12px
```

Default component:

```text
border-radius: 8px
```

Button:

```text
6px
```

Input:

```text
6px
```

QR card:

```text
8px
```

Hindari pill shape kecuali untuk status badge.

---

# 7. Borders

Default border:

```text
1px solid #E2E8F0
```

Input border:

```text
#CBD5E1
```

Hover:

```text
#94A3B8
```

Focus:

```text
#2563EB
```

Gunakan border lebih sering daripada shadow.

---

# 8. Shadows

Shadow hanya digunakan untuk elemen yang benar-benar membutuhkan elevation.

```text
Card:
0 1px 2px rgba(15, 23, 42, 0.05)

Modal:
0 10px 30px rgba(15, 23, 42, 0.12)
```

Sebagian besar card cukup menggunakan border.

---

# 9. Layout

## Desktop

Layout utama:

```text
┌──────────────────────────────────────────────┐
│ Sidebar │ Header                             │
│         ├────────────────────────────────────┤
│         │                                    │
│         │ Main Content                       │
│         │                                    │
│         │                                    │
└──────────────────────────────────────────────┘
```

Sidebar:

```text
Width: 240px
```

Main content:

```text
flex: 1
```

Header:

```text
Height: 64px
```

Content:

```text
padding: 32px
```

---

# 10. Sidebar

Sidebar hanya digunakan pada desktop/tablet.

Width:

```text
240px
```

Structure:

```text
[Logo]

Dashboard

MASTER DATA
  Siswa
  Guru
  Kelas
  Tahun Ajaran

ABSENSI
  Sesi Absensi
  Scan Absensi
  Riwayat

LAPORAN
  Laporan Absensi

SYSTEM
  Pengaturan

[User]
Logout
```

## Navigation Item

Height:

```text
40px
```

Padding:

```text
8px 12px
```

Icon:

```text
18px
```

Text:

```text
14px
```

Active state:

```text
background: #EFF6FF
color: #2563EB
```

Inactive:

```text
color: #475569
```

---

# 11. Mobile Navigation

Pada mobile sidebar berubah menjadi:

* Hamburger menu
* Drawer navigation

Header:

```text
height: 56px
```

Page padding:

```text
16px
```

---

# 12. Header

Header berisi:

Left:

* Page title atau breadcrumb.

Right:

* Notification.
* User avatar.
* User name.
* Dropdown.

Mobile:

* Menu button.
* Page title.
* User avatar.

---

# 13. Buttons

## Primary

```text
background: #2563EB
color: white
```

Height:

```text
36px
```

Padding:

```text
0 14px
```

Radius:

```text
6px
```

Font:

```text
14px / 500
```

## Secondary

```text
background: white
border: 1px solid #CBD5E1
color: #334155
```

## Danger

```text
background: #DC2626
color: white
```

## Ghost

```text
background: transparent
color: #475569
```

---

# 14. Button States

Setiap button harus memiliki:

* Default
* Hover
* Active
* Focus
* Disabled
* Loading

Loading:

```text
[Spinner] Menyimpan...
```

Button tidak boleh berubah ukuran saat loading.

---

# 15. Input

Height:

```text
40px
```

Radius:

```text
6px
```

Padding:

```text
0 12px
```

Label:

```text
font-size: 13px
font-weight: 500
```

Placeholder:

```text
#94A3B8
```

Error:

```text
border: #DC2626
```

Helper text:

```text
12px
color: #64748B
```

---

# 16. Select

Gunakan styling yang sama dengan input.

Contoh:

```text
Kelas
[ XI RPL 1          ▼ ]
```

---

# 17. Search

Search field:

```text
[ 🔍  Cari siswa... ]
```

Height:

```text
40px
```

Search harus dapat bekerja dengan:

* Nama
* NIS
* NISN

---

# 18. Table

Table digunakan untuk:

* Siswa
* Guru
* Kelas
* Absensi
* Sesi

Header:

```text
background: #F8FAFC
font-weight: 500
font-size: 12px
```

Row:

```text
min-height: 52px
```

Border:

```text
bottom: 1px solid #E2E8F0
```

Hover:

```text
background: #F8FAFC
```

Jangan menggunakan zebra stripes secara default.

---

# 19. Table Actions

Action column:

```text
[View] [Edit] [More]
```

Untuk mobile, action dapat menggunakan dropdown.

---

# 20. Status Badge

Status menggunakan badge.

## Hadir

```text
background: #F0FDF4
color: #15803D
```

Text:

```text
Hadir
```

## Terlambat

```text
background: #FFFBEB
color: #B45309
```

## Izin

```text
background: #EFF6FF
color: #1D4ED8
```

## Sakit

```text
background: #F1F5F9
color: #475569
```

## Alpa

```text
background: #FEF2F2
color: #B91C1C
```

---

# 21. Dashboard

Dashboard layout:

```text
Page Title
Subtitle

[Total Siswa] [Hadir] [Terlambat] [Belum Hadir]

┌──────────────────────┐ ┌──────────────────────┐
│ Attendance Chart     │ │ Attendance Summary   │
│                      │ │                      │
└──────────────────────┘ └──────────────────────┘

┌────────────────────────────────────────────────┐
│ Absensi Terbaru                                │
│                                                │
│ Table                                          │
└────────────────────────────────────────────────┘
```

Gunakan maksimal 4 statistic cards pada baris pertama.

---

# 22. Statistic Card

Structure:

```text
Label
Large number
Supporting information
```

Contoh:

```text
Hadir Hari Ini

485

dari 520 siswa
```

Icon boleh digunakan tetapi tidak wajib.

Jangan membuat icon memenuhi sebagian besar card.

---

# 23. Dashboard Chart

Chart default:

* Bar chart untuk perbandingan status.
* Line chart untuk trend kehadiran.

Chart harus memiliki:

* Label.
* Tooltip.
* Legend jika diperlukan.
* Empty state.

Hindari chart 3D.

---

# 24. Login Page

Desktop:

```text
┌──────────────────────┬──────────────────────────┐
│                      │                          │
│   SCHOOL BRANDING    │      LOGIN FORM          │
│                      │                          │
│                      │   Selamat datang         │
│                      │                          │
│                      │   Email                  │
│                      │   [________________]     │
│                      │                          │
│                      │   Password               │
│                      │   [________________]     │
│                      │                          │
│                      │   [      Login      ]    │
│                      │                          │
└──────────────────────┴──────────────────────────┘
```

Mobile:

Form menjadi full width.

Login tidak menggunakan ilustrasi besar.

---

# 25. Student Page

Header:

```text
Siswa

Kelola data siswa dan QR Code.
```

Actions:

```text
[ Import Excel ] [ Tambah Siswa ]
```

Toolbar:

```text
[ Cari siswa... ]

[ Kelas ▼ ] [ Status ▼ ]
```

Table:

```text
Foto
Nama
NIS
Kelas
Status
QR
Actions
```

---

# 26. Student Detail

Layout:

```text
← Kembali

┌───────────────────────────────┐
│ Foto                          │
│                               │
│ Ahmad Rizky                   │
│ NIS: 2401001                  │
│ Kelas: XI RPL 1               │
│ Status: Aktif                 │
└───────────────────────────────┘

Data Siswa

QR Code
```

Actions:

```text
[ Edit ]
[ Cetak QR ]
[ Regenerate QR ]
```

---

# 27. QR Management

Page:

```text
QR Code Siswa

[ Cari siswa... ] [ Kelas ▼ ]

[ Generate QR ] [ Cetak QR ]
```

Table:

```text
Nama
NIS
Kelas
QR Status
Generated At
Actions
```

Status:

```text
ACTIVE
REVOKED
```

---

# 28. QR Preview

Modal atau page:

```text
┌─────────────────────────────┐
│                             │
│        [ QR CODE ]          │
│                             │
│       Ahmad Rizky           │
│       2401001               │
│       XI RPL 1              │
│                             │
│ [ Download ] [ Print ]      │
└─────────────────────────────┘
```

QR harus memiliki quiet zone yang cukup.

---

# 29. Print QR

Print layout harus menggunakan ukuran A4.

Desktop preview:

```text
A4

┌──────────────┐ ┌──────────────┐
│    SCHOOL    │ │    SCHOOL    │
│              │ │              │
│   [ QR ]     │ │   [ QR ]     │
│              │ │              │
│ Ahmad Rizky  │ │ Budi Santoso │
│ XI RPL 1     │ │ XI RPL 1     │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│              │ │              │
│   [ QR ]     │ │   [ QR ]     │
│              │ │              │
└──────────────┘ └──────────────┘
```

Default:

```text
2 columns
```

Jumlah kartu dapat dikonfigurasi.

---

# 30. Attendance Session Page

Header:

```text
Sesi Absensi

[ + Buat Sesi ]
```

Table:

```text
Kelas
Tanggal
Mulai
Batas Terlambat
Status
Guru
Actions
```

Status:

```text
Draft
Active
Closed
```

---

# 31. Create Attendance Session

Form:

```text
Kelas
[ XI RPL 1 ▼ ]

Tanggal
[ 25/08/2026 ]

Jam Mulai
[ 06:30 ]

Batas Terlambat
[ 07:15 ]

Jam Selesai
[ 08:00 ]

[ Batal ] [ Buat Sesi ]
```

---

# 32. Scanner Page

Scanner adalah halaman paling penting untuk guru.

Desktop:

```text
┌────────────────────────────────────────────────────┐
│ Scan Absensi                                       │
│ XI RPL 1 · 25 Agustus 2026                        │
├────────────────────────────┬───────────────────────┤
│                            │                       │
│                            │  HADIR                │
│       CAMERA               │  28                   │
│                            │                       │
│       QR FRAME             │  TERLAMBAT            │
│                            │  2                    │
│                            │                       │
│                            │  BELUM HADIR          │
│                            │  2                    │
│                            │                       │
└────────────────────────────┴───────────────────────┘

Absensi Terbaru
```

Mobile:

```text
Scan Absensi

XI RPL 1
25 Agustus 2026

┌───────────────────┐
│                   │
│      CAMERA       │
│                   │
│    ┌─────────┐    │
│    │         │    │
│    │ QR AREA │    │
│    │         │    │
│    └─────────┘    │
│                   │
└───────────────────┘

Arahkan QR ke kamera

Hadir 28 · Terlambat 2
```

---

# 33. Scanner Behavior

Setelah QR berhasil dibaca:

1. Pause scanner.
2. Tampilkan hasil.
3. Mainkan feedback visual.
4. Simpan attendance.
5. Tunggu sekitar 1–1.5 detik.
6. Aktifkan scanner kembali.

Jangan meminta guru menekan tombol "Scan Lagi".

---

# 34. Scanner Success

Success state:

```text
┌───────────────────────┐
│          ✓            │
│                       │
│    ABSEN BERHASIL     │
│                       │
│    Ahmad Rizky        │
│    XI RPL 1           │
│                       │
│    07:02:21           │
│                       │
└───────────────────────┘
```

Gunakan warna success secara terbatas.

---

# 35. Scanner Late

```text
┌───────────────────────┐
│          !            │
│                       │
│      TERLAMBAT        │
│                       │
│    Ahmad Rizky        │
│    XI RPL 1           │
│                       │
│    07:31:12           │
│                       │
└───────────────────────┘
```

---

# 36. Scanner Duplicate

```text
SISWA SUDAH ABSEN

Ahmad Rizky
XI RPL 1

Absensi:
07:02:21

Scanner kembali aktif.
```

Gunakan warning state, bukan error penuh.

---

# 37. Scanner Invalid QR

```text
QR TIDAK VALID

QR Code tidak terdaftar.

Scanner kembali aktif.
```

Jangan menampilkan stack trace atau detail teknis.

---

# 38. Camera Permission

Jika browser menolak kamera:

```text
Kamera tidak tersedia

Izinkan akses kamera pada browser
untuk menggunakan scanner.

[ Coba Lagi ]
```

---

# 39. Attendance History

Header:

```text
Riwayat Absensi

[ Export ] 
```

Filters:

```text
Tanggal
Kelas
Status
Guru
```

Table:

```text
Tanggal
Jam
Nama
NIS
Kelas
Status
Guru
```

Mobile menggunakan card/list jika table terlalu lebar.

---

# 40. Reports

Report page:

```text
Laporan Absensi

[ Date Range ]

[ Kelas ▼ ]

[ Status ▼ ]

[ Terapkan ]

[ Export Excel ] [ Export PDF ]
```

Summary:

```text
Total Siswa
Hadir
Terlambat
Izin
Sakit
Alpa
```

---

# 41. Empty States

Empty state harus informatif dan singkat.

Contoh:

```text
Belum ada siswa

Tambahkan siswa untuk mulai mengelola data.

[ Tambah Siswa ]
```

Untuk absensi:

```text
Belum ada data absensi

Belum ada siswa yang melakukan absensi pada sesi ini.
```

Hindari ilustrasi besar.

---

# 42. Loading States

Gunakan skeleton untuk:

* Table.
* Dashboard cards.
* Chart.
* Detail page.

Untuk button gunakan spinner kecil.

Jangan mengganti seluruh halaman dengan spinner kecuali initial application load.

---

# 43. Modal

Modal:

```text
max-width: 480px
```

Padding:

```text
24px
```

Structure:

```text
Title
Description

Content

Actions
```

Actions berada di kanan pada desktop.

Mobile:

Actions dapat menjadi full width.

---

# 44. Confirmation Dialog

Untuk destructive action:

```text
Nonaktifkan siswa?

Ahmad Rizky tidak dapat melakukan absensi
setelah dinonaktifkan.

[ Batal ] [ Nonaktifkan ]
```

Delete tidak boleh dilakukan tanpa confirmation.

---

# 45. Toast

Position:

Desktop:

```text
top-right
```

Mobile:

```text
top-center
```

Duration:

```text
3–4 seconds
```

Jenis:

* Success
* Error
* Warning
* Info

---

# 46. Responsive Breakpoints

Gunakan Tailwind default breakpoint.

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Behavior:

### < 640px

Mobile layout.

### 640–1023px

Tablet layout.

### >= 1024px

Desktop layout.

---

# 47. Mobile Rules

Pada mobile:

* Sidebar menjadi drawer.
* Table dapat berubah menjadi card.
* Form menjadi satu kolom.
* Button utama full width jika diperlukan.
* Scanner menggunakan hampir seluruh lebar layar.
* Statistic cards menjadi 2 kolom.
* Chart menjadi satu kolom.
* Header dipadatkan.

---

# 48. Accessibility

Minimum requirements:

* Semua input memiliki label.
* Button dapat digunakan dengan keyboard.
* Focus state terlihat.
* Kontras text cukup.
* Icon button memiliki aria-label.
* Error message terkait dengan input.
* Jangan menggunakan warna sebagai satu-satunya indikator status.

Contoh:

Hadir:

```text
● Hadir
```

bukan hanya warna hijau.

---

# 49. Iconography

Gunakan satu icon library secara konsisten.

Recommended:

```text
Lucide React
```

Icon size:

```text
16px
18px
20px
24px
```

Jangan menggunakan emoji sebagai icon UI production.

---

# 50. Image Rules

Foto siswa:

```text
width: 40px
height: 40px
border-radius: 50%
object-fit: cover
```

Avatar default menggunakan inisial nama.

Logo sekolah harus memiliki ukuran konsisten.

---

# 51. QR Code Rules

QR harus:

* High contrast.
* Background putih.
* Tidak menggunakan gradient.
* Tidak dipotong.
* Memiliki quiet zone.
* Ukuran cukup besar untuk kamera.
* Memiliki token yang valid.

Minimal ukuran QR pada kartu:

```text
30mm × 30mm
```

Direkomendasikan:

```text
35mm × 35mm
```

---

# 52. Print CSS

Print page harus:

```text
@page {
  size: A4;
  margin: 10mm;
}
```

Saat print:

* Hide navigation.
* Hide buttons.
* Hide filters.
* Hide interactive elements.
* Tampilkan hanya kartu QR.

---

# 53. Tailwind Usage

Gunakan utility classes Tailwind.

Contoh card:

```text
bg-white
border
border-slate-200
rounded-lg
p-5
```

Contoh primary button:

```text
bg-blue-600
hover:bg-blue-700
text-white
rounded-md
px-4
py-2
```

Jangan membuat custom CSS untuk hal yang sudah dapat ditangani Tailwind.

Custom CSS hanya untuk:

* Print layout.
* Scanner frame.
* Complex animations.
* Third-party component overrides.

---

# 54. Component Library

Komponen reusable minimum:

```text
Button
Input
Select
Textarea
Modal
Dialog
Dropdown
Badge
Card
Table
Pagination
Tabs
Toast
Tooltip
Avatar
Breadcrumb
DatePicker
EmptyState
Skeleton
Spinner
Scanner
QRPreview
```

---

# 55. Page Inventory

## Authentication

* Login

## Admin

* Dashboard
* Students
* Student Detail
* Create Student
* Edit Student
* Teachers
* Classes
* Academic Years
* QR Management
* QR Print
* Attendance Sessions
* Attendance History
* Reports
* Settings

## Teacher

* Dashboard
* Attendance Session
* Scanner
* Today's Attendance
* Attendance History

---

# 56. Design Priorities

Priority 1:

Scanner.

Priority 2:

Attendance result.

Priority 3:

Student management.

Priority 4:

Dashboard.

Priority 5:

Reports.

Priority 6:

Secondary settings.

Jika terdapat trade-off antara visual dan kecepatan penggunaan scanner, prioritaskan kecepatan scanner.

---

# 57. Do

* Gunakan whitespace secukupnya.
* Gunakan border untuk grouping.
* Gunakan warna semantic.
* Gunakan typography konsisten.
* Gunakan reusable components.
* Berikan feedback setelah action.
* Optimalkan scanner untuk mobile.
* Tampilkan informasi siswa setelah scan.
* Gunakan loading state.
* Gunakan empty state.
* Gunakan confirmation untuk destructive actions.

---

# 58. Don't

* Jangan menggunakan gradient pada dashboard.
* Jangan menggunakan glassmorphism.
* Jangan menggunakan terlalu banyak warna.
* Jangan menggunakan card dengan radius sangat besar.
* Jangan menggunakan emoji sebagai icon utama.
* Jangan membuat sidebar terlalu lebar.
* Jangan menampilkan terlalu banyak statistik dalam satu layar.
* Jangan membuat scanner penuh dengan informasi yang tidak diperlukan.
* Jangan meminta guru klik "scan" setiap siswa.
* Jangan menggunakan animasi panjang.
* Jangan menggunakan modal untuk setiap action kecil.
* Jangan membuat table terlalu padat pada mobile.

---

# 59. Design Tokens Summary

```text
Primary:
#2563EB

Background:
#F8FAFC

Surface:
#FFFFFF

Border:
#E2E8F0

Text Primary:
#0F172A

Text Secondary:
#475569

Text Muted:
#64748B

Success:
#16A34A

Warning:
#D97706

Error:
#DC2626

Info:
#2563EB

Radius:
4px / 6px / 8px / 12px

Page Padding:
32px desktop
16px mobile

Sidebar:
240px

Header:
64px desktop
56px mobile

Base Font:
Inter

Base Font Size:
14px
```

---

# 60. Final Design Principle

Desain sistem harus terasa seperti aplikasi administrasi sekolah yang matang:

* cepat,
* jelas,
* konsisten,
* tidak dekoratif secara berlebihan,
* mudah dipelajari guru,
* mudah dikelola admin,
* dan fokus pada proses absensi.

Fitur paling penting adalah:

SCAN QR → VALIDATE → CATAT → FEEDBACK → SCAN BERIKUTNYA.
