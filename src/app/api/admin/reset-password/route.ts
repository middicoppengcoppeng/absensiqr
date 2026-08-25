import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'Password minimal 6 karakter.' }, { status: 400 });
    }

    // Update user password using admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (authError) {
      return NextResponse.json({ success: false, message: authError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password berhasil direset.',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
