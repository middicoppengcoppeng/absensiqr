import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { qr_token, session_id } = await request.json();

    if (!qr_token) {
      return NextResponse.json({ success: false, message: 'Token QR tidak valid' }, { status: 400 });
    }

    // 1. Find Token & Student
    const { data: tokenData, error: tokenError } = await supabase
      .from('qr_tokens')
      .select('student_id, students (id, full_name, nis, class_id, classes(name))')
      .eq('token', qr_token)
      .eq('status', 'ACTIVE')
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ success: false, message: 'QR Code tidak terdaftar atau tidak aktif.' }, { status: 404 });
    }

    const student = tokenData.students as any;

    // For MVP: if session_id is provided, use it. Otherwise, look for an active session for the student's class
    let activeSessionId = session_id;
    let lateAfter = '07:15:00';
    
    if (!activeSessionId) {
      const { data: sessionData } = await supabase
        .from('attendance_sessions')
        .select('id, late_after')
        .eq('class_id', student.class_id)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (!sessionData) {
        return NextResponse.json({ success: false, message: 'Tidak ada sesi absensi aktif untuk kelas ini.' }, { status: 400 });
      }
      activeSessionId = sessionData.id;
      lateAfter = sessionData.late_after;
    }

    // 2. Check Duplicate Attendance
    const { data: existingAtt } = await supabase
      .from('attendances')
      .select('id')
      .eq('student_id', student.id)
      .eq('session_id', activeSessionId)
      .single();

    if (existingAtt) {
      return NextResponse.json({ success: false, message: 'Siswa sudah melakukan absensi.' }, { status: 409 });
    }

    // 3. Determine Status (HADIR or TERLAMBAT) based on current time
    // For simplicity, we just use JS Date for current time. In production, use DB time.
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString('en-GB', { hour12: false }); // "HH:MM:SS"
    const isLate = currentTimeStr > lateAfter;
    const attStatus = isLate ? 'TERLAMBAT' : 'HADIR';

    // 4. Insert Attendance
    const { error: insertError } = await supabase
      .from('attendances')
      .insert([{
        student_id: student.id,
        session_id: activeSessionId,
        scan_time: currentTimeStr,
        status: attStatus
      }]);

    if (insertError) {
      return NextResponse.json({ success: false, message: 'Gagal menyimpan absensi' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Absen berhasil',
      data: {
        student_name: student.full_name,
        nis: student.nis,
        class: student.classes?.name,
        time: currentTimeStr,
        status: attStatus
      }
    });

  } catch (error) {
    console.error('Scan API Error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
