'use client';

import { useEffect, useState } from 'react';
import { User, Menu } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Header({ title }: { title: string }) {
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrator',
    TEACHER: 'Guru',
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <button
          onClick={() => window.dispatchEvent(new Event('toggleSidebar'))}
          className="mr-4 text-slate-500 hover:text-slate-800 md:hidden"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-4">

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-700">
              {profile?.full_name || 'Memuat...'}
            </p>
            <p className="text-xs text-slate-500">
              {profile ? (roleLabel[profile.role] || profile.role) : ''}
            </p>
          </div>
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
