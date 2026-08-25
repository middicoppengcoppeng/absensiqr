import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Uses Service Role Key - server only, never exposed to client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const { id, full_name, class_ids } = await request.json();

    if (!id || !full_name) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap.' }, { status: 400 });
    }

    // 1. Update profile (name)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ full_name })
      .eq('id', id);

    if (profileError) {
      return NextResponse.json({ success: false, message: 'Gagal memperbarui profil guru.' }, { status: 500 });
    }

    // 2. Update classes
    // First, remove this teacher from any classes they were previously assigned to
    const { error: resetError } = await supabaseAdmin
      .from('classes')
      .update({ homeroom_teacher_id: null })
      .eq('homeroom_teacher_id', id);

    if (resetError) {
      console.error('Error resetting classes:', resetError);
    }

    // Then, assign the new classes
    if (class_ids && Array.isArray(class_ids) && class_ids.length > 0) {
      const { error: assignError } = await supabaseAdmin
        .from('classes')
        .update({ homeroom_teacher_id: id })
        .in('id', class_ids);
      
      if (assignError) {
        console.error('Error assigning classes:', assignError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Data guru ${full_name} berhasil diperbarui.`,
    });

  } catch (error) {
    console.error('Update teacher error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
