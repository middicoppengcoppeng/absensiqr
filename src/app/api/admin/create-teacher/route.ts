import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    const { full_name, email, password, class_ids } = await request.json();

    if (!full_name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap.' }, { status: 400 });
    }

    // 1. Create auth user using admin API (bypasses email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ success: false, message: authError.message }, { status: 400 });
    }

    // 2. Insert profile with TEACHER role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: authData.user.id,
        full_name,
        email,
        role: 'TEACHER',
      }]);

    if (profileError) {
      // Rollback: delete the auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ success: false, message: 'Gagal menyimpan profil guru.' }, { status: 500 });
    }

    // 3. Update classes to assign this teacher as homeroom teacher
    if (class_ids && Array.isArray(class_ids) && class_ids.length > 0) {
      const { error: classesError } = await supabaseAdmin
        .from('classes')
        .update({ homeroom_teacher_id: authData.user.id })
        .in('id', class_ids);
      
      if (classesError) {
        console.error('Error assigning classes:', classesError);
        // Continue anyway since user is created, but log error
      }
    }

    return NextResponse.json({
      success: true,
      message: `Akun guru ${full_name} berhasil dibuat.`,
      data: { id: authData.user.id, email }
    });

  } catch (error) {
    console.error('Create teacher error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
